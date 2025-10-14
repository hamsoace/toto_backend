const User = require('../models/User');
const GamificationService = require('../services/gamificationService');

// WhatsApp authentication initiation
const initiateWhatsAppAuth = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
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
    const { phoneNumber, code, profileType } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }
    
    // TODO: Verify the code (implement your verification logic)
    
    // Find or create user
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      user = new User({
        phoneNumber,
        profileType: profileType || 'mum'
      });
      await user.save();
    }
    
    // Check for first login & award achievement
    const isFirstLogin = !user.gamification.lastLogin;
    
    user.gamification.lastLogin = new Date();
    await user.save();
    
    let newAchievement = null;
    if (isFirstLogin) {
      newAchievement = await GamificationService.handleFirstLogin(user);
      console.log(`🎉 First login reward awarded: ${newAchievement?.points} points`);
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        profileType: user.profileType,
        gamification: user.gamification
      },
      newAchievement: newAchievement
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user function
const loginUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check for first login & award achievement
    const isFirstLogin = !user.gamification.lastLogin;
    
    // Update last login
    user.gamification.lastLogin = new Date();
    await user.save();
    
    let newAchievement = null;
    if (isFirstLogin) {
      newAchievement = await GamificationService.handleFirstLogin(user);
      console.log(`🎉 First login reward awarded: ${newAchievement?.points} points`);
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        profileType: user.profileType,
        gamification: user.gamification
      },
      newAchievement: newAchievement
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  initiateWhatsAppAuth,
  verifyWhatsAppCode,
  loginUser
};