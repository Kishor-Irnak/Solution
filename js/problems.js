// Problems Management
class ProblemsManager {
    constructor() {
        this.problems = this.getProblems();
    }

    // Get all problems from localStorage
    getProblems() {
        const problems = localStorage.getItem('problems');
        return problems ? JSON.parse(problems) : [];
    }

    // Save problems to localStorage
    saveProblems() {
        localStorage.setItem('problems', JSON.stringify(this.problems));
    }

    // Create new problem
    createProblem(problemData) {
        const newProblem = {
            id: Date.now().toString(),
            title: problemData.title,
            description: problemData.description,
            category: problemData.category,
            image: problemData.image || null,
            authorId: authManager.currentUser.id,
            authorName: authManager.currentUser.name,
            authorAvatar: authManager.currentUser.avatar,
            createdAt: new Date().toISOString(),
            solutions: [],
            bestSolutionId: null,
            views: 0,
            isResolved: false
        };

        this.problems.unshift(newProblem);
        this.saveProblems();

        // Update user stats
        authManager.incrementUserStats(authManager.currentUser.id, 'problemsPosted');

        return newProblem;
    }

    // Get problem by ID
    getProblemById(problemId) {
        return this.problems.find(problem => problem.id === problemId);
    }

    // Update problem
    updateProblem(problemId, updates) {
        const problemIndex = this.problems.findIndex(p => p.id === problemId);
        if (problemIndex !== -1) {
            this.problems[problemIndex] = { ...this.problems[problemIndex], ...updates };
            this.saveProblems();
            return this.problems[problemIndex];
        }
        return null;
    }

    // Mark problem as resolved with best solution
    markBestSolution(problemId, solutionId) {
        const problem = this.getProblemById(problemId);
        if (problem) {
            problem.bestSolutionId = solutionId;
            problem.isResolved = true;
            this.saveProblems();

            // Award reputation to solution author
            const solution = problem.solutions.find(s => s.id === solutionId);
            if (solution) {
                const solutionAuthor = authManager.getUserById(solution.authorId);
                if (solutionAuthor) {
                    authManager.incrementUserStats(solution.authorId, 'reputation');
                    authManager.incrementUserStats(solution.authorId, 'reputation'); // +2 for best solution
                }
            }
        }
    }

    // Increment problem views
    incrementViews(problemId) {
        const problem = this.getProblemById(problemId);
        if (problem) {
            problem.views++;
            this.saveProblems();
        }
    }

    // Get problems by category
    getProblemsByCategory(category) {
        return this.problems.filter(problem => problem.category === category);
    }

    // Get problems by user
    getProblemsByUser(userId) {
        return this.problems.filter(problem => problem.authorId === userId);
    }

    // Search problems
    searchProblems(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.problems.filter(problem => 
            problem.title.toLowerCase().includes(lowercaseQuery) ||
            problem.description.toLowerCase().includes(lowercaseQuery) ||
            problem.category.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Get paginated problems
    getPaginatedProblems(page = 1, limit = 10) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return this.problems.slice(startIndex, endIndex);
    }

    // Get total problems count
    getTotalProblems() {
        return this.problems.length;
    }

    // Get solved problems count
    getSolvedProblems() {
        return this.problems.filter(problem => problem.isResolved).length;
    }
}

// Initialize problems manager
const problemsManager = new ProblemsManager();