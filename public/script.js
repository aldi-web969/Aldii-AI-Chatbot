"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const $ = (id) => document.getElementById(id);

    /* =========================================================
       ELEMENT
    ========================================================= */

    const sidebar = $("sidebar");
    const chatMessages = $("chatMessages");
    const messageInput = $("messageInput");
    const sendButton = $("sendButton");

    const newChat = $("newChat");
    const mobileMenu = $("mobileMenu");
    const themeButton = $("themeButton");
    const pageTitle = $("pageTitle");


    /* =========================================================
       STATE
    ========================================================= */

    let chats = JSON.parse(
        localStorage.getItem("aldii_chats") || "[]"
    );

    let currentChat = null;
    let loading = false;


    /* =========================================================
       STORAGE
    ========================================================= */

    function saveChats() {
        localStorage.setItem(
            "aldii_chats",
            JSON.stringify(chats)
        );
    }


    /* =========================================================
       CHAT
    ========================================================= */

    function createChat() {

        const chat = {
            id: Date.now(),
            title: "Chat Baru",
            messages: []
        };

        chats.unshift(chat);
        currentChat = chat;

        saveChats();
        renderChat();
    }


    function renderChat() {

        if (!chatMessages) return;

        chatMessages.innerHTML = "";

        if (
            !currentChat ||
            currentChat.messages.length === 0
        ) {

            chatMessages.innerHTML = `
                <div class="welcome" id="welcome">

                    <div class="welcome-logo">
                        A
                    </div>

                    <h1>
                        Bagaimana saya bisa membantu?
                    </h1>

                    <p>
                        Tanyakan sesuatu kepada Aldii.
                    </p>

                </div>
            `;

            return;
        }


        currentChat.messages.forEach((message) => {

            addMessage(
                message.role,
                message.content,
                false
            );

        });

        scrollBottom();
    }


    /* =========================================================
       FORMAT PESAN
    ========================================================= */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = String(text ?? "");

        return div.innerHTML;
    }


    function formatMessage(text) {

        let value = String(text ?? "");

        /*
         Jangan tampilkan Markdown bold.
         **teks** -> teks
        */

        value = value.replace(/\*\*(.*?)\*\*/gs, "$1");

        /*
         Markdown heading
        */

        value = value.replace(
            /^\s*#{1,6}\s+/gm,
            ""
        );

        /*
         Backtick tunggal
        */

        value = value.replace(/`([^`]+)`/g, "$1");

        /*
         Code fence
        */

        value = value.replace(
            /```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/g,
            "$1"
        );

        /*
         Escape HTML agar aman
        */

        value = escapeHTML(value);

        /*
         Baris baru
        */

        value = value.replace(/\n/g, "<br>");

        return value;
    }


    /* =========================================================
       COPY ICON
    ========================================================= */

    function createCopyButton(content) {

        const button =
            document.createElement("button");

        button.className = "copy-message";

        button.type = "button";

        button.setAttribute(
            "aria-label",
            "Salin jawaban"
        );

        button.title = "Salin";

        button.innerHTML = `
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                ></rect>

                <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                ></path>
            </svg>
        `;


        button.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        String(content ?? "")
                    );

                    button.innerHTML = `
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                    `;

                    button.title = "Tersalin";

                    setTimeout(() => {

                        button.innerHTML = `
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    x="9"
                                    y="9"
                                    width="11"
                                    height="11"
                                    rx="2"
                                ></rect>

                                <path
                                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                ></path>
                            </svg>
                        `;

                        button.title = "Salin";

                    }, 1200);

                } catch (error) {

                    console.error(
                        "Copy error:",
                        error
                    );

                }

            }
        );

        return button;
    }


    /* =========================================================
       ADD MESSAGE
    ========================================================= */

    function addMessage(
        role,
        content,
        shouldScroll = true
    ) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            role === "user"
                ? "message user"
                : "message ai";


        const bubble =
            document.createElement("div");

        bubble.className =
            "message-bubble";


        const text =
            document.createElement("div");

        text.className =
            "message-content";

        text.innerHTML =
            formatMessage(content);


        bubble.appendChild(text);


        /*
         Tombol copy hanya untuk jawaban Aldii
        */

        if (role === "assistant") {

            const actions =
                document.createElement("div");

            actions.className =
                "message-actions";

            const copyButton =
                createCopyButton(content);

            actions.appendChild(
                copyButton
            );

            bubble.appendChild(
                actions
            );
        }


        wrapper.appendChild(bubble);

        chatMessages.appendChild(wrapper);


        if (shouldScroll) {
            scrollBottom();
        }
    }


    function scrollBottom() {

        if (!chatMessages) return;

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    /* =========================================================
       API CHAT
    ========================================================= */

    async function askAldii(
        prompt,
        options = {}
    ) {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: prompt,

                        history:
                            options.history || []

                    })
                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Server tidak memberikan respons JSON."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Aldii gagal memberikan jawaban."
            );

        }


        return (
            data.response ||
            data.message ||
            ""
        );
    }


    /* =========================================================
       SEND CHAT
    ========================================================= */

    async function sendMessage() {

        if (loading) return;

        const text =
            messageInput.value.trim();

        if (!text) return;


        if (!currentChat) {
            createChat();
        }


        const history =
            currentChat.messages.map(
                (message) => ({
                    role:
                        message.role,
                    content:
                        message.content
                })
            );


        currentChat.messages.push({

            role: "user",

            content: text

        });


        if (
            currentChat.title ===
            "Chat Baru"
        ) {

            currentChat.title =
                text.length > 40
                    ? text.substring(0, 40) + "..."
                    : text;

        }


        messageInput.value = "";

        renderChat();

        saveChats();


        loading = true;

        if (sendButton) {
            sendButton.disabled = true;
        }


        /*
         Tampilkan loading
        */

        const loadingWrapper =
            document.createElement("div");

        loadingWrapper.className =
            "message ai";

        loadingWrapper.id =
            "aldiiLoading";

        loadingWrapper.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">
                    Aldii sedang berpikir...
                </div>
            </div>
        `;

        chatMessages.appendChild(
            loadingWrapper
        );

        scrollBottom();


        try {

            const answer =
                await askAldii(
                    text,
                    {
                        history
                    }
                );


            const loadingElement =
                $("aldiiLoading");

            if (loadingElement) {
                loadingElement.remove();
            }


            currentChat.messages.push({

                role: "assistant",

                content:
                    answer

            });


            saveChats();

            renderChat();


        } catch (error) {

            const loadingElement =
                $("aldiiLoading");

            if (loadingElement) {
                loadingElement.remove();
            }


            currentChat.messages.push({

                role: "assistant",

                content:
                    "Maaf, terjadi kesalahan: " +
                    error.message

            });


            saveChats();

            renderChat();


            console.error(
                "Aldii error:",
                error
            );

        } finally {

            loading = false;

            if (sendButton) {
                sendButton.disabled = false;
            }

            messageInput.focus();
        }
    }


    /* =========================================================
       SEND BUTTON
    ========================================================= */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );
    }


    if (messageInput) {

        messageInput.addEventListener(
            "input",
            () => {

                sendButton.disabled =
                    !messageInput.value.trim();

            }
        );


        messageInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }


    /* =========================================================
       NEW CHAT
    ========================================================= */

    if (newChat) {

        newChat.addEventListener(
            "click",
            () => {

                createChat();

                openPage("chat");
            }
        );
    }


    /* =========================================================
       MOBILE MENU
    ========================================================= */

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );
    }


    /* =========================================================
       THEME
    ========================================================= */

    function toggleTheme() {

        document.body.classList.toggle(
            "dark"
        );

        localStorage.setItem(
            "aldii_theme",
            document.body.classList.contains("dark")
                ? "dark"
                : "light"
        );
    }


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );
    }


    if (
        localStorage.getItem(
            "aldii_theme"
        ) === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );
    }


    /* =========================================================
       PAGE NAVIGATION
    ========================================================= */

    document
        .querySelectorAll("[data-page]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.page
                    );

                }
            );

        });


    function openPage(page) {

        document
            .querySelectorAll(".page")
            .forEach((element) => {

                element.classList.remove(
                    "active"
                );

            });


        const target =
            $(`page-${page}`);


        if (target) {

            target.classList.add(
                "active"
            );
        }


        document
            .querySelectorAll(".menu-item")
            .forEach((item) => {

                item.classList.remove(
                    "active"
                );

            });


        const menu =
            document.querySelector(
                `[data-page="${page}"]`
            );


        if (menu) {
            menu.classList.add("active");
        }


        const titles = {

            chat: "Chat AI",
            vision: "Foto & Vision",
            files: "File Assistant",
            search: "Web Search",
            coding: "Coding Workspace",
            cpp: "C++ Assistant",
            image: "AI Image",
            study: "Study Mode",
            writing: "Writing Assistant",
            translator: "Translator",
            quiz: "Quiz Generator",
            voice: "Voice Chat",
            history: "Riwayat",
            favorites: "Favorit",
            settings: "Pengaturan"

        };


        if (
            pageTitle &&
            titles[page]
        ) {

            pageTitle.textContent =
                titles[page];

        }


        if (window.innerWidth <= 700) {

            sidebar.classList.remove(
                "open"
            );

        }
    }


    /* =========================================================
       GENERIC AI TOOL
    ========================================================= */

    async function runTool({
        inputId,
        resultId,
        prompt
    }) {

        const input = $(inputId);
        const result = $(resultId);

        if (!input || !result) {
            return;
        }


        const value =
            input.value.trim();


        if (!value) {

            result.textContent =
                "Masukkan materi terlebih dahulu.";

            return;
        }


        result.textContent =
            "Aldii sedang memproses...";


        try {

            const answer =
                await askAldii(
                    prompt(value)
                );


            result.textContent =
                answer;

        } catch (error) {

            result.textContent =
                "Terjadi kesalahan: " +
                error.message;

            console.error(error);
        }
    }


    /* =========================================================
       STUDY MODE
    ========================================================= */

    const studyExplain =
        $("studyExplain");

    const studyQuiz =
        $("studyQuiz");


    if (studyExplain) {

        studyExplain.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "studyInput",

                    resultId:
                        "studyResult",

                    prompt:
                        (text) =>
                            "Jelaskan materi berikut dengan bahasa Indonesia yang mudah dipahami. " +
                            "Berikan penjelasan bertahap, contoh sederhana, dan ringkasan di akhir. " +
                            "Jangan menggunakan tanda ** untuk format teks.\n\n" +
                            "Materi:\n" +
                            text

                });

            }
        );
    }


    if (studyQuiz) {

        studyQuiz.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "studyInput",

                    resultId:
                        "studyResult",

                    prompt:
                        (text) =>
                            "Buat latihan soal berdasarkan materi berikut. " +
                            "Buat 5 soal dengan tingkat kesulitan bertahap. " +
                            "Berikan pilihan jawaban jika cocok dan sertakan kunci jawaban di bagian akhir. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            "Materi:\n" +
                            text

                });

            }
        );
    }


    /* =========================================================
       WRITING ASSISTANT
    ========================================================= */

    const writingAsk =
        $("writingAsk");


    if (writingAsk) {

        writingAsk.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "writingInput",

                    resultId:
                        "writingResult",

                    prompt:
                        (text) =>
                            "Bantu pengguna memperbaiki atau membuat tulisan berikut. " +
                            "Pertahankan maksud asli. Gunakan bahasa yang natural dan mudah dibaca. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            text

                });

            }
        );
    }


    /* =========================================================
       TRANSLATOR
    ========================================================= */

    const translateAsk =
        $("translateAsk");


    if (translateAsk) {

        translateAsk.addEventListener(
            "click",
            async () => {

                const input =
                    $("translateInput");

                const target =
                    $("translateTarget");

                const result =
                    $("translateResult");


                if (!input || !result) {
                    return;
                }


                const text =
                    input.value.trim();


                const language =
                    target
                        ? target.value.trim()
                        : "English";


                if (!text) {

                    result.textContent =
                        "Masukkan teks terlebih dahulu.";

                    return;
                }


                result.textContent =
                    "Menerjemahkan...";


                try {

                    const answer =
                        await askAldii(

                            "Terjemahkan teks berikut ke " +
                            language +
                            ". Jangan memberikan penjelasan tambahan kecuali diperlukan. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            text

                        );


                    result.textContent =
                        answer;

                } catch (error) {

                    result.textContent =
                        "Terjadi kesalahan: " +
                        error.message;
                }
            }
        );
    }


    /* =========================================================
       QUIZ GENERATOR
    ========================================================= */

    const quizAsk =
        $("quizAsk");


    if (quizAsk) {

        quizAsk.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "quizInput",

                    resultId:
                        "quizResult",

                    prompt:
                        (text) =>
                            "Buat quiz berdasarkan topik berikut. " +
                            "Buat 5 pertanyaan. Sertakan pilihan A, B, C, D jika sesuai. " +
                            "Letakkan kunci jawaban setelah semua pertanyaan. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            "Topik:\n" +
                            text

                });

            }
        );
    }


    /* =========================================================
       C++ ASSISTANT
    ========================================================= */

    const cppExplain =
        $("cppExplain");

    const cppFix =
        $("cppFix");


    if (cppExplain) {

        cppExplain.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "cppInput",

                    resultId:
                        "cppResult",

                    prompt:
                        (code) =>
                            "Jelaskan kode C++ berikut secara sederhana. " +
                            "Jelaskan fungsi setiap bagian penting dan cara kerjanya. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            code

                });

            }
        );
    }


    if (cppFix) {

        cppFix.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "cppInput",

                    resultId:
                        "cppResult",

                    prompt:
                        (code) =>
                            "Periksa kode C++ berikut. " +
                            "Cari kesalahan dan berikan versi kode yang sudah diperbaiki. " +
                            "Jelaskan perubahan yang dilakukan. " +
                            "Jangan menggunakan tanda **.\n\n" +
                            code

                });

            }
        );
    }


    /* =========================================================
       SEARCH
    ========================================================= */

    const searchAsk =
        $("searchAsk");


    if (searchAsk) {

        searchAsk.addEventListener(
            "click",
            () => {

                runTool({

                    inputId:
                        "searchInput",

                    resultId:
                        "searchResult",

                    prompt:
                        (text) =>
                            "Jawab pertanyaan berikut berdasarkan pengetahuan yang kamu miliki. " +
                            "Jika membutuhkan informasi internet terbaru, katakan bahwa fitur pencarian web belum aktif. " +
                            "Jangan mengarang sumber. Jangan menggunakan tanda **.\n\n" +
                            text

                });

            }
        );
    }


    /* =========================================================
       CODING WORKSPACE
    ========================================================= */

    const codingRun =
        $("codingRun");

    const codingClear =
        $("codingClear");

    const codingPreview =
        $("codingPreview");


    if (codingRun) {

        codingRun.addEventListener(
            "click",
            () => {

                const html =
                    $("codingHtml")?.value || "";

                const css =
                    $("codingCss")?.value || "";

                const js =
                    $("codingJs")?.value || "";


                if (codingPreview) {

                    codingPreview.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>
${css}
</style>

</head>

<body>

${html}

<script>
${js.replace(
    /<\/script>/gi,
    "<\\/script>"
)}
<\/script>

</body>
</html>
                    `;

                }

            }
        );
    }


    if (codingClear) {

        codingClear.addEventListener(
            "click",
            () => {

                if ($("codingHtml"))
                    $("codingHtml").value = "";

                if ($("codingCss"))
                    $("codingCss").value = "";

                if ($("codingJs"))
                    $("codingJs").value = "";

                if (codingPreview)
                    codingPreview.srcdoc = "";

            }
        );
    }


    /* =========================================================
       COPY CODING
    ========================================================= */

    function setupCopy(
        buttonId,
        inputId
    ) {

        const button =
            $(buttonId);

        const input =
            $(inputId);


        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        input.value
                    );

                    const oldText =
                        button.textContent;

                    button.textContent =
                        "Tersalin";

                    setTimeout(() => {

                        button.textContent =
                            oldText;

                    }, 1000);

                } catch (error) {

                    console.error(error);

                }

            }
        );
    }


    setupCopy(
        "codingCopyHtml",
        "codingHtml"
    );

    setupCopy(
        "codingCopyCss",
        "codingCss"
    );

    setupCopy(
        "codingCopyJs",
        "codingJs"
    );


    /* =========================================================
       IMAGE
    ========================================================= */

    const generateImage =
        $("generateImage");

    if (generateImage) {

        generateImage.addEventListener(
            "click",
            () => {

                const prompt =
                    $("imagePrompt");

                const result =
                    $("imageResult");


                if (!prompt || !result) {
                    return;
                }


                if (!prompt.value.trim()) {

                    result.textContent =
                        "Masukkan prompt gambar terlebih dahulu.";

                    return;
                }


                result.textContent =
                    "Fitur AI Image membutuhkan endpoint image di server.";

            }
        );
    }


    /* =========================================================
       VISION
    ========================================================= */

    const visionChoose =
        $("visionChoose");

    const visionFile =
        $("visionFile");

    const visionPreview =
        $("visionPreview");

    const visionAsk =
        $("visionAsk");


    if (
        visionChoose &&
        visionFile
    ) {

        visionChoose.addEventListener(
            "click",
            () => {

                visionFile.click();

            }
        );
    }


    if (visionFile) {

        visionFile.addEventListener(
            "change",
            () => {

                const file =
                    visionFile.files[0];

                if (!file) return;


                const reader =
                    new FileReader();


                reader.onload =
                    (event) => {

                        if (!visionPreview)
                            return;

                        visionPreview.src =
                            event.target.result;

                        visionPreview.style.display =
                            "block";

                    };


                reader.readAsDataURL(file);
            }
        );
    }


    if (visionAsk) {

        visionAsk.addEventListener(
            "click",
            async () => {

                const result =
                    $("visionResult");


                const prompt =
                    $("visionPrompt");


                if (
                    !visionFile ||
                    !visionFile.files[0]
                ) {

                    if (result) {

                        result.textContent =
                            "Pilih foto terlebih dahulu.";

                    }

                    return;
                }


                if (result) {

                    result.textContent =
                        "Aldii sedang menganalisis foto...";

                }


                try {

                    const file =
                        visionFile.files[0];


                    const image =
                        await fileToBase64(file);


                    const response =
                        await fetch(
                            "/api/vision",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        image,

                                        prompt:
                                            prompt?.value.trim() ||
                                            "Jelaskan isi foto ini dengan jelas."

                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Vision gagal."
                        );
                    }


                    if (result) {

                        result.textContent =
                            data.response || "";

                    }

                } catch (error) {

                    if (result) {

                        result.textContent =
                            "Terjadi kesalahan: " +
                            error.message;

                    }

                    console.error(error);
                }
            }
        );
    }


    function fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload =
                    () => resolve(
                        reader.result
                    );

                reader.onerror =
                    reject;

                reader.readAsDataURL(file);

            }
        );
    }


    /* =========================================================
       VOICE
    ========================================================= */

    const voiceStart =
        $("voiceStart");

    const voiceResult =
        $("voiceResult");


    if (
        voiceStart &&
        "webkitSpeechRecognition" in window
    ) {

        const recognition =
            new webkitSpeechRecognition();


        recognition.lang =
            "id-ID";

        recognition.continuous =
            false;

        recognition.interimResults =
            false;


        voiceStart.addEventListener(
            "click",
            () => {

                voiceResult.textContent =
                    "Silakan berbicara...";

                recognition.start();

            }
        );


        recognition.onresult =
            (event) => {

                const text =
                    event.results[0][0].transcript;


                messageInput.value =
                    text;

                messageInput.dispatchEvent(
                    new Event("input")
                );

                messageInput.focus();


                voiceResult.textContent =
                    "Suara berhasil diterima.";

            };


        recognition.onerror =
            () => {

                voiceResult.textContent =
                    "Mikrofon tidak dapat digunakan.";

            };

    } else if (voiceStart) {

        voiceStart.addEventListener(
            "click",
            () => {

                if (voiceResult) {

                    voiceResult.textContent =
                        "Browser ini tidak mendukung voice input.";

                }

            }
        );
    }


    /* =========================================================
       HISTORY
    ========================================================= */

    const historyList =
        $("historyList");

    const clearHistory =
        $("clearHistory");


    function renderHistory() {

        if (!historyList)
            return;


        historyList.innerHTML = "";


        if (chats.length === 0) {

            historyList.textContent =
                "Belum ada riwayat chat.";

            return;
        }


        chats.forEach((chat) => {

            const item =
                document.createElement("button");

            item.type =
                "button";

            item.className =
                "history-item";

            item.textContent =
                chat.title;


            item.addEventListener(
                "click",
                () => {

                    currentChat =
                        chat;

                    openPage("chat");

                    renderChat();

                }
            );


            historyList.appendChild(
                item
            );

        });
    }


    if (clearHistory) {

        clearHistory.addEventListener(
            "click",
            () => {

                chats = [];

                currentChat = null;

                saveChats();

                renderHistory();

                renderChat();

            }
        );
    }


    /* =========================================================
       FAVORITES
    ========================================================= */

    const favoritesList =
        $("favoritesList");


    if (favoritesList) {

        favoritesList.textContent =
            "Belum ada favorit.";

    }


    /* =========================================================
       SETTINGS
    ========================================================= */

    const settingsTheme =
        $("settingsTheme");


    if (settingsTheme) {

        settingsTheme.addEventListener(
            "click",
            toggleTheme
        );
    }


    /* =========================================================
       INIT
    ========================================================= */

    if (chats.length > 0) {

        currentChat =
            chats[0];

    } else {

        createChat();

    }


    renderChat();

    renderHistory();


    console.log(
        "Aldii V6 script loaded."
    );

});

/* =========================================================
   ALDII V6
   FITUR TUGAS
   FOTO TUGAS + UPLOAD FILE TUGAS
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       HELPER
    ===================================================== */

    function getElement(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       FOTO TUGAS
    ===================================================== */

    const taskVisionFile =
        getElement("visionFile");

    const taskVisionChoose =
        getElement("visionChoose");

    const taskVisionPreview =
        getElement("visionPreview");

    const taskVisionPrompt =
        getElement("visionPrompt");

    const taskVisionAsk =
        getElement("visionAsk");

    const taskVisionResult =
        getElement("visionResult");


    let taskVisionImage = "";


    /*
       Tombol pilih foto
    */

    if (
        taskVisionChoose &&
        taskVisionFile
    ) {

        taskVisionChoose.addEventListener(
            "click",
            function () {

                taskVisionFile.click();

            }
        );

    }


    /*
       Saat foto dipilih
    */

    if (taskVisionFile) {

        taskVisionFile.addEventListener(
            "change",
            function () {

                const file =
                    taskVisionFile.files &&
                    taskVisionFile.files[0];


                if (!file) {

                    return;

                }


                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    if (taskVisionResult) {

                        taskVisionResult.textContent =
                            "File yang dipilih bukan gambar.";

                    }

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        taskVisionImage =
                            event.target.result;


                        if (
                            taskVisionPreview
                        ) {

                            taskVisionPreview.src =
                                taskVisionImage;

                            taskVisionPreview.style.display =
                                "block";

                        }


                        if (
                            taskVisionResult
                        ) {

                            taskVisionResult.textContent =
                                "Foto tugas siap dianalisis.";

                        }

                    };


                reader.onerror =
                    function () {

                        if (
                            taskVisionResult
                        ) {

                            taskVisionResult.textContent =
                                "Gagal membaca foto tugas.";

                        }

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    /*
       Kirim foto ke Aldii
    */

    if (taskVisionAsk) {

        taskVisionAsk.addEventListener(
            "click",
            async function () {

                if (!taskVisionImage) {

                    if (
                        taskVisionResult
                    ) {

                        taskVisionResult.textContent =
                            "Pilih foto tugas terlebih dahulu.";

                    }

                    return;

                }


                const userPrompt =
                    taskVisionPrompt &&
                    taskVisionPrompt.value.trim()
                        ? taskVisionPrompt.value.trim()
                        : "Kerjakan soal pada foto ini. Bacalah semua soal dengan teliti. Berikan jawaban dan jelaskan langkah penyelesaiannya dengan bahasa Indonesia yang mudah dipahami.";


                taskVisionAsk.disabled =
                    true;


                taskVisionAsk.textContent =
                    "Sedang mengerjakan...";


                if (
                    taskVisionResult
                ) {

                    taskVisionResult.textContent =
                        "Aldii sedang membaca foto tugas...";

                }


                try {

                    const response =
                        await fetch(
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
                                            taskVisionImage,

                                        prompt:
                                            userPrompt

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Gagal mengerjakan foto tugas."
                        );

                    }


                    const answer =
                        data.response ||
                        data.answer ||
                        data.message ||
                        "Aldii tidak memberikan jawaban.";


                    if (
                        taskVisionResult
                    ) {

                        taskVisionResult.textContent =
                            answer;

                    }


                } catch (error) {

                    console.error(
                        "ALDII FOTO TUGAS ERROR:",
                        error
                    );


                    if (
                        taskVisionResult
                    ) {

                        taskVisionResult.textContent =
                            "Gagal mengerjakan tugas: " +
                            error.message;

                    }

                } finally {

                    taskVisionAsk.disabled =
                        false;

                    taskVisionAsk.textContent =
                        "Kerjakan Tugas";

                }

            }
        );

    }


    /* =====================================================
       UPLOAD FILE TUGAS
    ===================================================== */

    const taskFileInput =
        getElement("fileInput");

    const taskFileChoose =
        getElement("fileChoose");

    const taskFilePrompt =
        getElement("filePrompt");

    const taskFileAsk =
        getElement("fileAsk");

    const taskFileResult =
        getElement("fileResult");


    let taskFileText = "";

    let taskFileName = "";


    /*
       Tombol pilih file
    */

    if (
        taskFileChoose &&
        taskFileInput
    ) {

        taskFileChoose.addEventListener(
            "click",
            function () {

                taskFileInput.click();

            }
        );

    }


    /*
       File dipilih
    */

    if (taskFileInput) {

        taskFileInput.addEventListener(
            "change",
            async function () {

                const file =
                    taskFileInput.files &&
                    taskFileInput.files[0];


                if (!file) {

                    return;

                }


                const validExtension =
                    /\.(txt|md|csv)$/i.test(
                        file.name
                    );


                if (!validExtension) {

                    taskFileText =
                        "";

                    taskFileName =
                        "";


                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            "Untuk saat ini gunakan file TXT, MD, atau CSV.";

                    }

                    return;

                }


                try {

                    taskFileText =
                        await file.text();


                    taskFileName =
                        file.name;


                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            "File siap digunakan: " +
                            taskFileName +
                            "\n\nTekan Kerjakan File untuk meminta Aldii mengerjakannya.";

                    }

                } catch (error) {

                    console.error(
                        "ALDII FILE READ ERROR:",
                        error
                    );


                    taskFileText =
                        "";

                    taskFileName =
                        "";


                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            "Gagal membaca file tugas.";

                    }

                }

            }
        );

    }


    /*
       Kirim file ke Aldii
    */

    if (taskFileAsk) {

        taskFileAsk.addEventListener(
            "click",
            async function () {

                if (!taskFileText) {

                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            "Pilih file tugas terlebih dahulu.";

                    }

                    return;

                }


                const instruction =
                    taskFilePrompt &&
                    taskFilePrompt.value.trim()
                        ? taskFilePrompt.value.trim()
                        : "Kerjakan tugas berikut. Berikan jawaban yang benar dan jelaskan langkah-langkah penyelesaiannya dengan bahasa Indonesia yang mudah dipahami.";


                /*
                   Batasi ukuran agar request
                   tidak terlalu besar.
                */

                const maximumLength =
                    30000;


                const content =
                    taskFileText.length >
                    maximumLength
                        ? taskFileText.substring(
                            0,
                            maximumLength
                        )
                        : taskFileText;


                const message =
                    instruction +
                    "\n\n" +
                    "Nama file: " +
                    taskFileName +
                    "\n\n" +
                    "Isi tugas:\n" +
                    content;


                taskFileAsk.disabled =
                    true;


                taskFileAsk.textContent =
                    "Sedang mengerjakan...";


                if (
                    taskFileResult
                ) {

                    taskFileResult.textContent =
                        "Aldii sedang membaca dan mengerjakan file...";

                }


                try {

                    const response =
                        await fetch(
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
                                            message

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Gagal mengerjakan file tugas."
                        );

                    }


                    const answer =
                        data.response ||
                        data.answer ||
                        data.message ||
                        "Aldii tidak memberikan jawaban.";


                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            answer;

                    }

                } catch (error) {

                    console.error(
                        "ALDII FILE TASK ERROR:",
                        error
                    );


                    if (
                        taskFileResult
                    ) {

                        taskFileResult.textContent =
                            "Gagal mengerjakan file: " +
                            error.message;

                    }

                } finally {

                    taskFileAsk.disabled =
                        false;

                    taskFileAsk.textContent =
                        "Kerjakan File";

                }

            }
        );

    }


    console.log(
        "Aldii Task System loaded."
    );

})();