const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { resultService } = require('../../services/index')

const declareOpenResult = catchAsync(async (req, res) => {
    try {

        const { marketId, date, openPanna } = req.body;

        if (!marketId || !date || !openPanna) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                message: 'marketId, date and openPanna required'
            });
        }

        if (!/^[0-9]{3}$/.test(openPanna)) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                message: 'Invalid open panna'
            });
        }

        const result = await resultService.declareOpenResult({
            marketId,
            date,
            openPanna
        });

        res.status(httpStatus.status.OK).json({
            message: 'Open result declared successfully',
            data: result
        });

    } catch (error) {

        res.status(httpStatus.status.BAD_REQUEST).json({
            message: error.message
        });

    }
});
const declareCloseResult = async (req, res) => {
    try {

        const { marketId, date, closePanna } = req.body;

        if (!marketId || !date || !closePanna) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                message: 'marketId, date and closePanna required'
            });
        }

        if (!/^[0-9]{3}$/.test(closePanna)) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                message: 'Invalid close panna'
            });
        }

        const result = await resultService.declareCloseResult({
            marketId,
            date,
            closePanna
        });

        res.status(httpStatus.status.OK).json({
            message: 'Close result declared successfully',
            data: result
        });

    } catch (error) {

        res.status(httpStatus.status.BAD_REQUEST).json({
            message: error.message
        });

    }
};

module.exports = {
    declareOpenResult,
    declareCloseResult
}