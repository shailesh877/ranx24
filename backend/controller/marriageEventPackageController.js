import MarriageEventPackage from '../model/MarriageEventPackage.js';

// GET all active marriage event packages
export const getMarriageEventPackages = async (req, res) => {
  try {
    const packages = await MarriageEventPackage.find({ is_active: true })
      .sort({ created_at: -1 })
      .lean();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching marriage event packages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single package by ID
export const getMarriageEventPackageById = async (req, res) => {
  try {
    const pkg = await MarriageEventPackage.findById(req.params.id).lean();
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    console.error('Error fetching marriage event package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
