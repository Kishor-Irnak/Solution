// Main Application Logic
class App {
    constructor() {
        this.currentPage = 1;
        this.problemsPerPage = 10;
        this.initializeApp();
        this.bindEvents();
        this.loadInitialData();
    }

    initializeApp() {
        this.updateUI();
        this.loadProblemsFromSampleData();
    }

    bindEvents() {
        // Authentication events
        document.getElementById('login-btn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('signup-btn').addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('welcome-login').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('welcome-signup').addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Modal events
        document.getElementById('close-auth-modal').addEventListener('click', () => this.hideAuthModal());
        document.getElementById('close-post-modal').addEventListener('click', () => this.hidePostModal());
        document.getElementById('close-problem-detail').addEventListener('click', () => this.hideProblemDetailModal());
        
        // Form events
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('post-form').addEventListener('submit', (e) => this.handlePostProblem(e));
        
        // Switch between login and signup
        document.getElementById('switch-to-signup').addEventListener('click', () => this.switchAuthForm('signup'));
        document.getElementById('switch-to-login').addEventListener('click', () => this.switchAuthForm('login'));
        
        // Post problem events
        document.getElementById('post-problem-btn').addEventListener('click', () => this.showPostModal());
        document.getElementById('image-upload-btn').addEventListener('click', () => this.triggerImageUpload());
        document.getElementById('problem-image').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('remove-image').addEventListener('click', () => this.removeImage());
        
        // User menu toggle
        document.getElementById('user-menu-btn').addEventListener('click', () => this.toggleUserMenu());
        
        // Load more button
        document.getElementById('load-more-btn').addEventListener('click', () => this.loadMoreProblems());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('fixed')) {
                this.hideAuthModal();
                this.hidePostModal();
                this.hideProblemDetailModal();
            }
        });
    }

    updateUI() {
        const isLoggedIn = authManager.isLoggedIn();
        
        // Show/hide navigation sections
        document.getElementById('nav-user-section').style.display = isLoggedIn ? 'block' : 'none';
        document.getElementById('nav-auth-section').style.display = isLoggedIn ? 'none' : 'block';
        
        // Update user info in navigation
        if (isLoggedIn) {
            document.getElementById('nav-username').textContent = authManager.currentUser.name;
            document.getElementById('nav-user-avatar').src = authManager.currentUser.avatar;
        }
        
        // Show/hide welcome section
        document.getElementById('welcome-section').style.display = isLoggedIn ? 'none' : 'block';
        
        // Update stats
        this.updateStats();
    }

    updateStats() {
        document.getElementById('total-problems').textContent = problemsManager.getTotalProblems();
        document.getElementById('solved-problems').textContent = problemsManager.getSolvedProblems();
        document.getElementById('active-users').textContent = authManager.users.length;
    }

    // Authentication methods
    showAuthModal(type) {
        document.getElementById('auth-modal').classList.remove('hidden');
        this.switchAuthForm(type);
    }

    hideAuthModal() {
        document.getElementById('auth-modal').classList.add('hidden');
        this.clearAuthForms();
    }

    switchAuthForm(type) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const title = document.getElementById('auth-modal-title');
        
        if (type === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            title.textContent = 'Sign In';
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            title.textContent = 'Create Account';
        }
    }

    clearAuthForms() {
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            authManager.login(email, password);
            this.hideAuthModal();
            this.updateUI();
            this.showNotification('Welcome back!', 'success');
            this.loadProblems();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            authManager.register({ name, email, password });
            authManager.login(email, password);
            this.hideAuthModal();
            this.updateUI();
            this.showNotification('Welcome to ProblemSolve!', 'success');
            this.loadProblems();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    logout() {
        authManager.logout();
        this.updateUI();
        this.hideUserMenu();
        this.showNotification('Logged out successfully', 'success');
        this.loadProblems();
    }

    toggleUserMenu() {
        const menu = document.getElementById('user-menu');
        menu.classList.toggle('hidden');
    }

    hideUserMenu() {
        document.getElementById('user-menu').classList.add('hidden');
    }

    // Post problem methods
    showPostModal() {
        if (!authManager.isLoggedIn()) {
            this.showAuthModal('login');
            return;
        }
        document.getElementById('post-modal').classList.remove('hidden');
    }

    hidePostModal() {
        document.getElementById('post-modal').classList.add('hidden');
        document.getElementById('post-form').reset();
        this.removeImage();
    }

    triggerImageUpload() {
        document.getElementById('problem-image').click();
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-img').src = e.target.result;
                document.getElementById('image-preview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        document.getElementById('problem-image').value = '';
        document.getElementById('image-preview').classList.add('hidden');
    }

    handlePostProblem(e) {
        e.preventDefault();
        
        const title = document.getElementById('problem-title').value;
        const description = document.getElementById('problem-description').value;
        const category = document.getElementById('problem-category').value;
        const imageFile = document.getElementById('problem-image').files[0];
        
        let imageData = null;
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageData = e.target.result;
                this.createProblem({ title, description, category, image: imageData });
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.createProblem({ title, description, category });
        }
    }

    createProblem(problemData) {
        try {
            const problem = problemsManager.createProblem(problemData);
            this.hidePostModal();
            this.showNotification('Problem posted successfully!', 'success');
            this.loadProblems();
            this.updateStats();
        } catch (error) {
            this.showNotification('Failed to post problem', 'error');
        }
    }

    // Problem display methods
    loadProblems() {
        const feed = document.getElementById('problems-feed');
        const problems = problemsManager.getPaginatedProblems(1, this.problemsPerPage);
        
        feed.innerHTML = '';
        this.currentPage = 1;
        
        if (problems.length === 0) {
            this.showEmptyState();
        } else {
            problems.forEach(problem => {
                feed.appendChild(this.createProblemCard(problem));
            });
            this.updateLoadMoreButton();
        }
    }

    loadMoreProblems() {
        this.currentPage++;
        const problems = problemsManager.getPaginatedProblems(this.currentPage, this.problemsPerPage);
        const feed = document.getElementById('problems-feed');
        
        problems.forEach(problem => {
            feed.appendChild(this.createProblemCard(problem));
        });
        
        this.updateLoadMoreButton();
    }

    updateLoadMoreButton() {
        const button = document.getElementById('load-more-btn');
        const totalProblems = problemsManager.getTotalProblems();
        const loadedProblems = this.currentPage * this.problemsPerPage;
        
        if (loadedProblems < totalProblems) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    }

    createProblemCard(problem) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer';
        
        const timeAgo = this.formatTimeAgo(problem.createdAt);
        const isResolved = problem.isResolved;
        
        card.innerHTML = `
            <div class="flex items-start space-x-4">
                <img src="${problem.authorAvatar}" alt="${problem.authorName}" class="w-12 h-12 rounded-full">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h3 class="font-semibold text-gray-900">${problem.authorName}</h3>
                        <span class="text-gray-500">·</span>
                        <span class="text-gray-500 text-sm">${timeAgo}</span>
                        ${isResolved ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Solved</span>' : ''}
                    </div>
                    
                    <h2 class="text-xl font-bold text-gray-900 mb-2 hover:text-twitter">${problem.title}</h2>
                    <p class="text-gray-700 mb-3 line-clamp-3">${problem.description}</p>
                    
                    <div class="flex items-center space-x-4 mb-4">
                        <span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">${problem.category}</span>
                        <span class="text-gray-500 text-sm flex items-center">
                            <i class="fas fa-eye mr-1"></i> ${problem.views} views
                        </span>
                        <span class="text-gray-500 text-sm flex items-center">
                            <i class="fas fa-comments mr-1"></i> ${problem.solutions.length} solutions
                        </span>
                    </div>
                    
                    ${problem.image ? `<img src="${problem.image}" alt="Problem image" class="w-full h-48 object-cover rounded-lg mb-4">` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.showProblemDetail(problem.id));
        
        return card;
    }

    showEmptyState() {
        const feed = document.getElementById('problems-feed');
        feed.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-lightbulb text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No problems yet</h3>
                <p class="text-gray-500 mb-6">Be the first to share a problem and get help from the community!</p>
                ${authManager.isLoggedIn() ? 
                    '<button onclick="app.showPostModal()" class="bg-twitter text-white px-6 py-3 rounded-full hover:bg-twitter-dark transition-colors font-semibold">Post Your First Problem</button>' :
                    '<button onclick="app.showAuthModal(\'signup\')" class="bg-twitter text-white px-6 py-3 rounded-full hover:bg-twitter-dark transition-colors font-semibold">Join to Post Problems</button>'
                }
            </div>
        `;
    }

    // Problem detail methods
    showProblemDetail(problemId) {
        const problem = problemsManager.getProblemById(problemId);
        if (!problem) return;
        
        // Increment views
        problemsManager.incrementViews(problemId);
        
        const modal = document.getElementById('problem-detail-modal');
        const content = document.getElementById('problem-detail-content');
        
        content.innerHTML = this.createProblemDetailHTML(problem);
        modal.classList.remove('hidden');
        
        this.bindProblemDetailEvents(problemId);
    }

    hideProblemDetailModal() {
        document.getElementById('problem-detail-modal').classList.add('hidden');
    }

    createProblemDetailHTML(problem) {
        const timeAgo = this.formatTimeAgo(problem.createdAt);
        const solutions = solutionsManager.getSortedSolutions(problem.id);
        const canMarkBest = solutionsManager.canMarkBestSolution(problem.id);
        
        return `
            <div class="space-y-6">
                <!-- Problem Header -->
                <div class="flex items-start space-x-4">
                    <img src="${problem.authorAvatar}" alt="${problem.authorName}" class="w-16 h-16 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h3 class="font-semibold text-gray-900 text-lg">${problem.authorName}</h3>
                            <span class="text-gray-500">·</span>
                            <span class="text-gray-500">${timeAgo}</span>
                            ${problem.isResolved ? '<span class="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">Solved</span>' : ''}
                        </div>
                        
                        <h1 class="text-2xl font-bold text-gray-900 mb-3">${problem.title}</h1>
                        <p class="text-gray-700 text-lg leading-relaxed mb-4">${problem.description}</p>
                        
                        <div class="flex items-center space-x-4 mb-4">
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">${problem.category}</span>
                            <span class="text-gray-500 flex items-center">
                                <i class="fas fa-eye mr-1"></i> ${problem.views} views
                            </span>
                        </div>
                        
                        ${problem.image ? `<img src="${problem.image}" alt="Problem image" class="w-full max-h-96 object-cover rounded-lg">` : ''}
                    </div>
                </div>
                
                <hr class="border-gray-200">
                
                <!-- Solutions Section -->
                <div>
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-gray-900">
                            Solutions (${solutions.length})
                        </h2>
                    </div>
                    
                    <!-- Add Solution Form -->
                    ${authManager.isLoggedIn() ? `
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <div class="flex items-start space-x-4">
                                <img src="${authManager.currentUser.avatar}" alt="${authManager.currentUser.name}" class="w-10 h-10 rounded-full">
                                <div class="flex-1">
                                    <textarea id="solution-input" rows="3" placeholder="Share your solution..." 
                                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-twitter focus:border-transparent resize-none"></textarea>
                                    <div class="flex justify-end mt-3">
                                        <button id="submit-solution" class="bg-twitter text-white px-6 py-2 rounded-full hover:bg-twitter-dark transition-colors font-semibold">
                                            Post Solution
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                            <p class="text-gray-600 mb-4">Want to help solve this problem?</p>
                            <button onclick="app.showAuthModal('login')" class="bg-twitter text-white px-6 py-3 rounded-full hover:bg-twitter-dark transition-colors font-semibold">
                                Sign In to Post Solution
                            </button>
                        </div>
                    `}
                    
                    <!-- Solutions List -->
                    <div id="solutions-list" class="space-y-4">
                        ${solutions.length === 0 ? 
                            '<p class="text-gray-500 text-center py-8">No solutions yet. Be the first to help!</p>' :
                            solutions.map(solution => this.createSolutionHTML(solution, problem.id, canMarkBest)).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    }

    createSolutionHTML(solution, problemId, canMarkBest) {
        const timeAgo = this.formatTimeAgo(solution.createdAt);
        const userVote = solutionsManager.getUserVote(solution.id, problemId);
        const problem = problemsManager.getProblemById(problemId);
        const isBestSolution = problem.bestSolutionId === solution.id;
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 ${isBestSolution ? 'bg-green-50 border-green-200' : 'bg-white'}">
                ${isBestSolution ? '<div class="flex items-center text-green-700 mb-3"><i class="fas fa-check-circle mr-2"></i><span class="font-semibold">Best Solution</span></div>' : ''}
                
                <div class="flex items-start space-x-4">
                    <img src="${solution.authorAvatar}" alt="${solution.authorName}" class="w-10 h-10 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h4 class="font-semibold text-gray-900">${solution.authorName}</h4>
                            <span class="text-gray-500">·</span>
                            <span class="text-gray-500 text-sm">${timeAgo}</span>
                        </div>
                        
                        <p class="text-gray-700 mb-4 leading-relaxed">${solution.text}</p>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <!-- Voting buttons -->
                                ${authManager.isLoggedIn() ? `
                                    <div class="flex items-center space-x-2">
                                        <button onclick="app.voteSolution('${problemId}', '${solution.id}', 'up')" 
                                                class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${userVote === 'up' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-600'}">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>${solution.upvotes.length}</span>
                                        </button>
                                        <button onclick="app.voteSolution('${problemId}', '${solution.id}', 'down')" 
                                                class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${userVote === 'down' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100 text-gray-600'}">
                                            <i class="fas fa-arrow-down"></i>
                                            <span>${solution.downvotes.length}</span>
                                        </button>
                                        <span class="text-gray-500 font-semibold">Score: ${solution.score}</span>
                                    </div>
                                ` : `
                                    <div class="flex items-center space-x-2 text-gray-500">
                                        <span><i class="fas fa-arrow-up mr-1"></i>${solution.upvotes.length}</span>
                                        <span><i class="fas fa-arrow-down mr-1"></i>${solution.downvotes.length}</span>
                                        <span class="font-semibold">Score: ${solution.score}</span>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Mark as best solution button -->
                            ${canMarkBest && !isBestSolution ? `
                                <button onclick="app.markBestSolution('${problemId}', '${solution.id}')" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors text-sm font-semibold">
                                    Mark as Best
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindProblemDetailEvents(problemId) {
        const submitBtn = document.getElementById('submit-solution');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitSolution(problemId));
        }
        
        const solutionInput = document.getElementById('solution-input');
        if (solutionInput) {
            solutionInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.submitSolution(problemId);
                }
            });
        }
    }

    submitSolution(problemId) {
        const input = document.getElementById('solution-input');
        const text = input.value.trim();
        
        if (!text) {
            this.showNotification('Please enter a solution', 'error');
            return;
        }
        
        try {
            solutionsManager.addSolution(problemId, text);
            input.value = '';
            this.showNotification('Solution posted successfully!', 'success');
            this.showProblemDetail(problemId); // Refresh the detail view
            this.updateStats();
        } catch (error) {
            this.showNotification('Failed to post solution', 'error');
        }
    }

    voteSolution(problemId, solutionId, voteType) {
        if (!authManager.isLoggedIn()) {
            this.showAuthModal('login');
            return;
        }
        
        try {
            solutionsManager.voteSolution(problemId, solutionId, voteType);
            this.showProblemDetail(problemId); // Refresh the detail view
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    markBestSolution(problemId, solutionId) {
        try {
            solutionsManager.markAsBest(problemId, solutionId);
            this.showNotification('Marked as best solution!', 'success');
            this.showProblemDetail(problemId); // Refresh the detail view
            this.loadProblems(); // Refresh the main feed
            this.updateStats();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    // Utility methods
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return time.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        }[type];
        
        notification.classList.add(bgColor, 'text-white');
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    loadInitialData() {
        this.loadProblems();
    }

    loadProblemsFromSampleData() {
        // Only load sample data if no problems exist
        if (problemsManager.getTotalProblems() === 0) {
            this.createSampleData();
        }
    }

    createSampleData() {
        // Create sample users if none exist
        if (authManager.users.length === 0) {
            const sampleUsers = [
                { name: 'Alex Johnson', email: 'alex@example.com', password: 'password123' },
                { name: 'Sarah Wilson', email: 'sarah@example.com', password: 'password123' },
                { name: 'Mike Chen', email: 'mike@example.com', password: 'password123' },
                { name: 'Emma Davis', email: 'emma@example.com', password: 'password123' }
            ];

            sampleUsers.forEach(userData => {
                try {
                    authManager.register(userData);
                } catch (error) {
                    // User might already exist
                }
            });
        }

        // Create sample problems
        const sampleProblems = [
            {
                title: "Website loading too slowly on mobile devices",
                description: "My e-commerce website takes over 8 seconds to load on mobile devices, causing high bounce rates. I've optimized images but the issue persists. Looking for technical solutions to improve mobile performance.",
                category: "Technology",
                authorId: authManager.users[0]?.id,
                image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
                title: "How to improve team communication in remote work",
                description: "Our remote team struggles with communication gaps and missed deadlines. We're using Slack but still having issues coordinating projects. Need advice on tools and strategies for better remote collaboration.",
                category: "Business",
                authorId: authManager.users[1]?.id,
                image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
                title: "Sustainable packaging solution for small business",
                description: "I run a small online store and want to switch to eco-friendly packaging, but costs are 3x higher than current materials. Looking for affordable sustainable packaging options that won't break my budget.",
                category: "Business",
                authorId: authManager.users[2]?.id,
                image: "https://images.pexels.com/photos/3750164/pexels-photo-3750164.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
                title: "React app deployment issues with environment variables",
                description: "Having trouble deploying my React application to production. Environment variables work locally but not in production build. Getting undefined values in production environment.",
                category: "Technology",
                authorId: authManager.users[3]?.id,
                image: "https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
        ];

        sampleProblems.forEach(problemData => {
            if (problemData.authorId) {
                const currentUser = authManager.currentUser;
                authManager.currentUser = authManager.getUserById(problemData.authorId);
                problemsManager.createProblem(problemData);
                authManager.currentUser = currentUser;
            }
        });

        // Add sample solutions
        const problems = problemsManager.problems;
        if (problems.length > 0) {
            // Add solutions to first problem
            const problem1 = problems[0];
            if (problem1) {
                const solutions = [
                    "Try implementing lazy loading for images and using WebP format. Also consider using a CDN for faster content delivery.",
                    "Check your JavaScript bundle size - you might have large unused libraries. Use webpack-bundle-analyzer to identify bottlenecks.",
                    "Enable Gzip compression on your server and minify CSS/JS files. This can reduce load times by 60-80%."
                ];

                solutions.forEach((solutionText, index) => {
                    const userId = authManager.users[index + 1]?.id;
                    if (userId) {
                        const currentUser = authManager.currentUser;
                        authManager.currentUser = authManager.getUserById(userId);
                        solutionsManager.addSolution(problem1.id, solutionText);
                        authManager.currentUser = currentUser;
                    }
                });
            }

            // Add solutions to second problem
            const problem2 = problems[1];
            if (problem2) {
                const solutions = [
                    "Consider using Asana or Monday.com for project management. Set up daily standups and weekly planning sessions.",
                    "Implement a clear communication protocol - urgent matters via phone, project updates via dedicated channels, casual chat in general channel."
                ];

                solutions.forEach((solutionText, index) => {
                    const userId = authManager.users[index + 2]?.id;
                    if (userId) {
                        const currentUser = authManager.currentUser;
                        authManager.currentUser = authManager.getUserById(userId);
                        solutionsManager.addSolution(problem2.id, solutionText);
                        authManager.currentUser = currentUser;
                    }
                });
            }
        }
    }
}

// Initialize the application
const app = new App();