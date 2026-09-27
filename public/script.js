"use strict";

/* =========================================================
   ALDII AI - FRONTEND
   Cloudflare Worker API
========================================================= */

const ALDII_API =
    "https://aldii-ai.aldiansyahputrakusuma21.workers.dev";


/* =========================================================
   HELPER
========================================================= */

function byId(id) {
    return document.getElementById(id);
}


/* =========================================================
   CHAT
========================================================= */

const messageInput = byId("messageInput");
const sendButton = byId("sendButton");
const chatMessages = byId("chatMessages");

let sending = false;


function addMessage(text, type) {

    const box =
        document.createElement("div");

    box.className =
        "message " + type;


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    bubble.textContent =
        String(text);


    box.appendChild(bubble);


    if (chatMessages) {

        chatMessages.appendChild(box);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    return box;
}


/* =========================================================
   SEND BUTTON
========================================================= */

function updateButton() {

    if (!messageInput || !sendButton) {
        return;
    }


    sendButton.disabled =
        sending ||
        messageInput.value.trim().length === 0;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

function sendMessage() {

    if (sending) {
        return;
    }


    if (!messageInput) {
        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    sending = true;

    updateButton();


    addMessage(
        text,
        "user"
    );


    messageInput.value = "";


    const loading =
        addMessage(
            "Aldii sedang berpikir...",
            "ai"
        );


    fetch(
        ALDII_API + "/api/chat",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    message: text
                })
        }
    )

    .then(function(response) {

        return response
            .json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Server error " +
                        response.status
                    );

                }


                return data;

            });

    })

    .then(function(data) {

        loading.remove();


        const answer =
            data.response ||
            data.message ||
            data.answer ||
            data.error ||
            "Aldii tidak memberikan jawaban.";


        addMessage(
            answer,
            "ai"
        );


        saveHistory(
            text,
            answer
        );

    })

    .catch(function(error) {

        loading.remove();


        addMessage(
            "Gagal menghubungkan ke Aldii: " +
            error.message,
            "ai"
        );

    })

    .finally(function() {

        sending = false;

        updateButton();

    });

}


/* =========================================================
   CHAT EVENTS
========================================================= */

if (sendButton) {

    sendButton.onclick =
        sendMessage;

}


if (messageInput) {

    messageInput.oninput =
        updateButton;


    messageInput.onkeydown =
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        };

}


/* =========================================================
   PAGE TITLES
========================================================= */

const pageTitles = {

    chat:
        "Chat AI",

    vision:
        "Foto & Vision",

    files:
        "File Assistant",

    search:
        "Web Search",

    coding:
        "Coding Workspace",

    cpp:
        "C++ Assistant",

    image:
        "AI Image",

    study:
        "Study Mode",

    writing:
        "Writing Assistant",

    translator:
        "Translator",

    quiz:
        "Quiz Generator",

    voice:
        "Voice Chat",

    history:
        "Riwayat",

    favorites:
        "Favorit",

    settings:
        "Pengaturan"

};


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(name) {

    document
        .querySelectorAll(".page")
        .forEach(function(page) {

            page.classList.remove(
                "active"
            );

        });


    const page =
        byId(
            "page-" + name
        );


    if (page) {

        page.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".menu-item")
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.getAttribute(
                    "data-page"
                ) === name
            );

        });


    const title =
        byId("pageTitle");


    if (title) {

        title.textContent =
            pageTitles[name] ||
            "Aldii";

    }


    const sidebar =
        byId("sidebar");


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   MENU
========================================================= */

document
    .querySelectorAll(".menu-item")
    .forEach(function(button) {

        button.onclick =
            function() {

                showPage(
                    button.getAttribute(
                        "data-page"
                    )
                );

            };

    });


/* =========================================================
   QUICK PROMPTS
========================================================= */

document
    .querySelectorAll("[data-prompt]")
    .forEach(function(button) {

        button.onclick =
            function() {

                showPage(
                    "chat"
                );


                if (messageInput) {

                    messageInput.value =
                        button.getAttribute(
                            "data-prompt"
                        ) || "";


                    updateButton();

                    messageInput.focus();

                }

            };

    });


/* =========================================================
   MOBILE MENU
========================================================= */

if (byId("mobileMenu")) {

    byId("mobileMenu").onclick =
        function() {

            const sidebar =
                byId("sidebar");


            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        };

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(
        "aldii-theme",

        document.body.classList.contains(
            "dark"
        )
            ? "dark"
            : "light"
    );

}


if (
    localStorage.getItem(
        "aldii-theme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

}


if (byId("themeButton")) {

    byId("themeButton").onclick =
        toggleTheme;

}


if (byId("settingsTheme")) {

    byId("settingsTheme").onclick =
        toggleTheme;

}


/* =========================================================
   NEW CHAT
========================================================= */

if (byId("newChat")) {

    byId("newChat").onclick =
        function() {

            if (chatMessages) {

                chatMessages.innerHTML =

                    '<div class="welcome" id="welcome">' +

                    '<div class="welcome-logo">' +
                    'A' +
                    '</div>' +

                    '<h1>' +
                    'Bagaimana saya bisa membantu?' +
                    '</h1>' +

                    '<p>' +
                    'Tanya, kirim foto, atau gunakan salah satu tools Aldii.' +
                    '</p>' +

                    '</div>';

            }


            if (messageInput) {

                messageInput.value =
                    "";

                updateButton();

            }


            showPage(
                "chat"
            );

        };

}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory(
    question,
    answer
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "aldii-history"
            ) || "[]"
        );


    history.unshift({

        question:
            question,

        answer:
            answer,

        date:
            new Date()
                .toLocaleString(
                    "id-ID"
                )

    });


    localStorage.setItem(

        "aldii-history",

        JSON.stringify(
            history.slice(
                0,
                50
            )
        )

    );

}


function renderHistory() {

    const list =
        byId(
            "historyList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    const history =
        JSON.parse(
            localStorage.getItem(
                "aldii-history"
            ) || "[]"
        );


    if (!history.length) {

        list.textContent =
            "Belum ada riwayat.";

        return;

    }


    history.forEach(
        function(item) {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "history-item";


            const strong =
                document.createElement(
                    "strong"
                );


            strong.textContent =
                item.question || "";


            const small =
                document.createElement(
                    "small"
                );


            small.textContent =
                item.date || "";


            element.appendChild(
                strong
            );


            element.appendChild(
                small
            );


            list.appendChild(
                element
            );

        }
    );

}


if (byId("clearHistory")) {

    byId("clearHistory").onclick =
        function() {

            localStorage.removeItem(
                "aldii-history"
            );


            renderHistory();

        };

}


renderHistory();


/* =========================================================
   VISION
========================================================= */

const visionFile =
    byId("visionFile");

const visionPreview =
    byId("visionPreview");

let visionData =
    "";


if (byId("visionChoose")) {

    byId("visionChoose").onclick =
        function() {

            if (visionFile) {

                visionFile.click();

            }

        };

}


if (visionFile) {

    visionFile.onchange =
        function() {

            readVisionFile(
                visionFile.files[0]
            );

        };

}


function readVisionFile(file) {

    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        const result =
            byId(
                "visionResult"
            );


        if (result) {

            result.textContent =
                "File harus berupa gambar.";

        }


        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function() {

            visionData =
                reader.result;


            if (visionPreview) {

                if (
                    visionPreview.tagName ===
                    "IMG"
                ) {

                    visionPreview.src =
                        visionData;

                }

                else {

                    visionPreview.innerHTML =
                        "";


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        visionData;


                    image.alt =
                        "Preview";


                    visionPreview.appendChild(
                        image
                    );

                }


                visionPreview.style.display =
                    "block";

            }

        };


    reader.onerror =
        function() {

            const result =
                byId(
                    "visionResult"
                );


            if (result) {

                result.textContent =
                    "Gagal membaca foto.";

            }

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   VISION REQUEST
========================================================= */

if (byId("visionAsk")) {

    byId("visionAsk").onclick =
        function() {

            if (!visionData) {

                const result =
                    byId(
                        "visionResult"
                    );


                if (result) {

                    result.textContent =
                        "Pilih foto terlebih dahulu.";

                }


                return;

            }


            const promptInput =
                byId(
                    "visionPrompt"
                );


            let prompt =
                promptInput
                    ? promptInput.value.trim()
                    : "";


            if (!prompt) {

                prompt =
                    "Analisis foto ini dan jelaskan apa yang terlihat dengan bahasa Indonesia yang mudah dipahami. Jika foto berisi soal tugas, bantu jelaskan dan kerjakan dengan langkah yang jelas.";

            }


            const result =
                byId(
                    "visionResult"
                );


            if (result) {

                result.textContent =
                    "Aldii sedang menganalisis foto...";

            }


            fetch(
                ALDII_API +
                "/api/vision",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            image:
                                visionData,

                            prompt:
                                prompt

                        })

                }

            )

            .then(function(response) {

                return response
                    .json()
                    .then(function(data) {

                        if (!response.ok) {

                            throw new Error(
                                data.error ||
                                "Vision server error " +
                                response.status
                            );

                        }


                        return data;

                    });

            })

            .then(function(data) {

                if (result) {

                    result.textContent =
                        data.response ||
                        data.error ||
                        "Tidak ada jawaban.";

                }

            })

            .catch(function(error) {

                if (result) {

                    result.textContent =
                        "Gagal: " +
                        error.message;

                }

            });

        };

}


/* =========================================================
   FILE ASSISTANT
========================================================= */

const fileInput =
    byId("fileInput");


if (byId("fileChoose")) {

    byId("fileChoose").onclick =
        function() {

            if (fileInput) {

                fileInput.click();

            }

        };

}


if (fileInput) {

    fileInput.onchange =
        function() {

            const file =
                fileInput.files[0];


            const result =
                byId(
                    "fileResult"
                );


            if (result) {

                result.textContent =
                    file

                    ? "File dipilih: " +
                      file.name

                    : "Belum ada file yang dipilih.";

            }

        };

}


/* =========================================================
   GENERIC AI REQUEST
========================================================= */

function askChat(
    prompt,
    resultId
) {

    const result =
        byId(
            resultId
        );


    if (!result) {
        return;
    }


    if (!prompt.trim()) {

        result.textContent =
            "Masukkan permintaan terlebih dahulu.";

        return;

    }


    result.textContent =
        "Aldii sedang memproses...";


    fetch(
        ALDII_API +
        "/api/chat",

        {

            method:
                "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:

                JSON.stringify({

                    message:
                        prompt

                })

        }

    )

    .then(function(response) {

        return response
            .json()
            .then(function(data) {

                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Server error " +
                        response.status
                    );

                }


                return data;

            });

    })

    .then(function(data) {

        result.textContent =
            data.response ||
            data.error ||
            "Tidak ada jawaban.";

    })

    .catch(function(error) {

        result.textContent =
            "Gagal: " +
            error.message;

    });

}


/* =========================================================
   SEARCH
========================================================= */

if (byId("searchAsk")) {

    byId("searchAsk").onclick =
        function() {

            const input =
                byId(
                    "searchInput"
                );


            askChat(

                "Cari dan jelaskan informasi tentang: " +
                (input ? input.value : ""),

                "searchResult"

            );

        };

}


/* =========================================================
   WRITING
========================================================= */

if (byId("writingAsk")) {

    byId("writingAsk").onclick =
        function() {

            const input =
                byId(
                    "writingInput"
                );


            askChat(

                "Bantu saya membuat atau memperbaiki tulisan berikut:\n" +
                (input ? input.value : ""),

                "writingResult"

            );

        };

}


/* =========================================================
   STUDY
========================================================= */

if (byId("studyExplain")) {

    byId("studyExplain").onclick =
        function() {

            const input =
                byId(
                    "studyInput"
                );


            askChat(

                "Ajarkan topik berikut secara bertahap, sederhana, dengan contoh:\n" +
                (input ? input.value : ""),

                "studyResult"

            );

        };

}


if (byId("studyQuiz")) {

    byId("studyQuiz").onclick =
        function() {

            const input =
                byId(
                    "studyInput"
                );


            askChat(

                "Buat 5 soal latihan beserta jawaban tentang:\n" +
                (input ? input.value : ""),

                "studyResult"

            );

        };

}


/* =========================================================
   TRANSLATOR
========================================================= */

if (byId("translateAsk")) {

    byId("translateAsk").onclick =
        function() {

            const target =
                byId(
                    "translateTarget"
                );


            const input =
                byId(
                    "translateInput"
                );


            askChat(

                "Terjemahkan teks berikut ke " +

                (
                    target
                    ? target.value
                    : "Indonesia"
                ) +

                ". Hanya berikan hasil terjemahannya:\n" +

                (
                    input
                    ? input.value
                    : ""
                ),

                "translateResult"

            );

        };

}


/* =========================================================
   QUIZ
========================================================= */

if (byId("quizAsk")) {

    byId("quizAsk").onclick =
        function() {

            const input =
                byId(
                    "quizInput"
                );


            askChat(

                "Buat 5 soal pilihan ganda tentang:\n" +
                (input ? input.value : ""),

                "quizResult"

            );

        };

}


/* =========================================================
   COPY
========================================================= */

function copyText(value) {

    const text =
        value || "";


    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard.writeText(
            text
        );

        return;

    }


    const area =
        document.createElement(
            "textarea"
        );


    area.value =
        text;


    document.body.appendChild(
        area
    );


    area.select();


    document.execCommand(
        "copy"
    );


    area.remove();

}


/* =========================================================
   CODING WORKSPACE
========================================================= */

if (byId("codingRun")) {

    byId("codingRun").onclick =
        function() {

            const html =
                byId("codingHtml")
                ? byId("codingHtml").value
                : "";


            const css =
                byId("codingCss")
                ? byId("codingCss").value
                : "";


            const js =
                byId("codingJs")
                ? byId("codingJs").value
                : "";


            const preview =
                byId(
                    "codingPreview"
                );


            if (!preview) {
                return;
            }


            preview.srcdoc =

                "<!doctype html>" +

                "<html>" +

                "<head>" +

                "<style>" +
                css +
                "</style>" +

                "</head>" +

                "<body>" +

                html +

                "<script>" +

                js.replace(
                    /<\/script>/gi,
                    "<\\/script>"
                ) +

                "<\/script>" +

                "</body>" +

                "</html>";

        };

}


/* =========================================================
   CLEAR CODING
========================================================= */

if (byId("codingClear")) {

    byId("codingClear").onclick =
        function() {

            if (byId("codingHtml")) {

                byId(
                    "codingHtml"
                ).value =
                    "";

            }


            if (byId("codingCss")) {

                byId(
                    "codingCss"
                ).value =
                    "";

            }


            if (byId("codingJs")) {

                byId(
                    "codingJs"
                ).value =
                    "";

            }


            if (byId("codingPreview")) {

                byId(
                    "codingPreview"
                ).srcdoc =
                    "";

            }

        };

}


/* =========================================================
   COPY HTML
========================================================= */

if (byId("codingCopyHtml")) {

    byId("codingCopyHtml").onclick =
        function() {

            copyText(

                byId("codingHtml")
                ? byId("codingHtml").value
                : ""

            );

        };

}


/* =========================================================
   COPY CSS
========================================================= */

if (byId("codingCopyCss")) {

    byId("codingCopyCss").onclick =
        function() {

            copyText(

                byId("codingCss")
                ? byId("codingCss").value
                : ""

            );

        };

}


/* =========================================================
   COPY JS
========================================================= */

if (byId("codingCopyJs")) {

    byId("codingCopyJs").onclick =
        function() {

            copyText(

                byId("codingJs")
                ? byId("codingJs").value
                : ""

            );

        };

}


/* =========================================================
   C++ ASSISTANT
========================================================= */

function cppAsk(mode) {

    const input =
        byId(
            "cppInput"
        );


    const code =
        input
        ? input.value
        : "";


    if (mode === "fix") {

        askChat(

            "Perbaiki kode C++ berikut dan berikan kode yang sudah benar:\n" +
            code,

            "cppResult"

        );

    }

    else {

        askChat(

            "Jelaskan kode C++ berikut dengan bahasa sederhana:\n" +
            code,

            "cppResult"

        );

    }

}


if (byId("cppExplain")) {

    byId("cppExplain").onclick =
        function() {

            cppAsk(
                "explain"
            );

        };

}


if (byId("cppFix")) {

    byId("cppFix").onclick =
        function() {

            cppAsk(
                "fix"
            );

        };

}


if (byId("cppCopy")) {

    byId("cppCopy").onclick =
        function() {

            copyText(

                byId("cppInput")
                ? byId("cppInput").value
                : ""

            );

        };

}


/* =========================================================
   VOICE
========================================================= */

if (byId("voiceStart")) {

    byId("voiceStart").onclick =
        function() {

            const output =
                byId(
                    "voiceResult"
                );


            if (!output) {
                return;
            }


            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;


            if (!SpeechRecognition) {

                output.textContent =
                    "Browser ini tidak mendukung voice input.";

                return;

            }


            const recognition =
                new SpeechRecognition();


            recognition.lang =
                "id-ID";


            recognition.interimResults =
                false;


            recognition.continuous =
                false;


            recognition.onstart =
                function() {

                    output.textContent =
                        "Mendengarkan...";

                };


            recognition.onresult =
                function(event) {

                    if (messageInput) {

                        messageInput.value =
                            event
                                .results[0][0]
                                .transcript;


                        updateButton();


                        showPage(
                            "chat"
                        );


                        messageInput.focus();

                    }

                };


            recognition.onerror =
                function(event) {

                    output.textContent =
                        "Voice error: " +
                        event.error;

                };


            recognition.onend =
                function() {

                    if (
                        output.textContent ===
                        "Mendengarkan..."
                    ) {

                        output.textContent =
                            "Selesai.";

                    }

                };


            recognition.start();

        };

}


/* =========================================================
   AI IMAGE
========================================================= */

if (byId("generateImage")) {

    byId("generateImage").onclick =
        function() {

            alert(
                "AI Image membutuhkan endpoint image generation dari provider."
            );

        };

}


/* =========================================================
   START
========================================================= */

updateButton();


console.log(
    "================================"
);

console.log(
    "       ALDII FRONTEND"
);

console.log(
    "================================"
);

console.log(
    "Cloudflare Worker:"
);

console.log(
    ALDII_API
);

console.log(
    "Aldii frontend loaded successfully."
);

console.log(
    "================================"
);