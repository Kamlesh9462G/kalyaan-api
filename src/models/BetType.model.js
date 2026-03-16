const mongoose = require("mongoose");

const betTypeSchema = new mongoose.Schema(
{
  // BASIC INFO
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

  // GAME CATEGORY
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

  // DIGIT CONFIGURATION
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

  // SESSION SUPPORT
  supportedSessions: {
    type: [String],
    enum: ["open", "close"],
    default: ["open", "close"]
  },

  // INPUT STRUCTURE
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

  // RATE CONFIG (DEFAULT)
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

  // BET LIMITS
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

  // ORDERING IN ADMIN PANEL
  displayOrder: {
    type: Number,
    default: 1
  },

  // STATE
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    index: true
  },

  // SOFT DELETE
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },

  deletedAt: {
    type: Date,
    default: null
  },

  // AUDIT
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

/* INDEXES */
betTypeSchema.index({ code: 1, isDeleted: 1 });
betTypeSchema.index({ status: 1, isDeleted: 1 });
betTypeSchema.index({ category: 1 });

/* PRE SAVE */
betTypeSchema.pre("save", function(next){

  if(!this.slug){
    this.slug = this.name.toLowerCase().replace(/\s+/g,"-");
  }

  // next();

});

/* METHODS */

betTypeSchema.methods.softDelete = function(){

  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";

  return this.save();

};

/* VIRTUAL */

betTypeSchema.virtual("displayRate").get(function(){
  return `10 ka ${this.payout.amount * this.payout.multiplier}`;
});

module.exports = mongoose.model("BetType", betTypeSchema);