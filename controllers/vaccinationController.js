const Baby = require('../models/Baby');
const { VACCINATION_SCHEDULE } = require('../shared/constants');
const GamificationService = require('../services/gamificationService');
const User = require('../models/User');

exports.getVaccinationSchedule = async (req, res) => {
  try {
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    // Calculate vaccination schedule based on baby's birth date
    const schedule = calculateVaccinationSchedule(baby.birthDate, req.user.language);
    
    res.status(200).json({
      status: 'success',
      data: {
        schedule,
        completed: baby.vaccinations.filter(v => v.completed),
        upcoming: schedule.filter(v => !v.completed)
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.markVaccinationCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    // Find and update the vaccination
    const vaccination = baby.vaccinations.id(id);
    if (!vaccination) {
      return res.status(404).json({
        status: 'fail',
        message: 'Vaccination not found'
      });
    }

    vaccination.completed = true;
    vaccination.completedDate = new Date();
    await baby.save();

    // Award gamification points for completing vaccination
    const user = await User.findById(req.user.id);
    if (user) {
      await GamificationService.awardPoints(user, 'vaccination_completed', 50);
    }

    res.status(200).json({
      status: 'success',
      data: {
        vaccination
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.markVaccinationPending = async (req, res) => {
  try {
    const { id } = req.params;
    const baby = await Baby.findOne({ userId: req.user.id });
    
    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'Baby profile not found'
      });
    }

    // Find and update the vaccination
    const vaccination = baby.vaccinations.id(id);
    if (!vaccination) {
      return res.status(404).json({
        status: 'fail',
        message: 'Vaccination not found'
      });
    }

    vaccination.completed = false;
    vaccination.completedDate = null;
    await baby.save();

    res.status(200).json({
      status: 'success',
      data: {
        vaccination
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

function calculateVaccinationSchedule(birthDate, language) {
  const schedule = VACCINATION_SCHEDULE[language] || VACCINATION_SCHEDULE.en;
  const calculatedSchedule = [];

  Object.entries(schedule).forEach(([period, vaccines]) => {
    const dueDate = calculateDueDate(birthDate, period);
    
    vaccines.forEach(vaccine => {
      calculatedSchedule.push({
        ...vaccine,
        period,
        dueDate,
        completed: false,
        isOverdue: dueDate < new Date() && !vaccine.completed
      });
    });
  });

  return calculatedSchedule.sort((a, b) => a.dueDate - b.dueDate);
}

function calculateDueDate(birthDate, period) {
  const birth = new Date(birthDate);
  switch (period) {
    case 'birth':
      return birth;
    case '6 weeks':
      return new Date(birth.setDate(birth.getDate() + 42));
    case '10 weeks':
      return new Date(birth.setDate(birth.getDate() + 70));
    case '14 weeks':
      return new Date(birth.setDate(birth.getDate() + 98));
    case '9 months':
      return new Date(birth.setMonth(birth.getMonth() + 9));
    case '18 months':
      return new Date(birth.setMonth(birth.getMonth() + 18));
    default:
      return birth;
  }
}