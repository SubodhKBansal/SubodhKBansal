const axios = require("axios");

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

module.exports = sendWhatsApp;