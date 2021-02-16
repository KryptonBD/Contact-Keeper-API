const express = require("express");
const router = express.Router();

// @route   GET    api/auth
// @desc    Get logged in user
// @access  Private
router.get("/", (req, res) =>{
    res.send("GET Logged in USER")
})

// @route   POST    api/auth
// @desc    Auth User get token
// @access  Public
router.post("/", (req, res) =>{
    res.send("Log in USER")
})

module.exports = router;