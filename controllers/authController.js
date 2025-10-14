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
    const { phone, profileType, name } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let user = await User.findOne({ phoneNumber: phone });

    if (user) {
      user.profileType = profileType || user.profileType;
      user.name = name || user.name;
      await user.save();
    } else {
      user = new User({
        phoneNumber: phone,
        profileType: profileType || 'mum',
        name,
      });
      await user.save();
    }
    
    // TODO: Implement your WhatsApp verification code sending logic here
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Verification code sent to WhatsApp'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// WhatsApp code verification
const verifyWhatsAppCode = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }
    
    // TODO: Verify the code (implement your verification logic)
    
    const user = await User.findOne({ phoneNumber: phone });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check for first login & award achievement
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
        gamification: user.gamification
      },
      newAchievement
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// EXPORT ALL FUNCTIONS
module.exports = {
  initiateWhatsAppAuth,
  verifyWhatsAppCode,
  verifyToken
};