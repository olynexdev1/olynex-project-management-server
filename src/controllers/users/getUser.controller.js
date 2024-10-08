// get single user with user role

const UserModel = require('../../models/users.model');

// get all users data
exports.getUsers = async (req, res) => {
  try {
    const { designation, page, limit } = req.query;
    const filter = designation
      ? { 'personalInfo.designation': designation }
      : {};
    if (page || limit) {
      const skip = (page - 1) * limit;
      const result = await UserModel.find(filter)
        .skip(skip)
        .limit(Number(limit));
      const totalCount = await UserModel.countDocuments(filter);
      return res.status(200).send({ data: result, totalCount });
    }
    const result = await UserModel.find(filter);

    res.status(200).send({ data: result, totalCount });
  } catch (err) {
    res.status(500).send({ message: 'User get Error!', err });
  }
};

// Get user by userId
exports.getUserbyUserId = async (req, res) => {
  const userId = Number(req.params?.userId);

  try {
    const result = await UserModel.findOne({ userId: userId });
    if (!result) {
      return res.status(404).send({ message: 'User not found!' });
    }

    res.status(200).send(result);
  } catch (err) {
    console.error('Error fetching user by userId:', err);
    res.status(500).send({ message: 'Error retrieving user!', err });
  }
};


// get single user with email
exports.getUserwithEmail = async (req, res) => {
  const email = req.query?.email;
  try {
    const user = await UserModel.findOne({ officeEmail: email });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// get user role
exports.getUserWithRole = async (req, res) => {
  try {
    const email = req.params?.email; // email get with params

    // Validate the email parameter
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is missing.' });
    }
    // Find user by officeEmail
    const user = await UserModel.findOne({ officeEmail: email });

    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Extract designation and determine roles
    const { designation } = user.personalInfo || {};
    const roles = {
      ceo: designation === 'ceo',
      hr: designation === 'hr',
      co_ordinator: designation === 'co_ordinator',
      project_manager: designation === 'project_manager',
      mockup: designation === 'mockup',
      seo: designation === 'seo',
      delivery: designation === 'delivery',
      employee: designation === 'employee',
    };

    // Respond with roles
    res.json(roles);
  } catch (err) {
    // Handle server errors
    res
      .status(500)
      .json({ message: 'User role retrieval error', error: err.message });
  }
};
