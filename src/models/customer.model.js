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
        phone: {
            type: String,
            unique: true,
            sparse: true
        },

        // 🔹 AUTH (MPIN)
        mpin: {
            type: String,
            // required: true,
            select: false,        // never return MPIN
            // minlength: 4,
            // maxlength: 6
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
        // 🔹 REFERRAL SYSTEM
        referralCode: {
            type: String,
            unique: true,
            index: true
        },

        referredBy: {
            type: mongoose.Schema.Types.ObjectId,

        },

        referralCount: {
            type: Number,
            default: 0
        },

        // 🔹 WAGERING SYSTEM (ANTI-FRAUD)
        wagering: {
            totalDeposit: { type: Number, default: 0 },
            totalBetAmount: { type: Number, default: 0 },

            requiredWager: { type: Number, default: 0 },
            completedWager: { type: Number, default: 0 },

            isWagerCompleted: { type: Boolean, default: false },

            lockedAmount: { type: Number, default: 0 }
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

        isDepositBlocked: {
            type: Boolean,
            default: false
        },

        isWithdrawBlocked: {
            type: Boolean,
            default: false
        },

        deletedAt: Date
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// /* 🔐 INDEXES */
// customerSchema.index({ email: 1, isDeleted: 1 });
// customerSchema.index({ status: 1, isDeleted: 1 });

// /* 🔐 HASH MPIN */
// customerSchema.pre('save', async function (next) {
//   if (this.isModified('mpin') && this.mpin) {
//     this.mpin = await bcrypt.hash(this.mpin, 10);
//   }
// //   next();
// });

// /* 🔐 METHODS */
// customerSchema.methods.verifyMpin = function (mpin) {
//     return bcrypt.compare(mpin, this.mpin);
// };

// customerSchema.methods.resetMpin = function (newMpin) {
//     this.mpin = newMpin;
//     this.mpinSetAt = new Date();
//     return this.save();
// };

// customerSchema.methods.softDelete = function () {
//     this.isDeleted = true;
//     this.deletedAt = new Date();
//     this.status = "blocked";
//     return this.save();
// };

// /* 🔐 VIRTUAL */
// customerSchema.virtual("isPlayable").get(function () {
//     return this.status === "active" && !this.isDeleted;
// });

customerSchema.pre("save", async function () {
    if (this.isNew && !this.referralCode) {
        const random = Math.floor(1000 + Math.random() * 9000);
        this.referralCode = (this.email?.slice(0, 3) || "USR").toUpperCase() + random;
    }

    // if (this.isModified("mpin") && this.mpin) {
    //     this.mpin = await bcrypt.hash(this.mpin, 10);
    // }

    // next();
});

module.exports = mongoose.model("Customer", customerSchema);