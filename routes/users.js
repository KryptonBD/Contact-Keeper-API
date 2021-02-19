const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { validationResult, check } = require('express-validator');

const router = express.Router();

const User = require("../models/Users");

// @route   POST    api/users
// @desc    Register a user
// @access  Public
router.post("/", [
    check("name", "Please add a name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please add a password with 6 or more character").isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User Already Exist" });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: { id: user.id }
        }

        jwt.sign(payload, config.get("jwtSecret"), {
            expiresIn: 72000
        }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR");
    }
})

module.exports = router;