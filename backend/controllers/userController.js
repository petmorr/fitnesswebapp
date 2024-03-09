const User = require('../models/user');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  // Example validation (adjust according to your requirements)
  if (!name.trim() || !bio.trim()) {
    return res.status(400).json({ msg: 'Name and bio are required.' });
  }

  try {
    const userId = req.params.userId;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.name = name;
    user.bio = bio;
    await user.save();
    const userToReturn = { ...user._doc };
    delete userToReturn.password; // Omit the password field
    res.json(userToReturn);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};