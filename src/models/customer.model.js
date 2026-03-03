const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
    {
        // 🔹 BASIC INFO
        name: {
            type: String,
            //   required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        // 🔹 AUTH (MPIN)
        mpin: {
            type: String,
            // required: true,
            select: false,        // never return MPIN
            minlength: 4,
            maxlength: 6
        },

        mpinSetAt: {
            type: Date,
            default: Date.now
        },

        // 🔹 WALLET
        walletBalance: {
            type: Number,
            default: 0,
            min: 0
        },

        // 🔹 ACCOUNT STATUS
        status: {
            type: String,
            enum: ["active", "blocked", "suspended"],
            default: "active",
            index: true
        },

        // 🔹 SECURITY
        lastLoginAt: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },

        // 🔹 SOFT DELETE
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },

        deletedAt: Date
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/* 🔐 INDEXES */
customerSchema.index({ email: 1, isDeleted: 1 });
customerSchema.index({ status: 1, isDeleted: 1 });

/* 🔐 HASH MPIN */
customerSchema.pre('save', async function (next) {
  if (this.isModified('mpin') && this.mpin) {
    this.mpin = await bcrypt.hash(this.mpin, 10);
  }
//   next();
});

/* 🔐 METHODS */
customerSchema.methods.verifyMpin = function (mpin) {
    return bcrypt.compare(mpin, this.mpin);
};

customerSchema.methods.resetMpin = function (newMpin) {
    this.mpin = newMpin;
    this.mpinSetAt = new Date();
    return this.save();
};

customerSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.status = "blocked";
    return this.save();
};

/* 🔐 VIRTUAL */
customerSchema.virtual("isPlayable").get(function () {
    return this.status === "active" && !this.isDeleted;
});

module.exports = mongoose.model("Customer", customerSchema);