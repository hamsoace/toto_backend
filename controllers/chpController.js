const CHP = require('../models/CHP');
const axios = require('axios');

// Get nearby CHPs based on user's location or ward
exports.getNearbyCHPs = async (req, res) => {
  try {
    const { latitude, longitude, ward, maxDistance = 10 } = req.query;
    
    let query = { verificationStatus: 'verified' };
    
    if (ward) {
      // Find by ward name
      query.ward = new RegExp(ward, 'i');
    } else if (latitude && longitude) {
      // In a real implementation, you would use geospatial queries
      // For now, we'll simulate by using county/sub-county data
      const userLocation = await getLocationFromCoords(latitude, longitude);
      if (userLocation) {
        query.county = userLocation.county;
        query.subCounty = userLocation.subCounty;
      }
    }

    const chps = await CHP.find(query)
      .select('name phone ward subCounty county healthUnit languages specialties availability coverageArea')
      .limit(20);

    // Format response with additional information
    const formattedCHPs = chps.map(chp => ({
      id: chp._id,
      name: chp.name,
      phone: chp.phone,
      location: {
        ward: chp.ward,
        subCounty: chp.subCounty,
        county: chp.county
      },
      healthUnit: chp.healthUnit,
      languages: chp.languages,
      specialties: chp.specialties,
      availability: chp.availability,
      contactInfo: `https://wa.me/${chp.phone.replace('+', '')}`,
      isAvailable: checkCHPAvailability(chp.availability)
    }));

    res.status(200).json({
      status: 'success',
      data: {
        chps: formattedCHPs,
        total: formattedCHPs.length,
        searchArea: ward || (latitude && longitude ? 'Your location' : 'Not specified')
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get CHPs by specific ward
exports.getCHPByWard = async (req, res) => {
  try {
    const { ward } = req.query;

    if (!ward) {
      return res.status(400).json({
        status: 'fail',
        message: 'Ward name is required'
      });
    }

    const chps = await CHP.find({
      ward: new RegExp(ward, 'i'),
      verificationStatus: 'verified'
    })
    .select('name phone ward subCounty healthUnit languages specialties availability')
    .limit(15);

    res.status(200).json({
      status: 'success',
      data: {
        chps,
        ward,
        total: chps.length
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Contact a specific CHP via WhatsApp
exports.contactCHP = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.user;

    const chp = await CHP.findById(id);
    
    if (!chp) {
      return res.status(404).json({
        status: 'fail',
        message: 'CHP not found'
      });
    }

    // Create a pre-filled WhatsApp message
    const userMessage = message || `Hello, I'm ${user.profile.name || 'a TotoCare user'}. I need some parenting support. Can you help me?`;
    
    const whatsappUrl = `https://wa.me/${chp.phone.replace('+', '')}?text=${encodeURIComponent(userMessage)}`;

    // Log the contact attempt (for analytics)
    await logCHPContact(user.id, chp._id, 'whatsapp');

    res.status(200).json({
      status: 'success',
      message: 'CHP contact information ready',
      data: {
        chp: {
          name: chp.name,
          phone: chp.phone,
          ward: chp.ward
        },
        whatsappUrl,
        directMessage: userMessage
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all counties with CHP coverage
// Get all counties with CHP coverage
exports.getAllCounties = async (req, res) => {
  try {
    const counties = await CHP.distinct('county', { verificationStatus: 'verified' });
    
    // Fix: Use Promise.all to properly handle async operations in map
    const countyData = await Promise.all(
      counties.map(async (county) => ({
        name: county,
        chpCount: await CHP.countDocuments({ county, verificationStatus: 'verified' })
      }))
    );

    res.status(200).json({
      status: 'success',
      data: {
        counties: countyData.sort((a, b) => b.chpCount - a.chpCount)
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get sub-counties for a specific county
exports.getSubCounties = async (req, res) => {
  try {
    const { county } = req.params;

    const subCounties = await CHP.distinct('subCounty', { 
      county: new RegExp(county, 'i'),
      verificationStatus: 'verified' 
    });

    res.status(200).json({
      status: 'success',
      data: {
        county,
        subCounties: subCounties.sort()
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get wards for a specific sub-county
exports.getWards = async (req, res) => {
  try {
    const { subCounty } = req.params;

    const wards = await CHP.distinct('ward', { 
      subCounty: new RegExp(subCounty, 'i'),
      verificationStatus: 'verified' 
    });

    res.status(200).json({
      status: 'success',
      data: {
        subCounty,
        wards: wards.sort()
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Helper function to get location from coordinates (simulated)
async function getLocationFromCoords(lat, lng) {
  // In production, you would use a geocoding service
  // For now, return a simulated location based on Nairobi coordinates
  if (Math.abs(lat - (-1.2921)) < 1 && Math.abs(lng - 36.8219) < 1) {
    return { county: 'Nairobi', subCounty: 'Westlands' };
  }
  return null;
}

// Helper function to check if CHP is currently available
function checkCHPAvailability(availability) {
  if (!availability || !availability.days) return true;
  
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
  const currentHour = now.getHours();
  
  const isAvailableDay = availability.days.includes(currentDay);
  const isAvailableHour = true; // Simplified - would parse hours string in production
  
  return isAvailableDay && isAvailableHour;
}

// Helper function to log CHP contacts
async function logCHPContact(userId, chpId, contactMethod) {
  // In production, you would save this to a separate collection for analytics
  console.log(`CHP contact: User ${userId} contacted CHP ${chpId} via ${contactMethod}`);
}