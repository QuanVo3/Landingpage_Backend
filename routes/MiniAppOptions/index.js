const express = require("express");
const MiniAppOptions = require("../../models/MiniAppOptions");

const router = express.Router();

//Get MiniAppOptions
router.get("/", async (req, res) => {
    try {
        const options = await MiniAppOptions.findOne();
        if (!options) {
            return res.status(404).json({ message: "Không tìm thấy cấu hình." });
        }
        res.json(options)
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy cấu hình", error });
    }
});

//Put MiniAppOptions
router.put("/", async (req, res) => {
    try {
        const updatedOptions = await MiniAppOptions.findOneAndUpdate(
            {},
            {
                showFacebook: req.body.showFacebook,
                showYouTube: req.body.showYouTube,
                showIntroduction: req.body.showIntroduction
            },
            { new: true, upsert: true }
        );
        res.json(updatedOptions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi cập nhật cấu hình.", error });
    }
});

//Post MiniAppOptions
router.post("/init", async (req, res) => {
    try {
        const existing = await MiniAppOptions.findOne();
        if (existing) {
            return res.status(400).json({ message: "Cấu hình đã tồn tại." });
        }
        const defaultOptions = new MiniAppOptions();
        await defaultOptions.save();
        res.status(201).json(defaultOptions);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi khởi tạo cấu hình mặc định. ", error })
    }
});

module.exports = router;