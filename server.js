const express = require("express");
const connectDB = require("./config/db");


const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Init middleware
app.use(express.json({extended: false}));

app.get("/", (req, res) =>{
    res.send("WELCOME TO THE CONTACT KEEPER API");
})


// Define Routes
app.use('/api/users', require("./routes/users"));
app.use('/api/auth', require("./routes/auth"));
app.use('/api/contacts', require("./routes/contacts"));

app.listen(PORT, ()=>console.log("SERVER RUNNING", PORT));