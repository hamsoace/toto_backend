const Baby = require('../models/Baby');
const { MILESTONES } = require('../shared/constants');
const GamificationService = require('../services/gamificationService');
const User = require('../models/User');

exports.getMilestones = async (req, res) => {
  try {
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    const milestones = calculateMilestones(baby.birthDate, req.user.language, baby.milestones);
    
    res.status(200).json({
      status: 'success',
      data: {
        milestones,
        achieved: baby.milestones.filter(m => m.achieved),
        upcoming: milestones.filter(m => !m.achieved)
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.markMilestoneAchieved = async (req, res) => {
  try {
    const { id } = req.params;
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    // Find and update the milestone
    const milestone = baby.milestones.id(id);
    if (!milestone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Milestone not found'
      });
    }

    milestone.achieved = true;
    milestone.achievedDate = new Date();
    await baby.save();

    // Award gamification points for achieving milestone
    const user = await User.findById(req.user.id);
    if (user) {
      await GamificationService.awardPoints(user, 'milestone_achieved', 100);
    }

    res.status(200).json({
      status: 'success',
      data: {
        milestone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.markMilestonePending = async (req, res) => {
  try {
    const { id } = req.params;
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    // Find and update the milestone
    const milestone = baby.milestones.id(id);
    if (!milestone) {
      return res.status(404).json({
        status: 'fail',
        message: 'Milestone not found'
      });
    }

    milestone.achieved = false;
    milestone.achievedDate = null;
    await baby.save();

    res.status(200).json({
      status: 'success',
      data: {
        milestone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

function calculateMilestones(birthDate, language, existingMilestones) {
  const milestonesData = MILESTONES[language] || MILESTONES.en;
  const calculatedMilestones = [];

  // Implementation to calculate which milestones are due based on baby's age
  // This would map the static milestone data and check against the baby's birth date
  
  return calculatedMilestones;
}