var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authorization = require('../middleware/authorization');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* POST register a new user */
router.post('/register', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
    return;
  }

  // Check if user already exists
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers.then(users => {
    if (users.length > 0) {
      throw new Error("User already exists");
    }

    // If user does not exist, hash the password and store it in the database
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return req.db.from("users").insert({ email, hash });
  })
    .then(() => {
      res.status(201).json({ message: "User created" });
    })
    .catch(error => {
      if (error.message === "User already exists") {
        res.status(409).json({ error: true, message: "User already exists" });
      } else {
      res.status(500).json({ error: true, message: "Something went wrong." });
      }
    });
});

/* POST login a user */
router.post('/login', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const longExpiry = req.body.longExpiry;

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
    return;
  }

  // Check if user exists and password is correct
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers
    .then(users => {
      if (users.length === 0) {
        throw new Error('Incorrect email or password');
      }
      // Password hash comparison
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then(match => {
      if (!match) {
        throw new Error('Incorrect email or password');
      }
      // Create and return JWT token
      const access_expires_in = longExpiry ? 31536000 : 600;
      const access_exp = Math.floor(Date.now() / 1000) + access_expires_in;
      const access_token = jwt.sign({ email, exp: access_exp }, process.env.JWT_SECRET);

      const refresh_expires_in = longExpiry ? 31536000 : 86400; // 1 day
      const refresh_exp = Math.floor(Date.now() / 1000) + refresh_expires_in;
      const refresh_token = jwt.sign({ email, exp: refresh_exp }, process.env.JWT_SECRET);

      // Update the refreshToken in the database
      return req.db.from('users').where('email', '=', email).update({
        refreshToken: refresh_token
      }).then(() => {
        return { access_token, access_expires_in, refresh_token, refresh_expires_in };
      });
    })
    .then(tokens => {
      res.status(200).json({
        bearerToken: {
          token: tokens.access_token,
          token_type: "Bearer",
          expires_in: tokens.access_expires_in
        },
        refreshToken: {
          token: tokens.refresh_token,
          token_type: "Refresh",
          expires_in: tokens.refresh_expires_in
        },
      });
    })
    .catch(error => {
      console.error(error);
      if (error.message === 'Incorrect email or password') {
        res.status(401).json({ error: true, message: error.message });
      } else {
        res.status(500).json({ error: true, message: "Something went wrong." });
      }
    });
});


router.get("/:email/profile", authorization, function (req, res, next) {
  const email = req.params.email;

  req.db.from('users').select('*').where('email', '=', email)
    .then(users => {
      if (users.length === 0) {
        res.status(404).json({ error: true, message: "User not found" });
      } else {
        const user = users[0];

        const profileData = {
          email: user.email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        };

        if (req.token && req.token.email === email) {
          // Additional fields if request is authorized
          profileData.dob = user.dob.toISOString().split('T')[0];
          profileData.address = user.address;
        }

        res.status(200).json(profileData);
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: true, message: "Something went wrong." });
    });
});

router.put("/:email/profile", authorization, function (req, res, next) {
  const email = req.params.email;
  const { firstName, lastName, dob, address } = req.body;

  // Check if the JWT token email matches the request email
  if (req.token && req.token.email !== email) {
    return res.status(403).json({ error: true, message: "Forbidden" });
  }
  

  // Check if all required fields are provided
  if (!firstName || !lastName || !dob || !address) {
    return res.status(400).json({ 
      error: true, 
      message: "Request body incomplete: firstName, lastName dob and address are required" 
    });
  }

  // Check if all provided fields are strings
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || 
      typeof dob !== 'string' || typeof address !== 'string') {
    return res.status(400).json({ 
      error: true, 
      message: "Request body invalid: firstName, lastName, dob and address must be strings only." 
    });
  }

  // Check if dob is a valid date
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!dob.match(datePattern) || isNaN(Date.parse(dob))) {
    return res.status(400).json({ 
      error: true, 
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD." 
    });
  }

  // Update the user profile
  req.db.from('users')
    .where('email', '=', email)
    .update({ firstName, lastName, dob, address })
    .then(rowsAffected => {
      if (rowsAffected === 0) {
        // No user with this email exists
        return res.status(404).json({ error: true, message: "User not found" });
      } else {
        // User was updated successfully
        return res.status(200).json({ email, firstName, lastName, dob, address });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: true, message: "Something went wrong." });
    });
});

/* POST refresh user's token */
router.post('/refresh', function (req, res, next) {
  const refreshToken = req.body.refreshToken;

  // Check if refreshToken is provided
  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete, refresh token required'
    });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: true, message: "JWT token has expired" });
      } else {
        return res.status(401).json({ error: true, message: "Invalid JWT token" });
      }
    }

    const email = payload.email;

    // Check if the refresh token exists in the database
    const user = await req.db.from("users").select("*").where({email, refreshToken}).first();
    if (!user) {
      return res.status(401).json({ error: true, message: "Invalid JWT token" });
    }

    // Create a new JWT token and refresh token
    const access_expires_in = 600; // 10 minutes
    const access_exp = Math.floor(Date.now() / 1000) + access_expires_in;
    const access_token = jwt.sign({ email, exp: access_exp }, process.env.JWT_SECRET);

    const refresh_expires_in = 86400; // 1 day
    const refresh_exp = Math.floor(Date.now() / 1000) + refresh_expires_in;
    const new_refresh_token = jwt.sign({ email, exp: refresh_exp }, process.env.JWT_SECRET);

    // Update the refresh token in the database
    await req.db.from("users")
      .where("email", "=", email)
      .update({
        refreshToken: new_refresh_token // Update refresh token
      });

    return res.status(200).json({
      bearerToken: {
        token: access_token,
        token_type: "Bearer",
        expires_in: access_expires_in
      },
      refreshToken: {
        token: new_refresh_token,
        token_type: "Refresh",
        expires_in: refresh_expires_in
      },
    });
  });
});


router.post('/logout', function (req, res, next) {
  const refreshToken = req.body.refreshToken;

  // Check if refreshToken is provided
  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: 'Request body incomplete, refresh token required'
    });
  }

  // Verify the refresh token
  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch(err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: true,
        message: "JWT token has expired"
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: true,
        message: "Invalid JWT token"
      });
    }
  }

  // Invalidate the refresh token in the database
  req.db.from("users")
    .where("refreshToken", "=", refreshToken)
    .update({
      refreshToken: null // Invalidate refresh token
    })
    .then(() => {
      res.status(200).json({
        error: false,
        message: 'Token successfully invalidated'
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Something went wrong."
      });
    });
});
    


module.exports = router;
