"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginStudio = exports.deleteStudio = exports.updateStudio = exports.getStudioById = exports.getStudios = exports.createStudio = void 0;
const Studio_1 = require("../models/Studio");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createStudio = (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt_1.default.hashSync(password, 10);
    const userToCreate = {
        name,
        email,
        password: hashedPassword,
    };
    Studio_1.Studio.create(userToCreate)
        .then((studio) => {
        res.status(201).json({ studio });
    })
        .catch((error) => {
        var _a, _b;
        console.error('Error creating studio:', error);
        if ((error === null || error === void 0 ? void 0 : error.name) === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(400).json({
            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Failed to create studio',
            details: (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map((e) => e.message),
        });
    });
};
exports.createStudio = createStudio;
const getStudios = (req, res) => {
    var _a;
    const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Studio_1.Studio.findByPk(studioId)
        .then((studio) => {
        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }
        res.status(200).json({ studio: {
                id: studio.id,
                name: studio.name,
                email: studio.email
            } });
    })
        .catch((error) => {
        console.error('Error fetching studio:', error);
        res.status(500).json({ error: 'Failed to fetch studio' });
    });
};
exports.getStudios = getStudios;
const getStudioById = (req, res) => {
    var _a;
    const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Studio_1.Studio.findByPk(studioId)
        .then((studio) => {
        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }
        res.status(200).json({ studio });
    })
        .catch((error) => {
        console.error('Error fetching studio:', error);
        res.status(500).json({ error: 'Failed to fetch studio' });
    });
};
exports.getStudioById = getStudioById;
const updateStudio = (req, res) => {
    var _a;
    const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Studio_1.Studio.findByPk(studioId)
        .then((studio) => {
        if (!studio) {
            res.status(404).json({ error: 'Studio not found' });
            return;
        }
        const { name, email, password } = req.body;
        const updatedStudio = {
            name,
            email,
            password: password ? bcrypt_1.default.hashSync(password, 10) : studio.password,
        };
        return studio.update(updatedStudio);
    })
        .then((studio) => {
        if (studio) {
            res.status(200).json({ studio: {
                    id: studio.id,
                    name: studio.name,
                    email: studio.email
                } });
        }
    })
        .catch((error) => {
        console.error('Error updating studio:', error);
        res.status(500).json({ error: 'Failed to update studio' });
    });
};
exports.updateStudio = updateStudio;
const deleteStudio = (req, res) => {
    var _a;
    const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Studio_1.Studio.destroy({
        where: {
            id: studioId,
        },
    })
        .then((deleted) => {
        if (deleted) {
            res.status(200).json({
                message: `Studio deleted successfully`,
            });
        }
        else {
            res.status(404).json({ error: 'Studio not found' });
        }
    })
        .catch((error) => {
        console.error('Error deleting studio:', error);
        res.status(500).json({ error: 'Failed to delete studio' });
    });
};
exports.deleteStudio = deleteStudio;
const loginStudio = (req, res) => {
    const { email, password } = req.body;
    Studio_1.Studio.findOne({ where: { email } })
        .then((studio) => {
        if (!studio) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = bcrypt_1.default.compareSync(password, studio.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: studio.id,
            email: studio.email,
            name: studio.name,
        }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        return res.status(200).json({
            message: 'Login successful',
            token,
            studio: {
                id: studio.id,
                name: studio.name,
                email: studio.email,
            },
        });
    })
        .catch((error) => {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Failed to login' });
    });
};
exports.loginStudio = loginStudio;
