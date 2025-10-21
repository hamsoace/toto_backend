const User = require('../models/User');
const GamificationService = require('../services/gamificationService');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const initiateWhatsAppAuth = async (req, res) => {
  try {
    const { phone, phoneNumber, profileType, name, babyName, babyDateOfBirth } = req.body;

    // Accept both 'phone' and 'phoneNumber' for flexibility
    const userPhone = phone || phoneNumber;

    if (!userPhone) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Phone number is required' 
      });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(userPhone)) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Invalid phone number format' 
      });
    }

    let user = await User.findOne({ phoneNumber: userPhone });

    if (user) {
      // Update existing user
      if (profileType) user.profileType = profileType;
      if (name) user.name = name;
    } else {
      // Create new user with only required fields
      user = new User({
        phoneNumber: userPhone,
        profileType: profileType || 'mum',
        name: name || 'User',
      });
    }
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Authentication initiated. Please verify.',
      data: {
        userId: user._id,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error in initiateWhatsAppAuth:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// WhatsApp code verification
const verifyWhatsAppCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    let user = await User.findOne({ phoneNumber: phone });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Here, you would typically verify the code.
    // For this simplified version, we'll assume the code is correct.

    const isFirstLogin = !user.gamification.lastLogin;
    user.gamification.lastLogin = new Date();
    await user.save();
    
    let newAchievement = null;
    if (isFirstLogin) {
      newAchievement = await GamificationService.handleFirstLogin(user);
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        profileType: user.profileType,
        gamification: user.gamification,
      },
      newAchievement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyToken = (req, res) => {
    // This function is not fully implemented yet
    res.status(200).json({ message: "Token verification placeholder." });
}

module.exports = {
  initiateWhatsAppAuth,
  verifyWhatsAppCode,
  verifyToken
};
