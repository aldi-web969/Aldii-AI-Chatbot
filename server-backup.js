require("dotenv").config();

const express = require("express");
const path = require("path");
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

app.use(express.static(path.join(__dirname, "public")));

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.log("");
    console.log("================================");
    console.log("          ALDII AI");
    console.log("================================");
    console.log("GROQ_API_KEY tidak ditemukan");
    console.log("Periksa file .env");
    console.log("================================");
    process.exit(1);
}

const groq = new Groq({
    apiKey: apiKey
});

app.get("/", function (req, res) {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

app.get("/api/health", function (req, res) {
    res.json({
        success: true,
        message: "Aldii server online"
    });
});

app.post("/api/chat", async function (req, res) {

    try {

        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Pesan kosong"
            });
        }

        console.log("User:", message);

        const completion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content:
                            "Kamu adalah Aldii, asisten AI yang ramah dan membantu. Jawab dalam bahasa yang digunakan pengguna."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

        const answer =
            completion.choices[0].message.content;

        console.log("Aldii:", answer);

        res.json({
            success: true,
            response: answer
        });

    } catch (error) {

        console.error("");
        console.error("GROQ ERROR:");
        console.error(error.message);
        console.error("");

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, function () {

    console.log("");
    console.log("================================");
    console.log("          ALDII AI");
    console.log("================================");
    console.log("http://localhost:" + PORT);
    console.log("Groq AI");
    console.log("Chat API aktif");
    console.log("================================");
    console.log("");

});