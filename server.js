const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const axios = require("axios");
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
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
app.use(session({
    secret: "bansalclasses_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// Multer Configuration
// ==============================

const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    }
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

async function generateFacultyId() {

    const result = await pool.query(
        "SELECT COUNT(*) FROM staff"
    );

    const nextNumber = Number(result.rows[0].count) + 1;

    return "FID26" + nextNumber.toString().padStart(4, "0");
}

app.post("/register", async (req, res) => {

    const {
        fullname,
        mobile,
        email,
        studentClass
    } = req.body;

    try {

        // =====================================
        // FACULTY / STAFF REGISTRATION
        // =====================================

        if (studentClass === "Faculty (Staff)") {

            const facultyId = await generateFacultyId();

            const temporaryPassword = mobile.slice(-6);

            const passwordHash = await bcrypt.hash(
                temporaryPassword,
                10
            );

            await pool.query(

                `INSERT INTO staff
                (faculty_id, password_hash, faculty_name, mobile, email, faculty_class)
                VALUES ($1, $2, $3, $4, $5, $6)`,

                [
                    facultyId,
                    passwordHash,
                    fullname,
                    mobile,
                    email,
                    studentClass
                ]

            );

            await sendWhatsApp("91" + mobile);

            return res.json({

                success: true,

                facultyId: facultyId,

                password: temporaryPassword,

                message: "Faculty Registered Successfully"

            });

        }

        // =====================================
        // STUDENT REGISTRATION
        // =====================================

        const countResult = await pool.query(

            "SELECT COUNT(*) FROM students"

        );

        const nextNumber = Number(countResult.rows[0].count) + 1;

        const studentId =
            "SID26" + nextNumber.toString().padStart(4, "0");

        const temporaryPassword = mobile.slice(-6);

        const passwordHash = await bcrypt.hash(
            temporaryPassword,
            10
        );

        await pool.query(

            `INSERT INTO students
            (student_id, password_hash, fullname, mobile, email, student_class)
            VALUES ($1, $2, $3, $4, $5, $6)`,

            [
                studentId,
                passwordHash,
                fullname,
                mobile,
                email,
                studentClass
            ]

        );

        await sendWhatsApp("91" + mobile);

        return res.json({

            success: true,

            studentId: studentId,

            password: temporaryPassword,

            message: "Student Registered Successfully"

        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: "Registration Failed"

        });

    }

});

// ==============================
// Student Login API
// ==============================

app.post("/student/login", async (req, res) => {

    const { studentId, password } = req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM students WHERE student_id = $1",
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Invalid Student ID"
            });
        }

        const student = result.rows[0];

        const passwordMatched = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!passwordMatched) {
            return res.json({
                success: false,
                message: "Incorrect Password"
            });
        }

        req.session.student = {
            id: student.id,
            studentId: student.student_id,
            fullname: student.fullname
        };

        res.json({
            success: true,
            message: "Login Successful"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

// ==============================
// Student Details API
// ==============================

app.get("/student/details", (req, res) => {

    if (!req.session.student) {
        return res.status(401).json({
            success: false,
            message: "Not Logged In"
        });
    }

    res.json({
        success: true,
        studentName: req.session.student.fullname,
        studentId: req.session.student.studentId
    });

});

// ==============================
// Staff Login API
// ==============================

app.post("/staff/login", async (req, res) => {

    const { facultyId, password } = req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM staff WHERE faculty_id = $1",
            [facultyId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Invalid Faculty ID"
            });
        }

        const staff = result.rows[0];

        const passwordMatched = await bcrypt.compare(
            password,
            staff.password_hash
        );

        if (!passwordMatched) {
            return res.json({
                success: false,
                message: "Incorrect Password"
            });
        }

        req.session.staff = {
            id: staff.id,
            facultyId: staff.faculty_id,
            facultyName: staff.faculty_name
        };

        res.json({
            success: true,
            message: "Login Successful"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});
// ==============================
// Staff Details API
// ==============================

app.get("/staff/details", (req, res) => {

    if (!req.session.staff) {
        return res.status(401).json({
            success: false,
            message: "Not Logged In"
        });
    }

    res.json({
        success: true,
        facultyName: req.session.staff.facultyName,
        facultyId: req.session.staff.facultyId
    });

});

// ==============================
// Upload Notes API
// ==============================

app.post("/upload-note", upload.single("pdf"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a PDF file."
            });
        }

        console.log("Notes Uploaded");
        console.log(req.body);
        console.log(req.file);

        res.json({
            success: true,
            message: "Notes uploaded successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Upload failed."
        });

    }

});
// ==============================
// Logout API
// ==============================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Logout Failed"
            });

        }

        res.json({
            success: true,
            message: "Logged Out Successfully"
        });

    });

});

// ==============================
// Start Server
// ==============================

const PORT = process.env.PORT || 3000;

console.log("PORT =", process.env.PORT);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});