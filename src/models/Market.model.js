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
      closeTime: {
        type: String,
        required: true,
        match: [timeRegex, "Invalid close time format (HH:mm)"]
      }
    },

    // 🔹 MARKET STATE
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true
    },

    // 🔹 WEEKLY OFF / HOLIDAY SUPPORT
    weeklyOff: {
      type: [String],               // ["Sunday"]
      default: []
    },

    isHoliday: {
      type: Boolean,
      default: false
    },

    // 🔹 AUTO CONTROL FLAGS
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
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

marketSchema.pre("save", async function () {
  // slug auto-generate
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }

  // timing validation
  if (this.timings.openTime >= this.timings.closeTime) {
    throw new Error("Open time must be before close time");
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