const User = require('../models/User');
const jwt = require('jsonwebtoken');
//handling Error
const handleError = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  //incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered!';
  }

  //incorrect email
  if (err.message === 'incorrect password') {
    errors.password = 'password is incorrect!';
  }

  if (err.code == 11000) {
    //duplicated Error
    errors.email = 'That email had already registered!';
    return errors;
  }

  //validation error
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  console.log(errors);
  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: maxAge,
  });
};

module.exports.singup_get = (req, res) => {
  res.render('singup');
};
module.exports.singup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const newuser = await User.create({ email, password });
    const token = createToken(newuser._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: newuser._id });
  } catch (err) {
    let errors = handleError(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_get = (req, res) => {
  res.render('login');
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({ errors });
  }
};
module.exports.logout_get = async (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};
