"use strict";
// Studio Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studioController_1 = require("../controllers/studioController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/studios', studioController_1.createStudio);
router.post('/studios/login', studioController_1.loginStudio);
router.get('/studios/me', authMiddleware_1.authMiddleware, studioController_1.getStudios);
router.put('/studios/me', authMiddleware_1.authMiddleware, studioController_1.updateStudio);
router.delete('/studios/me', authMiddleware_1.authMiddleware, studioController_1.deleteStudio);
exports.default = router;
