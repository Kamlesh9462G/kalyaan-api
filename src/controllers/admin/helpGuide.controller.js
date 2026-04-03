const {helpGuideService} = require("../../services/index");

// CREATE
exports.createHelpGuide = async (req, res) => {
    const data = await helpGuideService.createHelpGuide(req.body);
    res.json({ success: true, data });
};

// GET
exports.getHelpGuide = async (req, res) => {
    const data = await helpGuideService.getHelpGuide();

    // ✅ Filter hidden fields before sending to app
    // const filtered = filterHidden(data);

    res.json({ success: true, data: data });
};

// UPDATE
exports.updateHelpGuide = async (req, res) => {
    const data = await helpGuideService.updateHelpGuide(req.params.id, req.body);
    res.json({ success: true, data });
};

// DELETE
exports.deleteHelpGuide = async (req, res) => {
    await helpGuideService.deleteHelpGuide(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
};

// QUICK GUIDE
exports.addQuickGuide = async (req, res) => {
    const data = await helpGuideService.addQuickGuide(req.params.id, req.body);
    res.json({ success: true, data });
};

exports.updateQuickGuide = async (req, res) => {
    const data = await helpGuideService.updateQuickGuide(
        req.params.id,
        req.params.qId,
        req.body
    );
    res.json({ success: true, data });
};

exports.deleteQuickGuide = async (req, res) => {
    const data = await helpGuideService.deleteQuickGuide(
        req.params.id,
        req.params.qId
    );
    res.json({ success: true, data });
};