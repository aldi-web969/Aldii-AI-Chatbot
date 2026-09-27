var messageInput = document.getElementById("messageInput");
var sendButton = document.getElementById("sendButton");
var chatMessages = document.getElementById("chatMessages");
var sending = false;

function byId(id){return document.getElementById(id);}
function addMessage(text,type){
    var box=document.createElement("div");
    box.className="message "+type;
    var bubble=document.createElement("div");
    bubble.className="message-bubble";
    bubble.textContent=String(text);
    box.appendChild(bubble);
    chatMessages.appendChild(box);
    chatMessages.scrollTop=chatMessages.scrollHeight;
    return box;
}
function updateButton(){
    if(!messageInput||!sendButton)return;
    sendButton.disabled=sending||messageInput.value.trim().length===0;
}
function sendMessage(){
    if(sending)return;
    var text=messageInput.value.trim();
    if(!text)return;
    sending=true;updateButton();addMessage(text,"user");messageInput.value="";
    var loading=addMessage("Aldii sedang berpikir...","ai");
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})})
    .then(function(r){if(!r.ok)throw new Error("Server error "+r.status);return r.json();})
    .then(function(data){loading.remove();addMessage(data.response||data.message||data.answer||"Aldii tidak memberikan jawaban.","ai");saveHistory(text,data.response||"");})
    .catch(function(e){loading.remove();addMessage("Gagal menghubungkan ke Aldii: "+e.message,"ai");})
    .finally(function(){sending=false;updateButton();});
}
if(sendButton)sendButton.onclick=sendMessage;
if(messageInput){
    messageInput.oninput=updateButton;
    messageInput.onkeydown=function(e){if(e&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}};
}

var pageTitles={chat:"Chat AI",vision:"Foto & Vision",files:"File Assistant",search:"Web Search",coding:"Coding Workspace",cpp:"C++ Assistant",image:"AI Image",study:"Study Mode",writing:"Writing Assistant",translator:"Translator",quiz:"Quiz Generator",voice:"Voice Chat",history:"Riwayat",favorites:"Favorit",settings:"Pengaturan"};
function showPage(name){
    document.querySelectorAll(".page").forEach(function(p){p.classList.remove("active");});
    var page=byId("page-"+name);
    if(page)page.classList.add("active");
    document.querySelectorAll(".menu-item").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-page")===name);});
    var title=byId("pageTitle");if(title)title.textContent=pageTitles[name]||"Aldii";
    var side=byId("sidebar");if(side)side.classList.remove("open");
}
document.querySelectorAll(".menu-item").forEach(function(b){b.onclick=function(){showPage(b.getAttribute("data-page"));};});
document.querySelectorAll("[data-prompt]").forEach(function(b){b.onclick=function(){showPage("chat");messageInput.value=b.getAttribute("data-prompt");updateButton();messageInput.focus();};});
if(byId("mobileMenu"))byId("mobileMenu").onclick=function(){byId("sidebar").classList.toggle("open");};
function toggleTheme(){document.body.classList.toggle("dark");localStorage.setItem("aldii-theme",document.body.classList.contains("dark")?"dark":"light");}
if(localStorage.getItem("aldii-theme")==="dark")document.body.classList.add("dark");
if(byId("themeButton"))byId("themeButton").onclick=toggleTheme;
if(byId("settingsTheme"))byId("settingsTheme").onclick=toggleTheme;
if(byId("newChat"))byId("newChat").onclick=function(){chatMessages.innerHTML='<div class="welcome" id="welcome"><div class="welcome-logo">A</div><h1>Bagaimana saya bisa membantu?</h1><p>Tanya, kirim foto, atau gunakan salah satu tools Aldii.</p></div>';showPage("chat");};

function saveHistory(question,answer){
    var h=JSON.parse(localStorage.getItem("aldii-history")||"[]");
    h.unshift({question:question,answer:answer,date:new Date().toLocaleString("id-ID")});
    localStorage.setItem("aldii-history",JSON.stringify(h.slice(0,50)));
}
function renderHistory(){
    var list=byId("historyList");if(!list)return;list.innerHTML="";
    var h=JSON.parse(localStorage.getItem("aldii-history")||"[]");
    if(!h.length){list.textContent="Belum ada riwayat.";return;}
    h.forEach(function(item){var d=document.createElement("div");d.className="history-item";d.innerHTML="<strong>"+escapeHtml(item.question)+"</strong><small>"+escapeHtml(item.date)+"</small>";list.appendChild(d);});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
if(byId("clearHistory"))byId("clearHistory").onclick=function(){localStorage.removeItem("aldii-history");renderHistory();};
renderHistory();

var visionFile=byId("visionFile"),visionPreview=byId("visionPreview"),visionData="";
if(byId("visionChoose"))byId("visionChoose").onclick=function(){visionFile.click();};
if(visionFile)visionFile.onchange=function(){readVisionFile(visionFile.files[0]);};
function readVisionFile(file){
    if(!file)return;
    if(!file.type.startsWith("image/")){byId("visionResult").textContent="File harus berupa gambar.";return;}
    var reader=new FileReader();
    reader.onload=function(){visionData=reader.result;visionPreview.src=visionData;visionPreview.style.display="block";};
    reader.readAsDataURL(file);
}
if(byId("visionAsk"))byId("visionAsk").onclick=function(){
    if(!visionData){byId("visionResult").textContent="Pilih foto terlebih dahulu.";return;}
    var prompt=byId("visionPrompt").value.trim()||"Analisis foto ini dan jelaskan apa yang terlihat dengan bahasa Indonesia yang mudah dipahami.";
    var result=byId("visionResult");result.textContent="Aldii sedang menganalisis foto...";
    fetch("/api/vision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:visionData,prompt:prompt})})
    .then(function(r){return r.json();})
    .then(function(data){result.textContent=data.response||data.error||"Tidak ada jawaban.";})
    .catch(function(e){result.textContent="Gagal: "+e.message;});
};

var fileInput=byId("fileInput");
if(byId("fileChoose"))byId("fileChoose").onclick=function(){fileInput.click();};
if(fileInput)fileInput.onchange=function(){var f=fileInput.files[0];byId("fileResult").textContent=f?"File dipilih: "+f.name:"Belum ada file yang dipilih.";};

function askChat(prompt,resultId){
    var result=byId(resultId);if(!result)return;
    if(!prompt.trim()){result.textContent="Masukkan permintaan terlebih dahulu.";return;}
    result.textContent="Aldii sedang memproses...";
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:prompt})})
    .then(function(r){return r.json();})
    .then(function(d){result.textContent=d.response||d.error||"Tidak ada jawaban.";})
    .catch(function(e){result.textContent="Gagal: "+e.message;});
}
if(byId("searchAsk"))byId("searchAsk").onclick=function(){askChat("Cari dan jelaskan informasi tentang: "+byId("searchInput").value,"searchResult");};
if(byId("writingAsk"))byId("writingAsk").onclick=function(){askChat("Bantu saya membuat atau memperbaiki tulisan berikut:\n"+byId("writingInput").value,"writingResult");};
if(byId("studyExplain"))byId("studyExplain").onclick=function(){askChat("Ajarkan topik berikut secara bertahap, sederhana, dengan contoh:\n"+byId("studyInput").value,"studyResult");};
if(byId("studyQuiz"))byId("studyQuiz").onclick=function(){askChat("Buat 5 soal latihan beserta jawaban tentang:\n"+byId("studyInput").value,"studyResult");};
if(byId("translateAsk"))byId("translateAsk").onclick=function(){askChat("Terjemahkan teks berikut ke "+byId("translateTarget").value+". Hanya berikan hasil terjemahannya:\n"+byId("translateInput").value,"translateResult");};
if(byId("quizAsk"))byId("quizAsk").onclick=function(){askChat("Buat 5 soal pilihan ganda tentang:\n"+byId("quizInput").value,"quizResult");};

function copyText(value){navigator.clipboard.writeText(value||"");}
if(byId("codingRun"))byId("codingRun").onclick=function(){
    var html=byId("codingHtml").value,css=byId("codingCss").value,js=byId("codingJs").value;
    byId("codingPreview").srcdoc="<!doctype html><html><head><style>"+css+"</style></head><body>"+html+"<script>"+js.replace(/<\/script>/gi,"<\\/script>")+"<\/script></body></html>";
};
if(byId("codingClear"))byId("codingClear").onclick=function(){byId("codingHtml").value="";byId("codingCss").value="";byId("codingJs").value="";byId("codingPreview").srcdoc="";};
if(byId("codingCopyHtml"))byId("codingCopyHtml").onclick=function(){copyText(byId("codingHtml").value);};
if(byId("codingCopyCss"))byId("codingCopyCss").onclick=function(){copyText(byId("codingCss").value);};
if(byId("codingCopyJs"))byId("codingCopyJs").onclick=function(){copyText(byId("codingJs").value);};

function cppAsk(mode){
    var code=byId("cppInput").value;
    askChat((mode==="fix"?"Perbaiki kode C++ berikut dan berikan kode yang sudah benar:\n":"Jelaskan kode C++ berikut dengan bahasa sederhana:\n")+code,"cppResult");
}
if(byId("cppExplain"))byId("cppExplain").onclick=function(){cppAsk("explain");};
if(byId("cppFix"))byId("cppFix").onclick=function(){cppAsk("fix");};
if(byId("cppCopy"))byId("cppCopy").onclick=function(){copyText(byId("cppInput").value);};

if(byId("voiceStart"))byId("voiceStart").onclick=function(){
    var out=byId("voiceResult");
    var Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Speech){out.textContent="Browser ini tidak mendukung voice input.";return;}
    var rec=new Speech();rec.lang="id-ID";rec.interimResults=false;rec.onstart=function(){out.textContent="Mendengarkan...";};rec.onresult=function(e){messageInput.value=e.results[0][0].transcript;updateButton();showPage("chat");};rec.onerror=function(e){out.textContent="Voice error: "+e.error;};rec.start();
};

if(byId("generateImage"))byId("generateImage").onclick=function(){alert("AI Image membutuhkan provider image API.");};
