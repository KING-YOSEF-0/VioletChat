// ============================================
//  VIOLETCHAT · KING_YOSEF_  
// ============================================

// --- DOM ELEMENTS ---
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// --- TAB SWITCHING LOGIC (Bulletproof) ---
loginTab.addEventListener('click', function(e) {
    e.preventDefault();
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', function(e) {
    e.preventDefault();
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

// ============================================
//  REST OF YOUR APP LOGIC (Storage, Messages, etc.)
// ============================================
// NOTE: If you had other code in script.js (like saving to localStorage, 
// sending messages, etc.), paste it BELOW this line. 
// The tab-switching code above MUST stay at the very top.