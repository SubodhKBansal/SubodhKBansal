const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ==============================
// Test PostgreSQL Connection
// ==============================

pool.query("SELECT NOW()")
    .then((result) => {
        console.log("✅ Connected to PostgreSQL");
        console.log(result.rows[0]);
    })
    .catch((err) => {
        console.error("❌ PostgreSQL Connection Failed");
        console.error(err);
    });


// ==============================
// Registration API
// ==============================

app.post("/register", async (req, res) => {

    const {
        fullname,
        mobile,
        email,
        studentClass
    } = req.body;

    try {

        await pool.query(
            `INSERT INTO students
            (fullname, mobile, email, student_class)
            VALUES ($1, $2, $3, $4)`,
            [
                fullname,
                mobile,
                email,
                studentClass
            ]
        );

        res.json({
            success: true,
            message: "Registration Successful"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Registration Failed"
        });

    }

});

// ==============================
// Start Server
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 Server running at http://localhost:${PORT}`);

});