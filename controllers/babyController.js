const Baby = require('../models/Baby');

exports.createBaby = async (req, res) => {
  try {
    const babyData = { ...req.body, userId: req.user.id };
    const baby = await Baby.create(babyData);

    res.status(201).json({
      status: 'success',
      data: { baby }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getBaby = async (req, res) => {
  try {
    const baby = await Baby.findOne({ userId: req.user.id });

    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'No baby found for this user'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { baby }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateBaby = async (req, res) => {
  try {
    const baby = await Baby.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!baby) {
      return res.status(404).json({
        status: 'fail',
        message: 'No baby found for this user'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { baby }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};