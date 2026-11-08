// ============================================
//  VIOLETCHAT · KING_YOSEF_  
//  All data stored in localStorage (no server)
// ============================================

(function() {
  // ---------- STORAGE HELPERS ----------
  const USERS_KEY = 'violetchat_users';
  const SESSION_KEY = 'violetchat_currentUser';
  const FRIENDS_KEY = 'violetchat_friends'; // { username: [friendUsernames] }
  const MESSAGES_KEY = 'violetchat_messages'; // { "user1|user2": [ { from, text, image, time } ] }

  function loadJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }
  function saveJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Load or init data
  let users = loadJSON(USERS_KEY, {});            // { username: { password, displayName } }
  let friends = loadJSON(FRIENDS_KEY, {});        // { username: [friend1, friend2] }
  let allMessages = loadJSON(MESSAGES_KEY, {});   // { "userA|userB": [ ... ] }

  let currentUser = localStorage.getItem(SESSION_KEY); // username string or null
  let currentChatWith = null; // username of the friend we are chatting with
  let onlineUsers = new Set(); // simulated online status; will be updated by interval

  // ---------- DOM ELEMENTS ----------
  const authScreen = document.getElementById('authScreen');
  const mainScreen = document.getElementById('mainScreen');
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

  const myAvatar = document.getElementById('myAvatar');
  const myDisplayName = document.getElementById('myDisplayName');
  const myUsername = document.getElementById('myUsername');
  const editProfileBtn = document.getElementById('editProfileBtn');
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

  const editModal = document.getElementById('editModal');
  const editDisplayName = document.getElementById('editDisplayName');
  const editPassword = document.getElementById('editPassword');
  const cancelEdit = document.getElementById('cancelEdit');
  const saveEdit = document.getElementById('saveEdit');

  // ---------- UTILS ----------
  function chatKey(userA, userB) {
    return [userA, userB].sort().join('|');
  }

  function getMessagesBetween(userA, userB) {
    const key = chatKey(userA, userB);
    return allMessages[key] || [];
  }

  function addMessage(from, to, text, imageData) {
    const key = chatKey(from, to);
    if (!allMessages[key]) allMessages[key] = [];
    allMessages[key].push({
      from,
      text: text || '',
      image: imageData || null,
      time: Date.now(),
    });
    saveJSON(MESSAGES_KEY, allMessages);
  }

  // Simulated online status (random, but deterministic per session interval)
  function updateOnlineStatus() {
    onlineUsers.clear();
    // All users have 60% chance to be online, but current user always online
    for (let u in users) {
      if (u === currentUser) onlineUsers.add(u);
      else if (Math.random() < 0.6) onlineUsers.add(u);
    }
    // also make sure friends of current user get some online
    if (currentUser && friends[currentUser]) {
      friends[currentUser].forEach(f => {
        if (Math.random() < 0.7) onlineUsers.add(f);
      });
    }
    renderFriendsList();
    updateChatHeaderStatus();
  }

  // ---------- RENDER FUNCTIONS ----------
  function renderFriendsList() {
    if (!currentUser) return;
    const myFriends = friends[currentUser] || [];
    friendsList.innerHTML = '';
    if (myFriends.length === 0) {
      friendsList.innerHTML = '<li style="color:#7b6197;padding:16px;text-align:center;">No friends yet. Search & add!</li>';
      return;
    }
    myFriends.forEach(friendUsername => {
      const friendData = users[friendUsername] || { displayName: friendUsername };
      const isOnline = onlineUsers.has(friendUsername);
      const li = document.createElement('li');
      li.className = `friend-item ${currentChatWith === friendUsername ? 'active' : ''}`;
      li.dataset.username = friendUsername;
      li.innerHTML = `
        <div class="friend-avatar">${friendData.displayName ? friendData.displayName[0].toUpperCase() : friendUsername[0].toUpperCase()}</div>
        <div class="friend-details">
          <div class="friend-name">${friendData.displayName || friendUsername}</div>
          <span class="friend-status ${isOnline ? 'online' : 'offline'}">${isOnline ? 'Online' : 'Offline'}</span>
        </div>
      `;
      li.addEventListener('click', () => selectChat(friendUsername));
      friendsList.appendChild(li);
    });
  }

  function updateChatHeaderStatus() {
    if (!currentChatWith) return;
    const isOnline = onlineUsers.has(currentChatWith);
    chatStatus.textContent = isOnline ? 'Online' : 'Offline';
    chatStatus.className = `status-badge ${isOnline ? 'online' : 'offline'}`;
  }

  function renderMessages() {
    if (!currentUser || !currentChatWith) return;
    const msgs = getMessagesBetween(currentUser, currentChatWith);
    const friendData = users[currentChatWith] || { displayName: currentChatWith };
    messagesContainer.innerHTML = '';
    if (msgs.length === 0) {
      messagesContainer.innerHTML = `<div class="empty-chat"><i class="fas fa-comment-dots"></i> No messages yet. Say hi!</div>`;
      return;
    }
    msgs.forEach(msg => {
      const isOwn = msg.from === currentUser;
      const div = document.createElement('div');
      div.className = `message ${isOwn ? 'own' : ''}`;
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      if (msg.image) {
        const img = document.createElement('img');
        img.src = msg.image;
        img.className = 'message-image';
        bubble.appendChild(img);
      }
      if (msg.text) {
        const textNode = document.createElement('div');
        textNode.textContent = msg.text;
        bubble.appendChild(textNode);
      }
      // sender name (only if not own)
      if (!isOwn) {
        const senderName = document.createElement('div');
        senderName.className = 'msg-sender';
        senderName.textContent = friendData.displayName || currentChatWith;
        div.appendChild(senderName);
      }
      div.appendChild(bubble);
      messagesContainer.appendChild(div);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function selectChat(friendUsername) {
    currentChatWith = friendUsername;
    const friendData = users[friendUsername] || { displayName: friendUsername };
    chatAvatar.textContent = (friendData.displayName || friendUsername)[0].toUpperCase();
    chatDisplayName.textContent = friendData.displayName || friendUsername;
    updateChatHeaderStatus();
    renderMessages();
    renderFriendsList(); // highlight active
    messageInputArea.classList.remove('hidden');
    messageInput.focus();
  }

  function refreshProfileUI() {
    if (!currentUser) return;
    const user = users[currentUser];
    if (!user) return;
    myDisplayName.textContent = user.displayName || currentUser;
    myUsername.textContent = `@${currentUser}`;
    myAvatar.textContent = (user.displayName || currentUser)[0].toUpperCase();
  }

  // ---------- AUTH ----------
  function login(username, password) {
    if (!users[username]) return alert('User not found');
    if (users[username].password !== password) return alert('Wrong password');
    currentUser = username;
    localStorage.setItem(SESSION_KEY, username);
    // init friends list if missing
    if (!friends[username]) friends[username] = [];
    saveJSON(FRIENDS_KEY, friends);
    // make sure current user is in online set
    onlineUsers.add(username);
    showMainScreen();
  }

  function signup(username, displayName, password) {
    if (!username.trim()) return alert('Username required');
    if (users[username]) return alert('Username already taken');
    if (password.length < 3) return alert('Password too short (min 3)');
    users[username] = {
      password,
      displayName: displayName.trim() || username,
    };
    saveJSON(USERS_KEY, users);
    friends[username] = [];
    saveJSON(FRIENDS_KEY, friends);
    login(username, password);
  }

  function logout() {
    if (currentUser) onlineUsers.delete(currentUser);
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    currentChatWith = null;
    showAuthScreen();
  }

  function showMainScreen() {
    authScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    refreshProfileUI();
    renderFriendsList();
    updateOnlineStatus();
    // reset chat area
    currentChatWith = null;
    chatAvatar.textContent = '?';
    chatDisplayName.textContent = 'Select a friend';
    chatStatus.textContent = 'offline';
    chatStatus.className = 'status-badge offline';
    messagesContainer.innerHTML = `<div class="empty-chat"><i class="fas fa-comment-slash"></i> Choose a friend to start chatting</div>`;
    messageInputArea.classList.add('hidden');
  }

  function showAuthScreen() {
    authScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    // Clear inputs
    loginUsername.value = '';
    loginPassword.value = '';
    signupUsername.value = '';
    signupDisplay.value = '';
    signupPassword.value = '';
  }

  // ---------- FRIEND MANAGEMENT ----------
  function addFriendByUsername(friendUsername) {
    if (!currentUser) return;
    if (friendUsername === currentUser) return alert("You can't add yourself");
    if (!users[friendUsername]) return alert('User not found');
    if (!friends[currentUser]) friends[currentUser] = [];
    if (friends[currentUser].includes(friendUsername)) return alert('Already friends');
    friends[currentUser].push(friendUsername);
    // also add reverse (mutual) for simplicity in this demo
    if (!friends[friendUsername]) friends[friendUsername] = [];
    if (!friends[friendUsername].includes(currentUser)) {
      friends[friendUsername].push(currentUser);
    }
    saveJSON(FRIENDS_KEY, friends);
    renderFriendsList();
    searchUsername.value = '';
    alert(`Added ${users[friendUsername].displayName || friendUsername} as friend`);
  }

  // ---------- PROFILE EDIT ----------
  function openEditModal() {
    if (!currentUser) return;
    const u = users[currentUser];
    editDisplayName.value = u.displayName || '';
    editPassword.value = '';
    editModal.classList.remove('hidden');
  }

  function saveProfileEdit() {
    if (!currentUser) return;
    const newDisplay = editDisplayName.value.trim();
    const newPass = editPassword.value.trim();
    if (newDisplay) {
      users[currentUser].displayName = newDisplay;
    }
    if (newPass) {
      users[currentUser].password = newPass;
    }
    saveJSON(USERS_KEY, users);
    refreshProfileUI();
    editModal.classList.add('hidden');
    // if display name changed, re-render chat header if chatting
    if (currentChatWith) {
      const friendData = users[currentChatWith];
      chatDisplayName.textContent = friendData.displayName || currentChatWith;
      chatAvatar.textContent = (friendData.displayName || currentChatWith)[0].toUpperCase();
    }
    renderFriendsList();
  }

  // ---------- MESSAGING ----------
  function sendTextMessage() {
    if (!currentUser || !currentChatWith) return;
    const text = messageInput.value.trim();
    if (!text) return;
    addMessage(currentUser, currentChatWith, text, null);
    messageInput.value = '';
    renderMessages();
    // simulate friend's online status (keep it)
    updateOnlineStatus();
  }

  function sendImage(file) {
    if (!file || !currentUser || !currentChatWith) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      addMessage(currentUser, currentChatWith, '', e.target.result);
      renderMessages();
      updateOnlineStatus();
    };
    reader.readAsDataURL(file);
    imageUpload.value = '';
  }

  // ---------- EVENT LISTENERS ----------
  // Tabs
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

  loginBtn.addEventListener('click', () => {
    login(loginUsername.value.trim(), loginPassword.value

