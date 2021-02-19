const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { body, validationResult, check } = require('express-validator');

const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/Users");
const { reset } = require("nodemon");

// @route   GET    api/auth
// @desc    Get logged in user
// @access  Private
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR")
    }
})

// @route   POST    api/auth
// @desc    Auth User get token
// @access  Public
router.post("/", [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Password" });
        }

        const payload = {
            user: { id: user.id }
        }

        jwt.sign(payload, config.get("jwtSecret"), {
            expiresIn: 72000
        }, (err, token) => {
            if (err) {
                console.log("ERROR ON TOKEN");
                throw err;
            };
            res.json({ token });
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR");
    }
})

module.exports = router;