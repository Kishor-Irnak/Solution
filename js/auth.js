// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.users = this.getUsers();
    }

    // Get current logged-in user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Get all registered users
    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Register new user
    register(userData) {
        // Check if email already exists
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=100`,
            joinedAt: new Date().toISOString(),
            problemsPosted: 0,
            solutionsProvided: 0,
            reputation: 0
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return newUser;
    }

    // Login user
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Update current user data
    updateCurrentUser(updates) {
        if (!this.currentUser) return;

        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
        }

        // Update current user
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Get user by ID
    getUserById(userId) {
        return this.users.find(user => user.id === userId);
    }

    // Update user stats
    incrementUserStats(userId, statType) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex][statType]++;
            this.saveUsers();

            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser[statType]++;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();