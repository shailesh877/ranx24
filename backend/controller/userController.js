import mongoose from 'mongoose';
import User from '../model/User.js';
import UserMembership from '../model/UserMembership.js';
import UserAMC from '../model/UserAMC.js';
import MembershipPlan from '../model/MembershipPlan.js';
import UserAMCPlan from '../model/AMCPlan.js';


export const loginUser = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (user) {
      // In a real app, you'd compare passwords here
      // For now, just return a dummy token if user exists
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        token: 'dummy-jwt-token-for-user', // Replace with actual JWT generation
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or user not found' });
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enrich with active membership (Using RAW connection to bypass Mongoose casting issues)
    const db = mongoose.connection.db;

    // Find ALL active memberships for the user
    // User can have multiple active plans (Gold + Silver) correctly as requested
    const membershipsRaw = await db.collection('memberships').find({
      $or: [
        { customer_id: user._id },
        { customer_id: user._id.toString() }
      ],
      status: { $regex: /^active$/i }
    }).toArray();

    const memberships = await Promise.all(membershipsRaw.map(async (m) => {
        // Find plan manually
        let plan = null;
        if (m.plan_id) {
            plan = await db.collection('membership_plans').findOne({
                $or: [
                    { _id: m.plan_id },
                    { _id: m.plan_id.toString() },
                    { _id: (typeof m.plan_id === 'string' && m.plan_id.length === 24) ? new mongoose.Types.ObjectId(m.plan_id) : m.plan_id }
                ]
            });
        }
        // Generate card_number if missing (Backfill for old accounts or manual DB entries)
        if (!m.card_number) {
            const generatedCard = Math.floor(10000000000 + Math.random() * 90000000000).toString();
            // Update database directly (raw collection update)
            await db.collection('memberships').updateOne(
                { _id: m._id }, 
                { $set: { card_number: generatedCard } }
            );
            m.card_number = generatedCard;
        }

        return {
            ...m,
            planName: plan?.name || 'Active Plan',
            planDetails: plan
        };
    }));

    // Find ALL active AMCs for the user using the correct 'amcs' collection name
    const amcsRaw = await db.collection('amcs').find({
      $or: [
        { customer_id: user._id },
        { customer_id: user._id.toString() }
      ],
      status: { $regex: /^active$/i }
    }).toArray();

    const amcs = await Promise.all(amcsRaw.map(async (a) => {
        let plan = null;
        if (a.plans && a.plans.length > 0) {
            plan = await db.collection('amc_plans').findOne({
                $or: [
                    { _id: a.plans[0] },
                    { _id: a.plans[0].toString() },
                    { _id: (typeof a.plans[0] === 'string' && a.plans[0].length === 24) ? new mongoose.Types.ObjectId(a.plans[0]) : a.plans[0] }
                ]
            });
        }
        return {
            ...a,
            planName: plan?.name || 'Active AMC',
            expiry: a.end_date
        };
    }));

    const userData = user.toObject();
    
    res.json({
      ...userData,
      memberships: memberships.length > 0 ? memberships : null,
      amcs: amcs.length > 0 ? amcs : null,
      // For backward compatibility
      membership: memberships.length > 0 ? memberships[0] : null,
      amc: amcs.length > 0 ? amcs[0] : null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (req.file) {
      user.profileImage = req.file.path.replace(/\\/g, "/"); // Normalize path for Windows
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// You can add more controller functions for creating, updating, deleting users as needed.
