console.log("VioletChat Full App Loaded!");

// --- DOM ELEMENTS ---
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

const authScreen = document.getElementById('authScreen');
const mainScreen = document.getElementById('mainScreen');

const myAvatar = document.getElementById('myAvatar');
const myDisplayName = document.getElementById('myDisplayName');
const myUsername = document.getElementById('myUsername');
const logoutBtn = document.getElementById('logoutBtn');
const searchUsername = document.getElementById('searchUsername');
const addFriendBtn = document.getElementById('addFriendBtn');
const friendsList = document.getElementById('friendsList');

const chatAvatar = document.getElementById('chatAvatar');
const chatDisplayName = document.getElementById('chatDisplayName');
const chatStatus = document.getElementById('chatStatus');
const messagesContainer = document.getElementById('messagesContainer');
const messageInputArea = document.getElementById('messageInputArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const imageUpload = document.getElementById('imageUpload');

// --- STATE ---
let currentChatWith = null;

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

// --- AUTHENTICATION ---
signupBtn.addEventListener('click', () => {
    const username = signupUsername.value.trim().toLowerCase();
    const display = signupDisplay.value.trim();
    const password = signupPassword.value;

    if (!username || !password) return alert("Please fill in username and password.");

    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};
    if (users[username]) return alert("Username already taken!");

    users[username] = { password: password, displayName: display || username };
    localStorage.setItem('violetchat_users', JSON.stringify(users));

    alert("Account created! Please log in.");
    loginUsername.value = username;
    loginPassword.value = password;
    loginTab.click();
});

loginBtn.addEventListener('click', () => {
    const username = loginUsername.value.trim().toLowerCase();
    const password = loginPassword.value;

    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};
    if (!users[username]) return alert("User not found.");
    if (users[username].password !== password) return alert("Incorrect password.");

    localStorage.setItem('violetchat_currentUser', username);
    loadApp();
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('violetchat_currentUser');
    window.location.reload();
});

// --- MAIN APP LOGIC ---
function loadApp() {
    const currentUser = localStorage.getItem('violetchat_currentUser');
    if (!currentUser) return;

    let users = JSON.parse(localStorage.getItem('violetchat_users')) || {};
    let friends = JSON.parse(localStorage.getItem('violetchat_friends')) || {};
    let messages = JSON.parse(localStorage.getItem('violetchat_messages')) || {};

    if (!users[currentUser]) return;

    // Show Main Screen
    authScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');

    // Set Profile
    myDisplayName.textContent = users[currentUser].displayName;
    myUsername.textContent = '@' + currentUser;
    myAvatar.textContent = users[currentUser].displayName[0].toUpperCase();

    // Load Friends
    let myFriends = friends[currentUser] || [];
    renderFriends(myFriends, users);

    // --- ADD FRIEND ---
    addFriendBtn.addEventListener('click', () => {
        const friendUsername = searchUsername.value.trim().toLowerCase();
        if (!friendUsername) return;
        if (friendUsername === currentUser) return alert("You can't add yourself.");
        if (!users[friendUsername]) return alert("User does not exist.");
        if (myFriends.includes(friendUsername)) return alert("Already friends!");

        // Add to both users (Mutual)
        myFriends.push(friendUsername);
        friends[currentUser] = myFriends;
        
        if (!friends[friendUsername]) friends[friendUsername] = [];
        friends[friendUsername].push(currentUser);

        localStorage.setItem('violetchat_friends', JSON.stringify(friends));
        searchUsername.value = '';
        renderFriends(myFriends, users);
        alert("Friend added!");
    });

    // --- RENDER FRIENDS LIST ---
    function renderFriends(friendsArray, allUsers) {
        friendsList.innerHTML = '';
        if (friendsArray.length === 0) {
            friendsList.innerHTML = '<li style="color:#7d6197; padding: 10px; text-align:center;">No friends yet. Search above to add!</li>';
            return;
        }

        friendsArray.forEach(friendName => {
            const friendData = allUsers[friendName];
            const li = document.createElement('li');
            li.className = `friend-item ${currentChatWith === friendName ? 'active' : ''}`;
            li.innerHTML = `
                <div class="friend-avatar">${friendData.displayName[0].toUpperCase()}</div>
                <div class="friend-details">
                    <div class="friend-name">${friendData.displayName}</div>
                    <span class="friend-status online">Online</span>
                </div>
            `;
            li.addEventListener('click', () => openChat(friendName, friendData));
            friendsList.appendChild(li);
        });
    }

    // --- OPEN CHAT ---
    function openChat(friendUsername, friendData) {
        currentChatWith = friendUsername;
        chatAvatar.textContent = friendData.displayName[0].toUpperCase();
        chatDisplayName.textContent = friendData.displayName;
        chatStatus.textContent = "Online";
        chatStatus.className = "status-badge online";
        messageInputArea.classList.remove('hidden');

        // Highlight active friend
        renderFriends(myFriends, users);

        // Load Messages
        renderMessages();
    }

    // --- RENDER MESSAGES ---
    function renderMessages() {
        const chatKey = [currentUser, currentChatWith].sort().join('|');
        const currentMessages = messages[chatKey] || [];
        messagesContainer.innerHTML = '';

        if (currentMessages.length === 0) {
            messagesContainer.innerHTML = `<div class="empty-chat"><i class="fas fa-comment-dots"></i> Say hi to start!</div>`;
            return;
        }

        currentMessages.forEach(msg => {
            const isOwn = msg.sender === currentUser;
            const div = document.createElement('div');
            div.className = `message ${isOwn ? 'own' : ''}`;
            
            let content = '';
            if (msg.image) content += `<img src="${msg.image}" class="message-image">`;
            if (msg.text) content += `<div>${msg.text}</div>`;

            div.innerHTML = `<div class="message-bubble">${content}</div>`;
            messagesContainer.appendChild(div);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- SEND MESSAGES ---
    function sendMessage(text, image = null) {
        if (!currentChatWith) return alert("Select a friend first!");
        if (!text && !image) return;

        const chatKey = [currentUser, currentChatWith].sort().join('|');
        if (!messages[chatKey]) messages[chatKey] = [];

        messages[chatKey].push({
            sender: currentUser,
            text: text,
            image: image,
            time: Date.now()
        });

        localStorage.setItem('violetchat_messages', JSON.stringify(messages));
        renderMessages();
    }

    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                sendMessage('', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Auto-login on page load
const currentUser = localStorage.getItem('violetchat_currentUser');
if (currentUser) loadApp();