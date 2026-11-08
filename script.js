// ============================================
//  VIOLETCHAT · KING_YOSEF_  
// ============================================

// 1. STORAGE KEYS
const USERS_KEY = 'violetchat_users';
const SESSION_KEY = 'violetchat_currentUser';
const FRIENDS_KEY = 'violetchat_friends'; 
const MESSAGES_KEY = 'violetchat_messages'; 

// 2. LOAD DATA FROM LOCAL STORAGE
function loadJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
}
let users = loadJSON(USERS_KEY, {});            
let friends = loadJSON(FRIENDS_KEY, {});        
let allMessages = loadJSON(MESSAGES_KEY, {});   
let currentUser = localStorage.getItem(SESSION_KEY); 

// 3. DOM ELEMENTS
// Tabs & Forms
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
// Auth Inputs
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const signupUsername = document.getElementById('signupUsername');
const signupDisplay = document.getElementById('signupDisplay');
const signupPassword = document.getElementById('signupPassword');
const signupBtn = document.getElementById('signupBtn');

// 4. TAB SWITCHING LOGIC (Bulletproof)
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

// 5. AUTHENTICATION LOGIC
signupBtn.addEventListener('click', function() {
    const username = signupUsername.value.trim();
    const display = signupDisplay.value.trim();
    const password = signupPassword.value;

    if (!username) return alert('Please enter a username.');
    if (!password) return alert('Please enter a password.');
    if (users[username]) return alert('Username already taken!');

    // Create user
    users[username] = {
        password: password,
        displayName: display || username
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Setup friends list for new user
    if (!friends[username]) friends[username] = [];
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));

    alert('Account created successfully! You can now log in.');
    
    // Auto-fill login and switch to login tab
    loginUsername.value = username;
    loginPassword.value = password;
    loginTab.click();
});

loginBtn.addEventListener('click', function() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    if (!users[username]) return alert('User not found.');
    if (users[username].password !== password) return alert('Incorrect password.');

    // Success! Save session and reload page to load the main app
    localStorage.setItem(SESSION_KEY, username);
    window.location.reload();
});

// 6. AUTO-LOGIN CHECK
// If a user is already logged in, hide the login screen
if (currentUser && users[currentUser]) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    
    // Initialize the main app (you will add your chat logic here later)
    document.getElementById('myDisplayName').textContent = users[currentUser].displayName;
    document.getElementById('myUsername').textContent = '@' + currentUser;
    document.getElementById('myAvatar').textContent = users[currentUser].displayName[0].toUpperCase();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem(SESSION_KEY);
        window.location.reload();
    });
}