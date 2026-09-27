var messageInput = document.getElementById("messageInput");
var sendButton = document.getElementById("sendButton");
var chatMessages = document.getElementById("chatMessages");

var sending = false;
var currentChat = [];
var historyKey = "aldii_v5_history";

var pageTitles = {
    chat: "Chat AI",
    cpp: "C++ Assistant",
    image: "AI Image",
    history: "Riwayat",
    settings: "Pengaturan"
};


/* ================================
   BASIC HELPERS
================================ */

function getElement(id) {
    return document.getElementById(id);
}

function scrollChat() {

    if (!chatMessages) {
        return;
    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* ================================
   CHAT
================================ */

function addMessage(text, type) {

    if (!chatMessages) {
        return null;
    }

    var message =
        document.createElement("div");

    message.className =
        "message " + type;

    var bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    bubble.textContent =
        String(text);

    message.appendChild(bubble);

    chatMessages.appendChild(message);

    scrollChat();

    return message;
}


function updateSendButton() {

    if (!messageInput || !sendButton) {
        return;
    }

    if (sending) {

        sendButton.disabled = true;

        return;
    }

    var text =
        String(messageInput.value || "").trim();

    sendButton.disabled =
        text.length === 0;
}


function saveHistory() {

    try {

        var oldHistory =
            JSON.parse(
                localStorage.getItem(historyKey) || "[]"
            );

        oldHistory.unshift({
            id: Date.now(),
            messages: currentChat,
            title:
                currentChat.length > 0
                    ? currentChat[0].text.substring(0, 60)
                    : "Chat Aldii",
            date:
                new Date().toLocaleString("id-ID")
        });

        if (oldHistory.length > 30) {
            oldHistory =
                oldHistory.slice(0, 30);
        }

        localStorage.setItem(
            historyKey,
            JSON.stringify(oldHistory)
        );

    } catch (error) {

        console.error(
            "Gagal menyimpan riwayat:",
            error
        );
    }
}


function sendMessage() {

    if (sending) {
        return;
    }

    if (!messageInput) {
        return;
    }

    var text =
        String(messageInput.value || "").trim();

    if (text.length === 0) {
        return;
    }

    sending = true;

    updateSendButton();

    addMessage(
        text,
        "user"
    );

    currentChat.push({
        role: "user",
        text: text
    });

    messageInput.value = "";

    var loading =
        addMessage(
            "Aldii sedang berpikir...",
            "ai"
        );

    fetch(
        "/api/chat",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                message: text
            })
        }
    )
    .then(
        function(response) {

            if (!response.ok) {

                throw new Error(
                    "Server error " +
                    response.status
                );
            }

            return response.json();
        }
    )
    .then(
        function(data) {

            if (loading) {
                loading.remove();
            }

            var answer =
                data.response;

            if (!answer) {
                answer =
                    data.message;
            }

            if (!answer) {
                answer =
                    data.answer;
            }

            if (!answer) {
                answer =
                    "Aldii tidak memberikan jawaban.";
            }

            answer =
                String(answer);

            addMessage(
                answer,
                "ai"
            );

            currentChat.push({
                role: "assistant",
                text: answer
            });

            saveHistory();
        }
    )
    .catch(
        function(error) {

            if (loading) {
                loading.remove();
            }

            addMessage(
                "Gagal menghubungkan ke Aldii: " +
                error.message,
                "ai"
            );

            console.error(
                "ALDII ERROR:",
                error
            );
        }
    )
    .finally(
        function() {

            sending = false;

            updateSendButton();
        }
    );
}


/* ================================
   NEW CHAT
================================ */

function newChat() {

    if (chatMessages) {
        chatMessages.innerHTML = "";
    }

    currentChat = [];

    showPage("chat");
}


/* ================================
   PAGE NAVIGATION
================================ */

function showPage(pageName) {

    var pages =
        document.querySelectorAll(".page");

    pages.forEach(
        function(page) {

            page.classList.remove(
                "active"
            );
        }
    );

    var target =
        getElement(
            "page-" + pageName
        );

    if (target) {

        target.classList.add(
            "active"
        );
    }

    var menuItems =
        document.querySelectorAll(
            ".menu-item"
        );

    menuItems.forEach(
        function(item) {

            if (
                item.getAttribute(
                    "data-page"
                ) === pageName
            ) {

                item.classList.add(
                    "active"
                );

            } else {

                item.classList.remove(
                    "active"
                );
            }
        }
    );

    var pageTitle =
        getElement("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            pageTitles[pageName] ||
            "Aldii";
    }

    if (pageName === "history") {
        renderHistory();
    }

    var sidebar =
        getElement("sidebar");

    if (sidebar) {
        sidebar.classList.remove(
            "open"
        );
    }
}


/* ================================
   SIDEBAR
================================ */

var menuItems =
    document.querySelectorAll(
        ".menu-item"
    );

menuItems.forEach(
    function(item) {

        item.onclick =
            function() {

                var page =
                    item.getAttribute(
                        "data-page"
                    );

                if (page) {
                    showPage(page);
                }
            };
    }
);


var newChatButton =
    getElement("newChat");

if (newChatButton) {

    newChatButton.onclick =
        function() {

            newChat();
        };
}


/* ================================
   MOBILE MENU
================================ */

var mobileMenu =
    getElement("mobileMenu");

if (mobileMenu) {

    mobileMenu.onclick =
        function() {

            var sidebar =
                getElement("sidebar");

            if (!sidebar) {
                return;
            }

            sidebar.classList.toggle(
                "open"
            );
        };
}


/* ================================
   THEME
================================ */

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    } else {

        document.body.classList.remove(
            "dark"
        );
    }

    try {

        localStorage.setItem(
            "aldii_theme",
            theme
        );

    } catch (error) {

        console.error(
            "Theme error:",
            error
        );
    }
}


function toggleTheme() {

    var isDark =
        document.body.classList.contains(
            "dark"
        );

    applyTheme(
        isDark
            ? "light"
            : "dark"
    );
}


function loadTheme() {

    var theme = "light";

    try {

        theme =
            localStorage.getItem(
                "aldii_theme"
            ) || "light";

    } catch (error) {

        theme = "light";
    }

    applyTheme(theme);
}


var themeButton =
    getElement("themeButton");

if (themeButton) {

    themeButton.onclick =
        function() {

            toggleTheme();
        };
}


var settingsTheme =
    getElement("settingsTheme");

if (settingsTheme) {

    settingsTheme.onclick =
        function() {

            toggleTheme();
        };
}


/* ================================
   C++ ASSISTANT
================================ */

function cppAsk(instruction) {

    var cppInput =
        getElement("cppInput");

    var cppResult =
        getElement("cppResultText");

    if (!cppInput || !cppResult) {
        return;
    }

    var code =
        String(cppInput.value || "").trim();

    if (code.length === 0) {

        cppResult.textContent =
            "Masukkan kode C++ terlebih dahulu.";

        return;
    }

    cppResult.textContent =
        "Aldii sedang menganalisis kode C++...";

    var prompt =
        instruction +
        "\n\nKode C++:\n\n" +
        code;

    fetch(
        "/api/chat",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                message: prompt
            })
        }
    )
    .then(
        function(response) {

            if (!response.ok) {

                throw new Error(
                    "Server error " +
                    response.status
                );
            }

            return response.json();
        }
    )
    .then(
        function(data) {

            var answer =
                data.response;

            if (!answer) {
                answer =
                    data.message;
            }

            if (!answer) {
                answer =
                    data.answer;
            }

            if (!answer) {
                answer =
                    "Aldii tidak memberikan hasil.";
            }

            cppResult.textContent =
                String(answer);
        }
    )
    .catch(
        function(error) {

            cppResult.textContent =
                "Gagal memproses C++: " +
                error.message;

            console.error(
                "CPP ERROR:",
                error
            );
        }
    );
}


var cppExplain =
    getElement("cppExplain");

if (cppExplain) {

    cppExplain.onclick =
        function() {

            cppAsk(
                "Jelaskan kode C++ berikut dengan bahasa Indonesia yang mudah dipahami. Jelaskan fungsi bagian penting dan tunjukkan jika ada kesalahan."
            );
        };
}


var cppFix =
    getElement("cppFix");

if (cppFix) {

    cppFix.onclick =
        function() {

            cppAsk(
                "Periksa kode C++ berikut. Cari semua kesalahan yang terlihat, lalu berikan versi kode C++ yang sudah diperbaiki. Jelaskan perubahan penting."
            );
        };
}


/* ================================
   CPP COPY
================================ */

var cppCopy =
    getElement("cppCopy");

if (cppCopy) {

    cppCopy.onclick =
        function() {

            var cppInput =
                getElement("cppInput");

            if (!cppInput) {
                return;
            }

            var code =
                cppInput.value;

            if (!code.trim()) {
                return;
            }

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                navigator.clipboard.writeText(
                    code
                )
                .then(
                    function() {

                        cppCopy.textContent =
                            "Copied";

                        setTimeout(
                            function() {

                                cppCopy.textContent =
                                    "Copy";

                            },
                            1200
                        );
                    }
                )
                .catch(
                    function() {

                        alert(
                            "Tidak bisa menyalin kode."
                        );
                    }
                );

            } else {

                cppInput.select();

                document.execCommand(
                    "copy"
                );
            }
        };
}


/* ================================
   CPP CLEAR
================================ */

var cppClear =
    getElement("cppClear");

if (cppClear) {

    cppClear.onclick =
        function() {

            var cppInput =
                getElement("cppInput");

            var cppResult =
                getElement("cppResultText");

            if (cppInput) {
                cppInput.value = "";
            }

            if (cppResult) {

                cppResult.textContent =
                    "Hasil analisis akan muncul di sini.";
            }
        };
}


/* ================================
   AI IMAGE
================================ */

var generateImage =
    getElement("generateImage");

if (generateImage) {

    generateImage.onclick =
        function() {

            var imagePrompt =
                getElement("imagePrompt");

            var imageResult =
                getElement("imageResult");

            if (!imagePrompt || !imageResult) {
                return;
            }

            var prompt =
                String(
                    imagePrompt.value || ""
                ).trim();

            if (prompt.length === 0) {

                imageResult.innerHTML =
                    "<div><strong>Prompt kosong</strong><p>Masukkan deskripsi gambar terlebih dahulu.</p></div>";

                return;
            }

            imageResult.innerHTML =
                "<div><strong>AI Image</strong><p>Fitur gambar belum terhubung ke provider image API.</p><p>Prompt kamu sudah diterima: " +
                escapeHtml(prompt) +
                "</p></div>";
        };
}


/* ================================
   HISTORY
================================ */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                historyKey
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "History error:",
            error
        );

        return [];
    }
}


function renderHistory() {

    var historyList =
        getElement("historyList");

    if (!historyList) {
        return;
    }

    historyList.innerHTML = "";

    var history =
        getHistory();

    if (history.length === 0) {

        historyList.innerHTML =
            "<div class=\"history-item\"><strong>Belum ada riwayat</strong><small>Percakapan kamu akan muncul di sini.</small></div>";

        return;
    }

    history.forEach(
        function(item, index) {

            var element =
                document.createElement("div");

            element.className =
                "history-item";

            var title =
                document.createElement("strong");

            title.textContent =
                item.title ||
                "Chat Aldii";

            var date =
                document.createElement("small");

            date.textContent =
                item.date ||
                "";

            element.appendChild(title);
            element.appendChild(date);

            element.onclick =
                function() {

                    loadHistory(index);
                };

            historyList.appendChild(
                element
            );
        }
    );
}


function loadHistory(index) {

    var history =
        getHistory();

    var item =
        history[index];

    if (!item) {
        return;
    }

    currentChat =
        Array.isArray(item.messages)
            ? item.messages.slice()
            : [];

    var chat =
        getElement("chatMessages");

    if (chat) {

        chat.innerHTML = "";

        currentChat.forEach(
            function(message) {

                addMessage(
                    message.text,
                    message.role === "user"
                        ? "user"
                        : "ai"
                );
            }
        );
    }

    showPage("chat");
}


var clearHistory =
    getElement("clearHistory");

if (clearHistory) {

    clearHistory.onclick =
        function() {

            var confirmed =
                window.confirm(
                    "Hapus semua riwayat chat?"
                );

            if (!confirmed) {
                return;
            }

            try {

                localStorage.removeItem(
                    historyKey
                );

            } catch (error) {

                console.error(
                    "Clear history error:",
                    error
                );
            }

            currentChat = [];

            renderHistory();
        };
}


/* ================================
   SUGGESTIONS
================================ */

var suggestions =
    document.querySelectorAll(
        ".suggestions button"
    );

suggestions.forEach(
    function(button) {

        button.onclick =
            function() {

                if (!messageInput) {
                    return;
                }

                var prompt =
                    button.getAttribute(
                        "data-prompt"
                    );

                if (!prompt) {
                    return;
                }

                messageInput.value =
                    prompt;

                updateSendButton();

                messageInput.focus();
            };
    }
);


/* ================================
   CHAT INPUT
================================ */

if (sendButton) {

    sendButton.onclick =
        sendMessage;
}


if (messageInput) {

    messageInput.oninput =
        updateSendButton;

    messageInput.onkeydown =
        function(event) {

            if (!event) {
                return;
            }

            if (
                event.key === "Enter" &&
                event.shiftKey !== true
            ) {

                event.preventDefault();

                sendMessage();
            }
        };
}


/* ================================
   HTML ESCAPE
================================ */

function escapeHtml(text) {

    var div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


/* ================================
   START
================================ */

loadTheme();

updateSendButton();

showPage("chat");

var imageInput =
    document.getElementById("imageInput");

var imageButton =
    document.getElementById("imageButton");

var selectedImage = null;


if (imageButton) {

    imageButton.onclick =
        function () {

            if (imageInput) {

                imageInput.click();
            }
        };
}


if (imageInput) {

    imageInput.onchange =
        function () {

            var file =
                imageInput.files[0];

            if (!file) {
                return;
            }


            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/webp"
            ) {

                alert(
                    "Format foto harus JPG, PNG, atau WEBP."
                );

                imageInput.value = "";

                return;
            }


            if (
                file.size >
                20 * 1024 * 1024
            ) {

                alert(
                    "Ukuran foto maksimal 20 MB."
                );

                imageInput.value = "";

                return;
            }


            var reader =
                new FileReader();


            reader.onload =
                function (event) {

                    selectedImage =
                        event.target.result;

                    imageButton.textContent =
                        "Foto dipilih";

                    console.log(
                        "Foto siap dikirim."
                    );
                };


            reader.onerror =
                function () {

                    selectedImage = null;

                    alert(
                        "Foto gagal dibaca."
                    );
                };


            reader.readAsDataURL(
                file
            );
        };
}