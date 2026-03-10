// Predefined users
const validUsers = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" },
  { username: "student", password: "learn123" },
  { username: "demo", password: "demo123" },
  { username: "Monica Raghini", password: "moni@26" },
  { username: "1234", password: "1234" }
  
];

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('message');
    const loader = document.getElementById('loader');
    const loginBtn = document.getElementById('loginBtn');
    
    // Check if username is empty
    if (!username) {
        messageEl.textContent = 'Please enter a username';
        return;
    }
    
    // Check if password is empty
    if (!password) {
        messageEl.textContent = 'Please enter a password';
        return;
    }
    
    // Validate credentials
    const user = validUsers.find(u => u.username === username && u.password === password);
    
    if (!user) {
        messageEl.textContent = 'Invalid username or password';
        return;
    }
    
    // Show loader
    loader.classList.remove('hidden');
    loginBtn.disabled = true;
    messageEl.textContent = '';
    
    // Save CURRENT USER info to localStorage
    localStorage.setItem('currentUser', username);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Initialize user data if it doesn't exist
    initializeUserData(username);
    
    // Simulate loading
    setTimeout(() => {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Initialize user-specific storage
function initializeUserData(username) {
    // Check if user already has data
    const userCollectionKey = `${username}_flashcardCollection`;
    const userExportedKey = `${username}_exportedFlashcardFiles`;
    
    // If user doesn't have collection yet, create empty one
    if (!localStorage.getItem(userCollectionKey)) {
        localStorage.setItem(userCollectionKey, '[]');
    }
    
    // If user doesn't have exported files yet, create empty one
    if (!localStorage.getItem(userExportedKey)) {
        localStorage.setItem(userExportedKey, '[]');
    }
    
    console.log(`User data initialized for: ${username}`);
}

// Demo login function
function demoLogin() {
    document.getElementById('username').value = 'demo';
    document.getElementById('password').value = 'demo123';
    login();
}

// Enter key handlers
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});


