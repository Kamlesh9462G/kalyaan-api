const mongoose = require("mongoose");

const betTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },

    description: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      enum: [
        "digit",
        "jodi",
        "panna",
        "sangam",
        "starline",
        "cycle"
      ],
      required: true
    },

    digitConfig: {
      digitLength: {
        type: Number,
        required: true
      },

      digitRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 9 }
      },

      pattern: {
        type: String,
        enum: [
          "ANY",
          "UNIQUE",
          "PAIR",
          "DOUBLE",
          "TRIPLE",
          "SINGLE_PANNA",
          "DOUBLE_PANNA",
          "TRIPLE_PANNA",
          "HALF_SANGAM",
          "FULL_SANGAM"
        ],
        default: "ANY"
      },

      allowRepeatDigits: {
        type: Boolean,
        default: true
      }
    },

    supportedSessions: {
      type: [String],
      enum: ["open", "close"],
      default: []   // ✅ VERY IMPORTANT FIX
    },

    inputFormat: {
      type: String,
      enum: [
        "single",
        "double",
        "triple",
        "panna_single",
        "panna",
        "sangam"
      ]
    },

    payout: {
      amount: {
        type: Number,
        required: true
      },

      multiplier: {
        type: Number,
        default: 10
      }
    },

    betLimit: {
      min: {
        type: Number,
        default: 1
      },

      max: {
        type: Number,
        default: 10000
      }
    },

    displayOrder: {
      type: Number,
      default: 1
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
    }

  },
  {
    timestamps: true,
    versionKey: false
  }
);

betTypeSchema.index({ code: 1, isDeleted: 1 });
betTypeSchema.index({ status: 1, isDeleted: 1 });
betTypeSchema.index({ category: 1 });

betTypeSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
});

betTypeSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

betTypeSchema.virtual("displayRate").get(function () {
  return `10 ka ${this.payout.amount * this.payout.multiplier}`;
});

module.exports = mongoose.model("BetType", betTypeSchema);