/**
 * Main Application Logic for Polly Poll Voting System
 * Handles UI interactions and vote casting functionality
 */

class PollyApp {
    constructor() {
        this.currentPoll = null;
        this.selectedOption = null;
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadPolls();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle form submissions
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('reg-username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        document.getElementById('reg-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
    }

    /**
     * Check authentication status on page load
     */
    checkAuthStatus() {
        if (apiClient.isAuthenticated()) {
            this.showUserInfo();
        } else {
            this.showLoginForm();
        }
    }

    /**
     * Show login form
     */
    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
    }

    /**
     * Show register form
     */
    showRegister() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
    }

    /**
     * Show login form
     */
    showLogin() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
    }

    /**
     * Show user info section
     */
    showUserInfo() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('current-user').textContent = apiClient.getCurrentUser();
    }

    /**
     * Handle user registration
     */
    async register() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showMessage('Registering...', 'info');
            await apiClient.register(username, password);
            this.showMessage('Registration successful! Please login.', 'success');
            this.showLogin();
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
        } catch (error) {
            this.showMessage(`Registration failed: ${error.message}`, 'error');
        }
    }

    /**
     * Handle user login
     */
    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showMessage('Logging in...', 'info');
            const tokenData = await apiClient.login(username, password);
            apiClient.setAuth(tokenData.access_token, username);
            this.showUserInfo();
            this.showMessage('Login successful!', 'success');
            this.loadPolls();
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } catch (error) {
            this.showMessage(`Login failed: ${error.message}`, 'error');
        }
    }

    /**
     * Handle user logout
     */
    logout() {
        apiClient.clearAuth();
        this.showLoginForm();
        this.showMessage('Logged out successfully', 'info');
        this.loadPolls();
    }

    /**
     * Load and display polls
     */
    async loadPolls() {
        const container = document.getElementById('polls-container');
        container.innerHTML = '<p class="loading">Loading polls...</p>';

        try {
            const polls = await apiClient.getPolls();
            this.displayPolls(polls);
        } catch (error) {
            container.innerHTML = `<p style="color: #e53e3e;">Error loading polls: ${error.message}</p>`;
        }
    }

    /**
     * Display polls in the UI
     * @param {Array} polls - Array of poll objects
     */
    displayPolls(polls) {
        const container = document.getElementById('polls-container');
        
        if (polls.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">No polls available yet.</p>';
            return;
        }

        container.innerHTML = polls.map(poll => `
            <div class="poll-card" onclick="app.viewPoll(${poll.id})">
                <h3>${this.escapeHtml(poll.question)}</h3>
                <p>Created by User ID: ${poll.owner_id}</p>
                <div class="poll-meta">
                    <span>${new Date(poll.created_at).toLocaleDateString()}</span>
                    <span class="option-count">${poll.options.length} options</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * View a specific poll
     * @param {number} pollId - Poll ID
     */
    async viewPoll(pollId) {
        try {
            this.showMessage('Loading poll...', 'info');
            const poll = await apiClient.getPoll(pollId);
            this.currentPoll = poll;
            this.displayPollDetail(poll);
        } catch (error) {
            this.showMessage(`Error loading poll: ${error.message}`, 'error');
        }
    }

    /**
     * Display poll detail view
     * @param {Object} poll - Poll object
     */
    displayPollDetail(poll) {
        document.querySelector('.poll-section').style.display = 'none';
        document.getElementById('poll-detail').style.display = 'block';
        
        document.getElementById('poll-question').textContent = poll.question;
        
        const optionsContainer = document.getElementById('poll-options');
        optionsContainer.innerHTML = poll.options.map(option => `
            <div class="poll-option" onclick="app.selectOption(${option.id})">
                <input type="radio" name="poll-option" id="option-${option.id}" value="${option.id}">
                <label for="option-${option.id}">${this.escapeHtml(option.text)}</label>
            </div>
        `).join('');

        // Show vote button if user is authenticated
        const voteStatus = document.getElementById('vote-status');
        if (apiClient.isAuthenticated()) {
            voteStatus.innerHTML = `
                <button class="vote-button" onclick="app.castVote()" disabled>
                    Select an option to vote
                </button>
            `;
        } else {
            voteStatus.innerHTML = `
                <p style="text-align: center; color: #e53e3e; padding: 20px;">
                    Please login to vote on this poll
                </p>
            `;
        }

        // Load and display results
        this.loadPollResults(poll.id);
    }

    /**
     * Select a poll option
     * @param {number} optionId - Option ID
     */
    selectOption(optionId) {
        // Remove previous selection
        document.querySelectorAll('.poll-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        const selectedOption = document.querySelector(`input[value="${optionId}"]`).closest('.poll-option');
        selectedOption.classList.add('selected');
        selectedOption.querySelector('input').checked = true;

        this.selectedOption = optionId;

        // Enable vote button
        const voteButton = document.querySelector('.vote-button');
        if (voteButton) {
            voteButton.disabled = false;
            voteButton.textContent = 'Cast Vote';
        }
    }

    /**
     * Cast a vote on the current poll
     */
    async castVote() {
        if (!this.selectedOption) {
            this.showMessage('Please select an option first', 'error');
            return;
        }

        if (!apiClient.isAuthenticated()) {
            this.showMessage('Please login to vote', 'error');
            return;
        }

        try {
            this.showMessage('Casting vote...', 'info');
            await apiClient.castVote(this.currentPoll.id, this.selectedOption);
            this.showMessage('Vote cast successfully!', 'success');
            
            // Reload poll results to show updated counts
            await this.loadPollResults(this.currentPoll.id);
            
            // Disable voting
            const voteButton = document.querySelector('.vote-button');
            if (voteButton) {
                voteButton.disabled = true;
                voteButton.textContent = 'Vote Cast!';
            }
        } catch (error) {
            this.showMessage(`Vote failed: ${error.message}`, 'error');
        }
    }

    /**
     * Load and display poll results
     * @param {number} pollId - Poll ID
     */
    async loadPollResults(pollId) {
        try {
            // Use the enhanced poll results manager
            await pollResultsManager.displayPollResults(pollId, 'poll-results', {
                showPercentages: true,
                showWinner: true,
                showTotalVotes: true,
                showCharts: false,
                compact: false
            });
        } catch (error) {
            console.error('Error loading poll results:', error);
            const resultsContainer = document.getElementById('poll-results');
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Results</h3>
                    <p>${error.message}</p>
                    <button onclick="app.loadPollResults(${pollId})">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Display poll results (legacy method for compatibility)
     * @param {Object} results - Poll results object
     */
    displayPollResults(results) {
        const resultsContainer = document.getElementById('poll-results');
        resultsContainer.style.display = 'block';
        
        resultsContainer.innerHTML = `
            <h3>Poll Results</h3>
            ${results.results.map(result => `
                <div class="result-item">
                    <span class="option-text">${this.escapeHtml(result.text)}</span>
                    <span class="vote-count">${result.vote_count} votes</span>
                </div>
            `).join('')}
        `;
    }

    /**
     * Go back to polls list
     */
    goBack() {
        document.querySelector('.poll-section').style.display = 'block';
        document.getElementById('poll-detail').style.display = 'none';
        this.currentPoll = null;
        this.selectedOption = null;
    }

    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.classList.add('show');

        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PollyApp();
});
