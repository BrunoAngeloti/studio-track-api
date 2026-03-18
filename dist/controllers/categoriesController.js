"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const Category_1 = require("../models/Category");
const createCategory = (req, res) => {
    var _a;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    const { name, color } = req.body;
    if (studio_id === undefined) {
        res.status(400).json({ error: 'Studio ID is required' });
        return;
    }
    Category_1.Category.create({
        name,
        color,
        studio_id
    })
        .then((category) => {
        res.status(201).json({ category });
    })
        .catch((error) => {
        var _a, _b;
        console.error('Error creating category:', error);
        res.status(400).json({
            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Failed to create category',
            details: (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map((e) => e.message),
        });
    });
};
exports.createCategory = createCategory;
const getCategories = (req, res) => {
    var _a;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Category_1.Category.findAll({
        where: { studio_id },
        order: [['name', 'ASC']]
    })
        .then((categories) => {
        res.status(200).json(categories);
    })
        .catch((error) => {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            error: 'Failed to fetch categories'
        });
    });
};
exports.getCategories = getCategories;
const getCategoryById = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Category_1.Category.findOne({
        where: {
            id,
            studio_id
        }
    })
        .then((category) => {
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.status(200).json({ category });
    })
        .catch((error) => {
        console.error('Error fetching category:', error);
        res.status(500).json({
            error: 'Failed to fetch category'
        });
    });
};
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    const { name, color } = req.body;
    Category_1.Category.findOne({
        where: {
            id,
            studio_id
        }
    })
        .then((category) => {
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        return category.update({
            name,
            color
        });
    })
        .then((updatedCategory) => {
        if (!updatedCategory)
            return;
        res.status(200).json({
            category: updatedCategory
        });
    })
        .catch((error) => {
        var _a, _b;
        console.error('Error updating category:', error);
        res.status(400).json({
            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Failed to update category',
            details: (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map((e) => e.message),
        });
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Category_1.Category.findOne({
        where: {
            id,
            studio_id
        }
    })
        .then((category) => {
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        return category.destroy();
    })
        .then((deleted) => {
        if (!deleted)
            return;
        res.status(200).json({
            message: 'Category deleted successfully'
        });
    })
        .catch((error) => {
        console.error('Error deleting category:', error);
        res.status(500).json({
            error: 'Failed to delete category'
        });
    });
};
exports.deleteCategory = deleteCategory;
