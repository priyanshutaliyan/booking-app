const Category = require('../models/Category.js');

const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.create({ name, icon, description });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createCategory, getCategories };
