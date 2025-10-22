const User = require('../models/User');
const GamificationService = require('../services/gamificationService');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// WhatsApp authentication initiation
const initiateWhatsAppAuth = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    const { phone, phoneNumber, profileType, name, babyName, babyDateOfBirth } = req.body;

    // Validation
    if (!userPhone) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Phone number is required' 
      });
    }

    // CRITICAL: profileType is required in your schema
    if (!profileType) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Profile type is required (mum, dad, or partner)' 
      });
    }

    // Validate profileType
    if (!['mum', 'dad', 'partner'].includes(profileType)) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Profile type must be mum, dad, or partner' 
      });
    }

    let user = await User.findOne({ phoneNumber: userPhone });

    if (user) {
      // Update existing user
      user.profileType = profileType;
      if (name) user.name = name;
      console.log('Updating existing user:', user._id);
    } else {
      // Create new user - ALL required fields must be provided
      user = new User({
        phoneNumber: userPhone,
        profileType: profileType, // This is REQUIRED
        name: name || 'User',
        // Gamification fields are already set with defaults in schema
      });
      console.log('Creating new user');
    }
    
    // Save and catch any validation errors
    await user.save();
    console.log('User saved successfully:', user._id);

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
    
    // Handle mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        status: 'fail',
        error: 'Validation error',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Phone number already exists'
      });
    }

    res.status(500).json({ 
      status: 'error',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack 
      })
    });
  }
};

// WhatsApp code verification
const verifyWhatsAppCode = async (req, res) => {
  try {
    const { phone, phoneNumber, code } = req.body;
    const userPhone = phone || phoneNumber;

    if (!userPhone) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Phone number is required' 
      });
    }

    if (!code) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Verification code is required' 
      });
    }

    let user = await User.findOne({ phoneNumber: userPhone });

    if (!user) {
      return res.status(404).json({ 
        status: 'fail',
        error: 'User not found. Please initiate authentication first.' 
      });
    }

    // Here, you would typically verify the code.
    // For this simplified version, we'll assume the code is correct.
    // TODO: Implement actual code verification

    const isFirstLogin = !user.gamification.lastLogin;
    user.gamification.lastLogin = new Date();
    await user.save();
    
    let newAchievement = null;
    if (isFirstLogin) {
      newAchievement = await GamificationService.handleFirstLogin(user);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          profileType: user.profileType,
          gamification: user.gamification,
        },
        newAchievement
      }
    });
  } catch (error) {
    console.error('Error in verifyWhatsAppCode:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
};

const verifyToken = (req, res) => {
  // User is already attached to req by the protect middleware
  res.status(200).json({ 
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        phoneNumber: req.user.phoneNumber,
        profileType: req.user.profileType,
        gamification: req.user.gamification,
      }
    }
  });
};

module.exports = {
  initiateWhatsAppAuth,
  verifyWhatsAppCode,
  verifyToken
};