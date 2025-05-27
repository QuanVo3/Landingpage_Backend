const mongoose = require("mongoose");

const MiniAppOptions = new mongoose.Schema({
    showFacebook: { type: Boolean, default: false },
    showYouTube: { type: Boolean, default: false },
    showGioiThieu: { type: Boolean, default: false }
});

module.exports = mongoose.model("MiniAppOptions", MiniAppOptions)