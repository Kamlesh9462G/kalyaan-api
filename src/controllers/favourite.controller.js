const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { favouriteService } = require("../services");



/**
 * ✅ Add / Update Favourite
 */
const addFavourite = catchAsync(async (req, res) => {
    const result = await favouriteService.addFavourite({
        customerId: req.customer.customerId,
        body: req.body,
    });

    res.status(httpStatus.status.CREATED).send({
        success: true,
        status: httpStatus.status.CREATED,
        message: "Favourite saved successfully",
        data: result,
    });
});

/**
 * 📥 Get Favourites
 */
const getFavourites = catchAsync(async (req, res) => {
    const result = await favouriteService.getFavourites({
        customerId: req.customer.customerId,
        query: req.query,
    });

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Favourites fetched successfully",
        ...result,
    });
});

/**
 * ✏️ Update Favourite
 */
const updateFavourite = catchAsync(async (req, res) => {
    const result = await favouriteService.updateFavourite({
        customerId: req.customer.customerId,
        favouriteId: req.params.id,
        body: req.body,
    });

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Favourite updated successfully",
        data: result,
    });
});

/**
 * ❌ Delete Favourite
 */
const deleteFavourite = catchAsync(async (req, res) => {
    await favouriteService.deleteFavourite({
        customerId: req.customer.customerId,
        favouriteId: req.params.id,
    });

    res.status(httpStatus.status.OK).send({
        success: true,
        status: httpStatus.status.OK,
        message: "Favourite deleted successfully",
    });
});

module.exports = {
    addFavourite,
    getFavourites,
    updateFavourite,
    deleteFavourite,
};