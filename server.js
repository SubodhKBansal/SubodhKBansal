const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const sendWhatsApp = require("./utils/sendWhatsApp");
console.log("sendWhatsApp:", sendWhatsApp);
console.log("typeof sendWhatsApp:", typeof sendWhatsApp);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
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
        await sendWhatsApp("91" + mobile);
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

console.log("PORT =", process.env.PORT);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});