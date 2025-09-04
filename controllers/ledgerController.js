const Ledger = require('../models/ledgerModel');
const Customer = require('../models/customerModel'); // لو هنعمل populate لاسم العميل

// GET all ledgers (filters + search + pagination)
const getAll = async (req, res) => {
  try {
    const { type, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    // فلترة حسب النوع
    if (type) filter.type = type;

    // فلترة حسب التاريخ
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    // البحث النصي
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Ledger.countDocuments(filter);

    const ledgers = await Ledger.find(filter)
      .populate('customer', 'name') // لو عندك علاقة Customer
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: ledgers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ledger by ID
const getById = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id).populate('customer', 'name');
    if (!ledger) return res.status(404).json({ message: 'Ledger entry not found' });
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE ledger entry
const create = async (req, res) => {
  try {
    const { type, amount, description, reference, customer } = req.body;

    const ledger = new Ledger({
      type,
      amount,
      description,
      reference,
      customer, // اختياري، لو مرتبط بعميل
      createdBy: req.user.id,
    });

    const savedLedger = await ledger.save();
    res.status(201).json(savedLedger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ledger entry
const update = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const updatedLedger = await Ledger.findByIdAndUpdate(
      req.params.id,
      { amount, description },
      { new: true }
    );

    if (!updatedLedger) return res.status(404).json({ message: 'Ledger entry not found' });

    res.json(updatedLedger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ledger entry
const remove = async (req, res) => {
  try {
    const deletedLedger = await Ledger.findByIdAndDelete(req.params.id);

    if (!deletedLedger) return res.status(404).json({ message: 'Ledger entry not found' });

    res.json({ message: 'Ledger entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
