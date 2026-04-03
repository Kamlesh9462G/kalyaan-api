// services/user.service.js
const bcrypt = require("bcrypt");
const {User} = require("../models/index");

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error("Invalid credentials");

    return user;
};

const createAdmin = async ({ name, email }) => {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(
        "Admin@9462",
        10
    );

    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
    });

    return admin;
};

module.exports = {
    loginUser,
    createAdmin
};