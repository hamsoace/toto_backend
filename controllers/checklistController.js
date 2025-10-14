const Checklist = require('../models/Checklist');
const { PPD_CHECKLIST, PARTNER_CHECKLIST } = require('../../shared/constants');

// Submit PPD Self-Checklist
exports.submitPPDChecklist = async (req, res) => {
  try {
    const { scores } = req.body;
    const userId = req.user.id;

    // Calculate total score (PHQ-9 scoring)
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    // Determine risk level based on WHO guidelines
    let riskLevel = 'minimal';
    let recommendation = '';
    
    if (totalScore >= 20) {
      riskLevel = 'severe';
      recommendation = 'Please seek immediate professional help. Contact your healthcare provider or call 116 (Kenya Mental Health Hotline).';
    } else if (totalScore >= 15) {
      riskLevel = 'moderately_severe';
      recommendation = 'Strongly recommend speaking with a healthcare provider soon. You may be experiencing significant postpartum depression.';
    } else if (totalScore >= 10) {
      riskLevel = 'moderate';
      recommendation = 'Consider discussing these feelings with your healthcare provider or a trusted support person.';
    } else if (totalScore >= 5) {
      riskLevel = 'mild';
      recommendation = 'These are common feelings after childbirth. Try to rest and reach out to your support network.';
    } else {
      riskLevel = 'minimal';
      recommendation = 'Great job taking care of your mental health! Continue checking in with yourself regularly.';
    }

    // Create checklist record
    const checklist = await Checklist.create({
      userId,
      type: 'ppd',
      scores,
      totalScore,
      riskLevel,
      recommendation
    });

    // Get appropriate message based on risk level and user profile
    const message = generateChecklistMessage(riskLevel, req.user.profileType, totalScore);

    res.status(201).json({
      status: 'success',
      message: message,
      data: {
        checklist,
        riskLevel,
        recommendation,
        totalScore
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Submit Partner Mental Checklist
exports.submitPartnerChecklist = async (req, res) => {
  try {
    const { scores } = req.body;
    const userId = req.user.id;

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = scores.length * 3; // 0-3 scale for each question
    
    const supportLevel = totalScore / maxScore;
    
    let feedback = '';
    let encouragement = '';

    if (supportLevel >= 0.8) {
      feedback = 'You are providing exceptional support to your family!';
      encouragement = 'Your consistent involvement and emotional awareness are making a huge difference. Remember to also take care of yourself.';
    } else if (supportLevel >= 0.6) {
      feedback = 'You are doing a great job supporting your family.';
      encouragement = 'Your efforts are noticed and appreciated. Look for small opportunities to deepen your connection with your partner and baby.';
    } else if (supportLevel >= 0.4) {
      feedback = 'You are on the right track with your support.';
      encouragement = 'Every bit of support helps. Try to find one additional way each day to be involved and check in with your partner.';
    } else {
      feedback = 'There are opportunities to increase your support.';
      encouragement = 'Parenting is a team effort. Start with small, consistent actions and build from there. Your involvement matters greatly.';
    }

    const checklist = await Checklist.create({
      userId,
      type: 'partner',
      scores,
      totalScore,
      supportLevel,
      feedback,
      encouragement
    });

    res.status(201).json({
      status: 'success',
      message: 'Thank you for checking in on your mental wellbeing.',
      data: {
        checklist,
        feedback,
        encouragement,
        supportLevel: Math.round(supportLevel * 100)
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get checklist history
exports.getChecklistHistory = async (req, res) => {
  try {
    const checklists = await Checklist.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        checklists
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get PPD resources
exports.getPPDResources = async (req, res) => {
  try {
    const resources = {
      emergency: [
        {
          name: 'Kenya Mental Health Hotline',
          phone: '116',
          description: '24/7 free confidential support',
          type: 'hotline'
        },
        {
          name: 'Nairobi Women\'s Hospital',
          phone: '+254 703 042 700',
          description: 'Crisis support and counseling',
          type: 'hospital'
        }
      ],
      support: [
        {
          name: 'Postpartum Support International',
          description: 'Global support network with local resources',
          website: 'https://www.postpartum.net',
          type: 'international'
        },
        {
          name: 'Mother & Baby Program - Nairobi',
          description: 'Local support groups and counseling',
          phone: '+254 20 272 8790',
          type: 'local'
        }
      ],
      selfHelp: [
        {
          name: 'Daily Self-Care Checklist',
          description: 'Simple daily activities to support mental health',
          type: 'tool'
        },
        {
          name: 'Partner Support Guide',
          description: 'Ways partners can help with postpartum recovery',
          type: 'guide'
        }
      ]
    };

    res.status(200).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Helper function to generate appropriate messages
function generateChecklistMessage(riskLevel, profileType, score) {
  const messages = {
    mum: {
      severe: `Thank you for being brave and checking in. With a score of ${score}, it's really important to reach out for support right away. You don't have to go through this alone, mama. 💕`,
      moderately_severe: `Your score of ${score} shows this might be a really tough time. Please know that these feelings are treatable and reaching out for help is a sign of strength. 🌸`,
      moderate: `Thank you for checking in. Your score of ${score} suggests it might help to talk with someone about how you're feeling. Many mums go through this. 🌈`,
      mild: `Your score of ${score} shows some common postpartum feelings. Be gentle with yourself and remember to take moments for self-care. You're doing great. 💪`,
      minimal: `Great job taking care of your mental health! Your score of ${score} is in the minimal range. Keep checking in with yourself regularly. 🌟`
    },
    dad: {
      severe: `Thanks for checking in. With a score of ${score}, it's really important to reach out for professional support. Taking care of your mental health helps you better support your family. 💪`,
      moderately_severe: `Your score of ${score} suggests this might be a challenging time. Remember that seeking help is a sign of strength and good parenting. 🔧`,
      moderate: `Thanks for being proactive about your mental health. Your score of ${score} indicates it might be helpful to connect with other dads or a professional. 🌟`,
      mild: `Your score of ${score} shows some common adjustment feelings. Keep checking in and don't hesitate to reach out to your support network. 🛠️`,
      minimal: `Great work staying on top of your mental health! Your score of ${score} is in the minimal range. Your family benefits from your self-awareness. 🎯`
    }
  };

  return messages[profileType]?.[riskLevel] || 'Thank you for completing the checklist.';
}