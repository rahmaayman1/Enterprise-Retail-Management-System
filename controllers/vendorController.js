const Vendor = require('../models/vendorModel');
const logger = require('../utils/logger');

//Get all vendor
const getAll = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor by ID
const getById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create vendor
const create = async (req, res) => {
  try {
    const { name, phone, email, address, taxNumber, openingBalance } = req.body;

    const existingVendor = await Vendor.findOne({ name });
    if (existingVendor) return res.status(400).json({ message: 'Vendor already exists' });

    const vendor = await Vendor.create({ name, phone, email, address, taxNumber, openingBalance });
    res.status(201).json({ message: 'Vendor created successfully', vendor });

    logger.info(`Vendor created: ${name} by ${req.user.id}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update vendor
const update = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    Object.assign(vendor, req.body);
    const updatedVendor = await vendor.save();

    res.json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    logger.info(`Vendor updated: ${vendor.name} by ${req.user.id}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete vendor
const remove = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await vendor.deleteOne();
    res.json({ message: 'Vendor deleted successfully' });
    logger.info(`Vendor deleted: ${vendor.name} by ${req.user.id}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
