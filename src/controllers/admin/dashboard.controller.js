const { dashboardService } = require("../../services/index");
const getDashboardStats = async (req, res) => {
    try {
        const stats = await dashboardService.getDashboardStats(req.query);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats
};