/* ==========================================
   LOGIN PAGE LOGIC
   ========================================== */

// 1. Theme Logic (Dark/Light Mode)
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

if(themeToggle){
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
}

// 2. Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codeInput = document.getElementById('studentCode');
    const code = codeInput.value.trim();

    // لو الحقل فاضي
    if (!code) {
        Swal.fire({
            icon: 'warning',
            title: 'تنبيه',
            text: 'يرجى إدخال كود الطالب أولاً',
            confirmButtonColor: '#1976d2'
        });
        return;
    }

    try {
        /* ----------------------------------------------------------------
           API INTEGRATION (Login)
           ----------------------------------------------------------------
  
           const response = await fetch('YOUR_API_ENDPOINT/login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ code: code })
           });
           
           const data = await response.json();
           
           if (!response.ok) {
               
               throw new Error(data.message || 'كود الطالب غير صحيح');
           }
        ---------------------------------------------------------------- */

        // --- (محاكاة للتحقق من الكود)🥸🥸🥸 ---
   
        
        let mockData;

        if (code === "12345") {
            // حالة النجاح
            mockData = {
                valid: true,
                token: "xyz_token_123_secure",
                student: { 
                    name: "أحمد محمد علي", 
                    code: code 
                }
            };
        } else {
           
            mockData = {
                valid: false,
                message: "كود الطالب غير صحيح، يرجى التأكد والمحاولة مرة أخرى"
            };
        }
        // -------------------------------------------------------

        if (mockData.valid) {
            
            sessionStorage.setItem('authToken', mockData.token);
            sessionStorage.setItem('studentInfo', JSON.stringify(mockData.student));
            
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
              
            await Toast.fire({
                icon: 'success',
                title: 'تم تسجيل الدخول بنجاح'
            });

            
            window.location.href = 'exam.html';

        } else {
            
            Swal.fire({
                icon: 'error',
                title: 'خطأ في الدخول',
                text: mockData.message, 
                confirmButtonText: 'حاول مرة أخرى',
                confirmButtonColor: '#d33'
            });
            
         
            codeInput.value = '';
            codeInput.focus();
        }

    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: error.message || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً',
            confirmButtonColor: '#d33'
        });
    }
});