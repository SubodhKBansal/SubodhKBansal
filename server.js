const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const axios = require("axios");
const app = express();
async function sendWhatsApp(phone) {
    try {

        const url = `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`;

        await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: "hello_world",
                    language: {
                        code: "en_US"
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ WhatsApp message sent");

    } catch (err) {

        console.log("❌ WhatsApp Error");
        console.log(err.response?.data || err.message);

    }
}
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