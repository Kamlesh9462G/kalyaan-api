const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Favourite } = require("../models");

/**
 * 🔍 Validate number
 */
const validateNumber = (type, value) => {
    switch (type) {
        case "OPEN_DIGIT":
        case "CLOSE_DIGIT":
            return /^[0-9]$/.test(value);

        case "OPEN_PANNA":
        case "CLOSE_PANNA":
            return /^[0-9]{3}$/.test(value);

        default:
            return false;
    }
};

/**
 * 🔄 Normalize numbers (object → array)
 */
const normalizeNumbers = (numbers) => {
    if (Array.isArray(numbers)) return numbers;

    const mapped = [];

    if (numbers.openPanna)
        mapped.push({ type: "OPEN_PANNA", value: numbers.openPanna });

    if (numbers.openDigit)
        mapped.push({ type: "OPEN_DIGIT", value: numbers.openDigit });

    if (numbers.closePanna)
        mapped.push({ type: "CLOSE_PANNA", value: numbers.closePanna });

    if (numbers.closeDigit)
        mapped.push({ type: "CLOSE_DIGIT", value: numbers.closeDigit });

    return mapped;
};

/**
 * ✅ Add Favourite (UPSERT)
 */
const addFavourite = async ({ customerId, body }) => {
    const { marketId, date, numbers } = body;

    // ❗ Required fields
    if (!marketId) throw new ApiError(httpStatus.BAD_REQUEST, "marketId is required");
    if (!date) throw new ApiError(httpStatus.BAD_REQUEST, "date is required");
    if (!numbers) throw new ApiError(httpStatus.BAD_REQUEST, "numbers are required");

    const parsedDate = new Date(date);
    if (isNaN(parsedDate))
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");

    const normalizedNumbers = normalizeNumbers(numbers);

    if (!normalizedNumbers.length)
        throw new ApiError(httpStatus.BAD_REQUEST, "At least one number required");

    // ❗ Duplicate type check
    const types = normalizedNumbers.map((n) => n.type);
    if (types.length !== new Set(types).size)
        throw new ApiError(httpStatus.BAD_REQUEST, "Duplicate number types not allowed");

    // ❗ Validate values
    for (const num of normalizedNumbers) {
        if (!validateNumber(num.type, num.value)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Invalid value for ${num.type}`
            );
        }
    }

    // ✅ UPSERT
    const favourite = await Favourite.findOneAndUpdate(
        { customerId, marketId, date: parsedDate },
        { $set: { numbers: normalizedNumbers } },
        { new: true, upsert: true }
    );

    return favourite;
};

/**
 * 📥 Get Favourites
 */
const getFavourites = async ({ customerId, query }) => {
    const { marketId, date, page = 1, limit = 10 } = query;

    const filter = { customerId, isDeleted: false };

    if (marketId) filter.marketId = marketId;
    if (date) filter.date = new Date(date);

    const skip = (page - 1) * limit;

    const data = await Favourite.find(filter)
        .populate("marketId", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit));

        console.log(filter)
    const total = await Favourite.countDocuments(filter);

    return {
        data,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * ✏️ Update Favourite
 */
const updateFavourite = async ({ customerId, favouriteId, body }) => {
    const favourite = await Favourite.findOne({
        _id: favouriteId,
        customerId,
        isDeleted: false,
    });

    if (!favourite)
        throw new ApiError(httpStatus.NOT_FOUND, "Favourite not found");

    const normalizedNumbers = normalizeNumbers(body.numbers);

    if (normalizedNumbers) {
        const types = normalizedNumbers.map((n) => n.type);
        if (types.length !== new Set(types).size)
            throw new ApiError(httpStatus.BAD_REQUEST, "Duplicate types");

        for (const num of normalizedNumbers) {
            if (!validateNumber(num.type, num.value)) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    `Invalid value for ${num.type}`
                );
            }
        }

        favourite.numbers = normalizedNumbers;
    }

    await favourite.save();
    return favourite;
};

/**
 * ❌ Delete Favourite (Soft Delete)
 */
const deleteFavourite = async ({ customerId, favouriteId }) => {
    const favourite = await Favourite.findOne({
        _id: favouriteId,
        customerId,
        isDeleted: false,
    });

    if (!favourite)
        throw new ApiError(httpStatus.NOT_FOUND, "Favourite not found");

    favourite.isDeleted = true;
    await favourite.save();
};

module.exports = {
    addFavourite,
    getFavourites,
    updateFavourite,
    deleteFavourite,
};