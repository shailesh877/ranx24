import User from '../model/User.js';


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

    res.json(user);
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
