const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).send({ error: 'Login failed!' });
    }
    res.status(200).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
};
