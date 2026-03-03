import mongoose from "mongoose";

const digitRuleSchema = new mongoose.Schema(
  {
    betTypeCode: {
      type: String,
      required: true,    // SINGLE, JODI
      uppercase: true,
      unique: true
    },

    allowedDigits: {
      type: [String],   // ["0","1","2"...]
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    removedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("DigitRule", digitRuleSchema);