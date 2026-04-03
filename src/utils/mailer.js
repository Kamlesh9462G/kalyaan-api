const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the specific path provided
dotenv.config({ path: path.join(__dirname, "../../.env") });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Added TLS options to prevent certificate errors on new domains
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Sends an email using the configured transporter
 * @param {Object} options - { to, subject, text, html }
 */
const sendMail = async (options) => {
  try {
    const mailOptions = {
      from: `"Kalyaan Matka 420" <${process.env.SMTP_USER}>`,

      // ✅ HIGH PRIORITY HEADERS
      priority: "high",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high"
      },

      ...options
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
};

// --- TEST THE CONNECTION (Run this to verify) ---
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Connection Successful!");
  } catch (err) {
    console.error("❌ SMTP Connection Failed:", err.message);
  }
};

module.exports = {
  testConnection,
  sendMail
}

