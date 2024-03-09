const Session = require('../models/Session');

exports.bookSession = async (req, res) => {
  const { trainerId, userId, time } = req.body;
  try {
    const session = new Session({
      trainer: trainerId,
      user: userId,
      time
    });

    await session.validate(); // Validate input
    await session.save(); // Save the session
    res.status(201).json({ msg: 'Session booked successfully', session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('trainer', ['name', 'email']).populate('user', ['name', 'email']);
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
