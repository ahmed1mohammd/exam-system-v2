/* ==========================================
   1. SETUP & CONFIGURATION
   ========================================== */
const authToken = sessionStorage.getItem('authToken');
if (!authToken) window.location.href = 'index.html';

let examData = null;
let currentQIndex = 0;
let userAnswers = {};
let timerInterval = null;

const ui = {
    navbarTitle: document.getElementById('examTitle'),
    timer: document.getElementById('timerDisplay'),
    sections: {
        waiting: document.getElementById('waitingSection'),
        exam: document.getElementById('examSection'),
        result: document.getElementById('resultSection')
    },
    waitingInfo: document.getElementById('studentInfoWaiting'),
    resultInfo: document.getElementById('studentInfoResult'),
    countdownStart: document.getElementById('countdownStart'),
    questionContainer: document.getElementById('questionContainer'),
    btns: {
        next: document.getElementById('nextBtn'),
        prev: document.getElementById('prevBtn'),
        finish: document.getElementById('finishBtn')
    },
    stats: {
        total: document.getElementById('statTotal'),
        solved: document.getElementById('statSolved'),
        unsolved: document.getElementById('statUnsolved'),
        current: document.getElementById('statCurrent')
    }
};

/* ==========================================
   2. INITIALIZATION & API
   ========================================== */
async function init() {
    setupTheme();
    try {
        await fetchExamData(); 
        
        if (examData) {
            ui.navbarTitle.textContent = examData.meta.title;
            renderStudentInfo();
            startTimerLogic();
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل تحميل الامتحان' });
        console.error(error);
    }
}

async function fetchExamData() {
    // --- MOCK DATA (5 أسئلة للتجربة) ---
    const now = new Date();
    
    const mockStartTime = new Date(now.getTime()+ 10 * 1000).toISOString(); 

    examData = {
        meta: {
            title: "اختبار تجريبي شامل ",
            startTime: mockStartTime,
            durationMinutes: 60,
            student: {
                ...JSON.parse(sessionStorage.getItem('studentInfo') || '{}'),
                class: "الصف الثالث الثانوي", group: "مجموعة A", teacher: "أ. محمد عبد السلام", subject: "فيزياء"
            }
        },
        questions: [
            { 
                id: 1, type: "mcq", 
                text: "ما هي وحدة قياس القوة في النظام الدولي؟", 
                options: ["نيوتن", "جول", "واط", "فولت"], 
                correct: "نيوتن" 
            },
            { 
                id: 2, type: "tf", 
                text: "سرعة الضوء في الفراغ هي أكبر سرعة في الكون.", 
                options: ["صح", "خطأ"], 
                correct: "صح" 
            },
            { 
                id: 3, type: "mcq", 
                text: "أي مما يلي يعتبر من الكميات المتجهة؟", 
                options: ["الكتلة", "الزمن", "الإزاحة", "درجة الحرارة"], 
                correct: "الإزاحة" 
            },
            { 
                id: 4, type: "mcq", 
                text: "ناتج قسمة 50 على 2 يساوي:", 
                options: ["20", "25", "30", "100"], 
                correct: "25" 
            },
            { 
                id: 5, type: "mcq", 
                text: "عاصمة جمهورية مصر العربية هي:", 
                options: ["الإسكندرية", "أسوان", "القاهرة", "الجيزة"], 
                correct: "القاهرة" 
            }
        ]
    };
}

/* ==========================================
   3. LOGIC & STATUS CHECK
   ========================================== */
function startTimerLogic() {
    checkExamStatus();
    timerInterval = setInterval(checkExamStatus, 1000);
}

function checkExamStatus() {
    const nowTime = new Date().getTime();
    const startTime = new Date(examData.meta.startTime).getTime();
    const endTime = startTime + (examData.meta.durationMinutes * 60 * 1000);

    if (nowTime < startTime) {
        showSection('waiting');
        ui.countdownStart.textContent = formatTime((startTime - nowTime) / 1000);
        ui.timer.textContent = "--:--";
    } else if (nowTime > endTime) {
        if (ui.sections.result.classList.contains('hidden')) finishExam(true);
    } else {
        if (!ui.sections.waiting.classList.contains('hidden') || 
            (ui.sections.exam.classList.contains('hidden') && ui.sections.result.classList.contains('hidden'))) {
            startExamUI();
        }
        const remaining = endTime - nowTime;
        ui.timer.textContent = formatTime(remaining / 1000);
        
        if (remaining < 60000) ui.timer.style.color = "#ef4444";
        else ui.timer.style.color = "";
    }
}

/* ==========================================
   4. EXAM UI
   ========================================== */
function startExamUI() {
    showSection('exam');
    if(ui.questionContainer.innerHTML.trim() === "") renderQuestion(0);
    updateStatsUI();
}

function renderQuestion(index) {
    
    if (index < 0 || index >= examData.questions.length) return;

    const q = examData.questions[index];
    currentQIndex = index;

    let html = `
        <div class="question-animated">
            <div class="q-text">${q.text}</div>
            ${q.image ? `<img src="${q.image}" class="q-img" alt="img">` : ''}
            <div class="options-list">
    `;

    q.options.forEach(opt => {
        const isSelected = userAnswers[q.id] === opt;
        html += `
            <label class="option-item ${isSelected ? 'selected' : ''}" onclick="selectOption(this, ${q.id}, '${opt}')">
                <span>${opt}</span>
                <input type="radio" name="q_${q.id}" value="${opt}" ${isSelected ? 'checked' : ''}> 
            </label>
        `;
    });

    html += `</div></div>`;
    ui.questionContainer.innerHTML = html;
    
    
    updateNavButtons(index);
    updateStatsUI();
}

window.selectOption = (element, qId, val) => {
    element.parentElement.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    userAnswers[qId] = val;
    updateStatsUI();
};

function updateStatsUI() {
    if(!ui.stats.total) return;
    const total = examData.questions.length;
    const solved = Object.keys(userAnswers).length;
    
    ui.stats.total.textContent = total;
    ui.stats.solved.textContent = solved;
    ui.stats.unsolved.textContent = total - solved;
    ui.stats.current.textContent = currentQIndex + 1;
}

/* ==========================================
   5. NAVIGATION & FINISH
   ========================================== */
function updateNavButtons(index) {
    
    ui.btns.prev.style.display = index === 0 ? 'none' : 'flex';
    
   
    if (index === examData.questions.length - 1) {
    
        ui.btns.next.style.display = 'none';
        ui.btns.finish.classList.remove('hidden'); 
        ui.btns.finish.style.display = 'flex';     
    } else {
       
        ui.btns.next.style.display = 'flex';
        ui.btns.finish.classList.add('hidden');
        ui.btns.finish.style.display = 'none';
    }
}

ui.btns.next.onclick = () => renderQuestion(currentQIndex + 1);
ui.btns.prev.onclick = () => renderQuestion(currentQIndex - 1);

ui.btns.finish.onclick = () => {
    Swal.fire({
        title: 'تأكيد الإنهاء',
        text: "هل أنت متأكد من تسليم الإجابات؟",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، تسليم',
        cancelButtonText: 'تراجع'
    }).then((res) => { if (res.isConfirmed) finishExam(false); });
};

async function finishExam(isForced) {
    if (isForced && !ui.sections.result.classList.contains('hidden')) return;
    
    clearInterval(timerInterval);

    if (isForced) {
        await Swal.fire({ title: 'انتهى الوقت', text: 'تم تسليم الامتحان تلقائياً', icon: 'info' });
    }

    let score = 0;
    examData.questions.forEach(q => {
        if (userAnswers[q.id] === q.correct) score++;
    });

    document.getElementById('finalScore').textContent = `${score} / ${examData.questions.length}`;
    showSection('result');
    ui.timer.textContent = "00:00";
}

/* ==========================================
   6. UTILITIES
   ========================================== */
function setupTheme() {
    if(localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
    const btn = document.getElementById('themeToggle');
    if(btn) btn.onclick = () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    };
}

function showSection(name) {
    Object.values(ui.sections).forEach(el => {
        if(el) el.classList.add('hidden');
    });
    if(ui.sections[name]) ui.sections[name].classList.remove('hidden');
}

function renderStudentInfo() {
    const s = examData.meta.student;
    if (!s) return;
    const html = `
        <div class="info-item"><span class="info-label">الطالب</span><span class="info-val">${s.name}</span></div>
        <div class="info-item"><span class="info-label">الصف</span><span class="info-val">${s.class}</span></div>
        <div class="info-item"><span class="info-label">المجموعة</span><span class="info-val">${s.group}</span></div>
        <div class="info-item"><span class="info-label">المدرس</span><span class="info-val">${s.teacher}</span></div>
    `;
    if(ui.waitingInfo) ui.waitingInfo.innerHTML = html;
    if(ui.resultInfo) ui.resultInfo.innerHTML = html;
}

function formatTime(s) {
    if (s < 0) return "00:00";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    const timeStr = `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return h > 0 ? `${h}:${timeStr}` : timeStr;
}


init();