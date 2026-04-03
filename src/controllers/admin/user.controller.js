// controllers/user.controller.js
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');

const { userService } = require("../../services/index");
const { generateToken } = require("../../utils/jwt");

const login = catchAsync(async (req, res) => {
    try {
        const user = await userService.loginUser(req.body);

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const createAdmin = catchAsync(async (req, res) => {
    try {
        const admin = await userService.createAdmin({
            ...req.body,
            // createdBy: req.user._id
        });

        res.json({
            success: true,
            message: "Admin created",
            data: admin
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = {
    login,
    createAdmin
};