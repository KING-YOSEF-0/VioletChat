console.log("VioletChat JS Loaded Successfully!");

// DOM Elements
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

const signupUsername = document.getElementById('signupUsername');
const signupDisplay = document.getElementById('signupDisplay');
const signupPassword = document.getElementById('signupPassword');
const signupBtn = document.getElementById('signupBtn');

// --- TAB SWITCHING ---
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

// --- SIGNUP LOGIC ---
signupBtn.addEventListener('click', () => {
    const username = signupUsername.value.trim();
    const display = signupDisplay.value.trim();
    const password = signupPassword.value;

    if (!username || !password) {
        alert("Please fill in both username and password.");
        return;
    }

    // Get existing users from LocalStorage
    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};

    if (users[username]) {
        alert("Username already taken!");
        return;
    }

    // Save new user
    users[username] = { password: password, displayName: display || username };
    localStorage.setItem('violetchat_users', JSON.stringify(users));

    alert("Account created successfully! Please log in.");
    
    // Switch to login tab and auto-fill
    loginUsername.value = username;
    loginPassword.value = password;
    loginTab.click();
});

// --- LOGIN LOGIC ---
loginBtn.addEventListener('click', () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};

    if (!users[username]) {
        alert("User not found. Please sign up first.");
        return;
    }

    if (users[username].password !== password) {
        alert("Incorrect password.");
        return;
    }

    // Success! Save session
    localStorage.setItem('violetchat_currentUser', username);
    
    // Show Main Screen
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    
    // Update Profile UI
    document.getElementById('myDisplayName').textContent = users[username].displayName;
    document.getElementById('myUsername').textContent = '@' + username;
    document.getElementById('myAvatar').textContent = users[username].displayName[0].toUpperCase();
});

// --- LOGOUT LOGIC ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('violetchat_currentUser');
    window.location.reload();
});

// --- AUTO LOGIN (if already logged in) ---
const currentUser = localStorage.getItem('violetchat_currentUser');
if (currentUser) {
    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};
    if (users[currentUser]) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
        document.getElementById('myDisplayName').textContent = users[currentUser].displayName;
        document.getElementById('myUsername').textContent = '@' + currentUser;
        document.getElementById('myAvatar').textContent = users[currentUser].displayName[0].toUpperCase();
    }
}