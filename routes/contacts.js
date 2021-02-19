const express = require("express");
const { validationResult, check } = require('express-validator');
const auth = require("../middleware/auth")
const router = express.Router();

const User = require("../models/Users");
const Contact = require("../models/Contact");

// @route   GET    api/contacts
// @desc    Get all contacts
// @access  Private
router.get("/", auth, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 });
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER Error");
    }
})


// @route   POST    api/contacts
// @desc    add new contacts
// @access  Private
router.post("/", [
    auth, [
        check("name", "Name is required").not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, phone, type } = req.body;

    try {
        const newContact = new Contact({
            name,
            phone,
            email,
            type,
            user: req.user.id
        });

        const contact = await newContact.save();

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR");
    }
})


// @route   PUT    api/contacts/:id
// @desc    Update A contact
// @access  Private
router.put("/:id", auth, async (req, res) => {
    const { name, email, phone, type } = req.body;

    //Contact object
    const contactObject = {}
    if (name) contactObject.name = name;
    if (email) contactObject.email = email;
    if (phone) contactObject.phone = phone;
    if (type) contactObject.type = type;

    try {
        let contact = await Contact.findById(req.params.id);

        if (!contact) return res.status(404).json({ msg: "Contact Not Found" });

        // Checking User owns the contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not Authorized" });
        }
        contact = await Contact.findByIdAndUpdate(req.params.id, {
            $set: contactObject
        }, { new: true });

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR");
    }

})


// @route   DELTE    api/contacts/:id
// @desc    Delete Contact
// @access  Private
router.delete("/:id", auth, async (req, res) => {
    try {
        let contact = await Contact.findById(req.params.id);

        if (!contact) return res.status(404).json({ msg: "Contact Not Found" });

        // Checking User owns the contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not Authorized" });
        }

        await Contact.findByIdAndRemove(req.params.id);

        res.json({ msg: "Contact Removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("SERVER ERROR");
    }
})

module.exports = router;