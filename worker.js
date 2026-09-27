export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        // =========================
        // CORS
        // =========================

        if (request.method === "OPTIONS") {

            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            });

        }


        // =========================
        // HOME
        // =========================

        if (
            url.pathname === "/" &&
            request.method === "GET"
        ) {

            return env.ASSETS.fetch(request);

        }


        // =========================
        // HEALTH
        // =========================

        if (
            url.pathname === "/api/health" &&
            request.method === "GET"
        ) {

            return json({
                success: true,
                message: "Aldii Worker online"
            });

        }


        // =========================
        // CHAT
        // =========================

        if (
            url.pathname === "/api/chat" &&
            request.method === "POST"
        ) {

            try {

                const body =
                    await request.json();

                const message =
                    body.message;

                if (!message) {

                    return json(
                        {
                            success: false,
                            error: "Pesan kosong"
                        },
                        400
                    );

                }


                const response =
                    await fetch(
                        "https://api.groq.com/openai/v1/chat/completions",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${env.GROQ_API_KEY}`
                            },

                            body: JSON.stringify({

                                model:
                                    "openai/gpt-oss-20b",

                                messages: [

                                    {
                                        role: "system",

                                        content:
                                            "Kamu adalah Aldii, asisten AI yang ramah, jelas, dan membantu. Jawab dalam bahasa yang digunakan pengguna."
                                    },

                                    {
                                        role: "user",

                                        content: message
                                    }

                                ]

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    return json(
                        {
                            success: false,
                            error:
                                data.error?.message ||
                                "Groq API error"
                        },
                        response.status
                    );

                }


                const answer =
                    data.choices?.[0]?.message?.content ||
                    "Aldii tidak memberikan jawaban.";


                return json({

                    success: true,

                    response: answer

                });


            } catch (error) {

                return json(
                    {
                        success: false,
                        error: error.message
                    },
                    500
                );

            }

        }

        // =========================
// VISION / FOTO
// =========================

if (
    url.pathname === "/api/vision" &&
    request.method === "POST"
) {

    try {

        const body =
            await request.json();

        const image =
            body.image;

        const prompt =
            body.prompt ||
            "Jelaskan dan analisis gambar ini dengan bahasa Indonesia yang mudah dipahami.";

        if (!image) {

            return json(
                {
                    success: false,
                    error: "Foto tidak ditemukan."
                },
                400
            );

        }

        if (
            typeof image !== "string" ||
            !image.startsWith("data:image/")
        ) {

            return json(
                {
                    success: false,
                    error: "Format foto tidak valid."
                },
                400
            );

        }

        const response =
            await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${env.GROQ_API_KEY}`
                    },

                    body: JSON.stringify({

                        model:
                            "meta-llama/llama-4-scout-17b-16e-instruct",

                        messages: [

                            {
                                role: "system",

                                content:
                                    "Kamu adalah Aldii Vision. Analisis gambar dengan teliti. Jangan mengarang informasi yang tidak terlihat. Jawab dalam bahasa Indonesia yang jelas dan mudah dipahami."
                            },

                            {
                                role: "user",

                                content: [

                                    {
                                        type: "text",

                                        text: prompt
                                    },

                                    {
                                        type: "image_url",

                                        image_url: {
                                            url: image
                                        }
                                    }

                                ]
                            }

                        ],

                        temperature: 0.4,

                        max_tokens: 2048

                    })

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            return json(
                {
                    success: false,
                    error:
                        data.error?.message ||
                        "Vision API error"
                },
                response.status
            );

        }

        const answer =
            data.choices?.[0]?.message?.content ||
            "Aldii tidak dapat menganalisis gambar.";

        return json({

            success: true,

            response: answer

        });

    } catch (error) {

        return json(
            {
                success: false,
                error: error.message
            },
            500
        );

    }

}

        // =========================
        // NOT FOUND
        // =========================

        return json(
            {
                success: false,
                error: "Endpoint tidak ditemukan."
            },
            404
        );

    }
};


function json(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json",

                "Access-Control-Allow-Origin":
                    "*",

                "Access-Control-Allow-Methods":
                    "GET, POST, OPTIONS",

                "Access-Control-Allow-Headers":
                    "Content-Type"
            }
        }
    );

}