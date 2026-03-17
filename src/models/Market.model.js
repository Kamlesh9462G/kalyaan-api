const mongoose = require("mongoose");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const marketSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },

    // 🔹 TIMINGS
    timings: {
      openTime: {
        type: String,
        required: true,
        match: [timeRegex, "Invalid open time format (HH:mm)"]
      },

      openResultTime: {
        type: String,
        required: true,
        match: [timeRegex, "Invalid open result time format (HH:mm)"]
      },

      closeTime: {
        type: String,
        required: true,
        match: [timeRegex, "Invalid close time format (HH:mm)"]
      },

      closeResultTime: {
        type: String,
        required: true,
        match: [timeRegex, "Invalid close result time format (HH:mm)"]
      }
    },

    // 🔹 MARKET STATE
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true
    },

    // 🔹 WEEKLY OFF
    weeklyOff: {
      type: [String],
      default: []
    },

    isHoliday: {
      type: Boolean,
      default: false
    },

    // 🔹 AUTO CONTROL
    autoOpenClose: {
      type: Boolean,
      default: true
    },

    // 🔹 SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    },

    // 🔹 AUDIT
    createdBy: {
      type: mongoose.Schema.Types.ObjectId
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔐 INDEXES */
marketSchema.index({ name: 1, isDeleted: 1 });
marketSchema.index({ status: 1, isDeleted: 1 });

/* 🔐 VALIDATION */
marketSchema.pre("save", async function () {

  // slug auto generate
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }

  const {
    openTime,
    openResultTime,
    closeTime,
    closeResultTime
  } = this.timings;

  if (openTime >= openResultTime) {
    throw new Error("Open result time must be after open time");
  }

  if (openResultTime >= closeTime) {
    throw new Error("Close time must be after open result time");
  }

  if (closeTime >= closeResultTime) {
    throw new Error("Close result time must be after close time");
  }

});

/* 🔐 SOFT DELETE METHOD */
marketSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/* 🔐 VIRTUAL */
marketSchema.virtual("isTradable").get(function () {
  return (
    this.status === "active" &&
    !this.isDeleted &&
    !this.isHoliday
  );
});

module.exports = mongoose.model("Market", marketSchema);