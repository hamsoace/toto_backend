const User = require('../models/User');
const { sendWhatsAppVerification, verifyWhatsAppCode: verifyCode } = require('../services/whatsappService');
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

    // In a real scenario, you would send a verification code here.
    // For now, we'll just return a success message and user data.
    let user = await User.findOne({ phoneNumber: phone });

    if (user) {
      user.profileType = profileType || user.profileType;
      user.name = name || user.name;
    } else {
      user = new User({
        phoneNumber: phone,
        profileType: profileType || 'mum',
        name,
      });
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Authentication initiated. Please verify.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
