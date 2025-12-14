/* ==========================================
   THEME LOGIC (DARK MODE FIX)
   ========================================== */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('i');


function updateIcon() {
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun'); 
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon'); 
    }
}


const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode'); 
}
updateIcon(); 


themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode'); 
    
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
    
    updateIcon();
});

/* ==========================================
   LOGIN FORM LOGIC
   ========================================== */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codeInput = document.getElementById('studentCode');
    const code = codeInput.value.trim();

    if (!code) {
        Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'يرجى إدخال كود الطالب' });
        return;
    }

    // --- MOCK LOGIC (تجربة) ---
    if (code === "12345") {
        sessionStorage.setItem('authToken', "token_123");
        sessionStorage.setItem('studentInfo', JSON.stringify({ name: "أحمد محمد", code: code }));
        
        const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
        });
        await Toast.fire({ icon: 'success', title: 'تم تسجيل الدخول' });
        
        window.location.href = 'exam.html';
    } else {
        Swal.fire({ icon: 'error', title: 'خطأ', text: 'الكود غير صحيح' });
    }
});