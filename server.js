require("dotenv").config();

const express = require("express");
const path = require("path");
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;


/* ================================
   EXPRESS
================================ */

app.use(
    express.json({
        limit: "20mb"
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* ================================
   GROQ API
================================ */

const apiKey =
    process.env.GROQ_API_KEY;

if (!apiKey) {

    console.log("");

    console.log(
        "================================"
    );

    console.log(
        "          ALDII AI"
    );

    console.log(
        "================================"
    );

    console.log(
        "GROQ_API_KEY tidak ditemukan"
    );

    console.log(
        "Periksa file .env"
    );

    console.log(
        "================================"
    );

    process.exit(1);
}


const groq =
    new Groq({
        apiKey: apiKey
    });


/* ================================
   MEMBERSIHKAN JAWABAN ALDII
================================ */

function cleanAldiiResponse(text) {

    if (!text) {
        return "";
    }

    let result =
        String(text);


    /*
       Hapus bold Markdown
       **teks**
    */

    result =
        result.replace(
            /\*\*/g,
            ""
        );


    /*
       Hapus code block
       ```
    */

    result =
        result.replace(
            /```/g,
            ""
        );


    /*
       Hapus backtick
       `
    */

    result =
        result.replace(
            /`/g,
            ""
        );


    /*
       Hapus heading Markdown

       # Judul
       ## Judul
       ### Judul
    */

    result =
        result.replace(
            /^\s*#{1,6}\s*/gm,
            ""
        );


    /*
       Hapus garis Markdown
       ---
       ***
       ___
    */

    result =
        result.replace(
            /^\s*[-*_]{3,}\s*$/gm,
            ""
        );


    /*
       Rapikan baris kosong
    */

    result =
        result.replace(
            /\n{3,}/g,
            "\n\n"
        );


    /*
       Hapus spasi kosong di awal
       dan akhir jawaban
    */

    result =
        result.trim();


    return result;
}


/* ================================
   HOME
================================ */

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );
    }
);


/* ================================
   HEALTH CHECK
================================ */

app.get(
    "/api/health",
    function (req, res) {

        res.json({

            success: true,

            message:
                "Aldii server online"

        });
    }
);


/* ================================
   NORMAL CHAT
================================ */

app.post(
    "/api/chat",
    async function (req, res) {

        try {

            const message =
                req.body.message;


            if (!message) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Pesan kosong"

                });
            }


            console.log(
                "User:",
                message
            );


            const completion =
                await groq.chat.completions.create({

                    model:
                        "openai/gpt-oss-20b",


                    messages: [

                        {
                            role:
                                "system",

                            content:
                                "Kamu adalah Aldii, asisten AI yang ramah, jelas, dan membantu. Jawab dalam bahasa yang digunakan pengguna. Gunakan teks biasa yang bersih dan mudah dibaca. Jangan gunakan Markdown bold dengan tanda **. Jangan gunakan code fence dengan tanda ```. Jangan gunakan backtick. Jangan gunakan heading Markdown dengan tanda #. Jangan menggunakan simbol atau format yang tidak diperlukan. Gunakan paragraf, penomoran, atau poin sederhana hanya jika diperlukan untuk memperjelas jawaban. Jangan menambahkan simbol dekorasi yang tidak diperlukan."
                        },

                        {
                            role:
                                "user",

                            content:
                                message
                        }

                    ]
                });


            const rawAnswer =
                completion
                    .choices[0]
                    .message
                    .content;


            const answer =
                cleanAldiiResponse(
                    rawAnswer
                );


            console.log(
                "Aldii:",
                answer
            );


            res.json({

                success: true,

                response:
                    answer

            });


        } catch (error) {

            console.error("");

            console.error(
                "GROQ CHAT ERROR:"
            );

            console.error(
                error.message
            );

            console.error("");


            res.status(500).json({

                success: false,

                error:
                    error.message

            });
        }
    }
);


/* ================================
   VISION / FOTO
================================ */

app.post(
    "/api/vision",
    async function (req, res) {

        try {

            const image =
                req.body.image;


            const prompt =
                req.body.prompt ||
                "Jelaskan dan analisis gambar ini dengan bahasa Indonesia yang mudah dipahami.";


            /*
               Periksa apakah foto ada
            */

            if (!image) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Foto tidak ditemukan."

                });
            }


            /*
               Periksa format foto
            */

            if (
                typeof image !== "string" ||
                !image.startsWith(
                    "data:image/"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Format foto tidak valid."

                });
            }


            console.log(
                "Vision request diterima."
            );


            const completion =
                await groq.chat.completions.create({

                    model:
                        "qwen/qwen3.8-27b",


                    messages: [

                        {
                            role:
                                "system",

                            content:
                                "Kamu adalah Aldii Vision. Analisis gambar dengan teliti dan jawab pertanyaan pengguna dalam bahasa Indonesia. Jangan mengarang informasi yang tidak terlihat pada gambar. Gunakan teks biasa yang bersih dan mudah dibaca. Jangan gunakan Markdown bold dengan tanda **. Jangan gunakan code fence dengan tanda ```. Jangan gunakan backtick. Jangan gunakan heading Markdown dengan tanda #. Gunakan penomoran atau poin sederhana hanya jika diperlukan untuk memperjelas jawaban."
                        },


                        {
                            role:
                                "user",

                            content: [

                                {
                                    type:
                                        "text",

                                    text:
                                        prompt
                                },


                                {
                                    type:
                                        "image_url",

                                    image_url: {

                                        url:
                                            image

                                    }
                                }

                            ]
                        }

                    ],


                    temperature:
                        0.4,


                    max_completion_tokens:
                        2048

                });


            const rawAnswer =
                completion
                    .choices[0]
                    .message
                    .content;


            const answer =
                cleanAldiiResponse(
                    rawAnswer
                );


            if (!answer) {

                throw new Error(
                    "Aldii Vision tidak memberikan jawaban."
                );
            }


            console.log(
                "Vision:",
                answer
            );


            res.json({

                success: true,

                response:
                    answer

            });


        } catch (error) {

            console.error("");

            console.error(
                "VISION ERROR:"
            );

            console.error(
                error.message
            );

            console.error("");


            res.status(500).json({

                success: false,

                error:
                    error.message

            });
        }
    }
);


/* ================================
   SERVER
================================ */

app.listen(
    PORT,
    function () {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "          ALDII AI"
        );

        console.log(
            "================================"
        );

        console.log(
            "http://localhost:" +
            PORT
        );

        console.log(
            "Groq AI"
        );

        console.log(
            "Chat API aktif"
        );

        console.log(
            "Vision API aktif"
        );

        console.log(
            "Clean Response aktif"
        );

        console.log(
            "================================"
        );

        console.log("");
    }
);