const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// SQL Server Configuration (Windows Authentication)
/*const config = {
    connectionString:
        "Driver={ODBC Driver 18 for SQL Server};" +
        "Server=DESKTOP-M1NLFLM\\SBSQL;" +
        "Database=BansalClasses;" +
        "Trusted_Connection=Yes;" +
        "TrustServerCertificate=Yes;"
};*/
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 1433,

    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool;

// Connect to SQL Server once
sql.connect(config)
    .then((connection) => {
        pool = connection;
        console.log("✅ Connected to SQL Server using Windows Authentication");
    })
    .catch((err) => {
        console.error("❌ Database Connection Failed");
        console.error(err);
    });

// Registration API
app.post("/register", async (req, res) => {

    const { fullname, mobile, email } = req.body;

    try {

        await pool.request()
            .input("FullName", sql.NVarChar(100), fullname)
            .input("Mobile", sql.VarChar(15), mobile)
            .input("Email", sql.NVarChar(100), email)
            .query(`
                INSERT INTO Students
                (FullName, MobileNumber, EmailId)
                VALUES
                (@FullName, @Mobile, @Email)
            `);

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

// Start Server
const PORT = 3000;

app.listen(PORT, () => {

    console.log(`🚀 Server running at http://localhost:${PORT}`);

});