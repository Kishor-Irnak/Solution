// Solutions Management
class SolutionsManager {
    constructor() {
        this.problems = problemsManager;
    }

    // Add solution to a problem
    addSolution(problemId, solutionText) {
        const problem = this.problems.getProblemById(problemId);
        if (!problem || !authManager.isLoggedIn()) {
            throw new Error('Cannot add solution');
        }

        const newSolution = {
            id: Date.now().toString(),
            text: solutionText,
            authorId: authManager.currentUser.id,
            authorName: authManager.currentUser.name,
            authorAvatar: authManager.currentUser.avatar,
            createdAt: new Date().toISOString(),
            upvotes: [],
            downvotes: [],
            score: 0
        };

        problem.solutions.push(newSolution);
        this.problems.saveProblems();

        // Update user stats
        authManager.incrementUserStats(authManager.currentUser.id, 'solutionsProvided');

        return newSolution;
    }

    // Vote on a solution
    voteSolution(problemId, solutionId, voteType) {
        if (!authManager.isLoggedIn()) {
            throw new Error('Must be logged in to vote');
        }

        const problem = this.problems.getProblemById(problemId);
        if (!problem) {
            throw new Error('Problem not found');
        }

        const solution = problem.solutions.find(s => s.id === solutionId);
        if (!solution) {
            throw new Error('Solution not found');
        }

        const userId = authManager.currentUser.id;
        
        // Remove existing votes from this user
        solution.upvotes = solution.upvotes.filter(id => id !== userId);
        solution.downvotes = solution.downvotes.filter(id => id !== userId);

        // Add new vote
        if (voteType === 'up') {
            solution.upvotes.push(userId);
        } else if (voteType === 'down') {
            solution.downvotes.push(userId);
        }

        // Calculate score
        solution.score = solution.upvotes.length - solution.downvotes.length;

        this.problems.saveProblems();

        return solution;
    }

    // Get user's vote for a solution
    getUserVote(solutionId, problemId) {
        if (!authManager.isLoggedIn()) return null;

        const problem = this.problems.getProblemById(problemId);
        if (!problem) return null;

        const solution = problem.solutions.find(s => s.id === solutionId);
        if (!solution) return null;

        const userId = authManager.currentUser.id;

        if (solution.upvotes.includes(userId)) return 'up';
        if (solution.downvotes.includes(userId)) return 'down';
        return null;
    }

    // Sort solutions by score
    getSortedSolutions(problemId) {
        const problem = this.problems.getProblemById(problemId);
        if (!problem) return [];

        return [...problem.solutions].sort((a, b) => {
            // Best solution first
            if (problem.bestSolutionId === a.id) return -1;
            if (problem.bestSolutionId === b.id) return 1;
            
            // Then by score
            return b.score - a.score;
        });
    }

    // Check if user can mark best solution
    canMarkBestSolution(problemId) {
        if (!authManager.isLoggedIn()) return false;
        
        const problem = this.problems.getProblemById(problemId);
        return problem && problem.authorId === authManager.currentUser.id && !problem.isResolved;
    }

    // Mark as best solution
    markAsBest(problemId, solutionId) {
        if (!this.canMarkBestSolution(problemId)) {
            throw new Error('Cannot mark best solution');
        }

        this.problems.markBestSolution(problemId, solutionId);
    }
}

// Initialize solutions manager
const solutionsManager = new SolutionsManager();