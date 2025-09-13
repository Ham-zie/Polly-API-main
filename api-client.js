/**
 * API Client for Polly Poll Voting System
 * Handles all API communication with the FastAPI backend
 */

class PollyAPIClient {
    constructor(baseURL = 'http://127.0.0.1:8000') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('polly_token');
        this.currentUser = localStorage.getItem('polly_user');
    }

    /**
     * Set authentication token
     * @param {string} token - JWT token
     * @param {string} username - Username
     */
    setAuth(token, username) {
        this.token = token;
        this.currentUser = username;
        localStorage.setItem('polly_token', token);
        localStorage.setItem('polly_user', username);
    }

    /**
     * Clear authentication
     */
    clearAuth() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('polly_token');
        localStorage.removeItem('polly_user');
    }

    /**
     * Get authentication headers
     * @returns {Object} Headers object with authorization
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Make HTTP request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} Response data or error
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} User data
     */
    async register(username, password) {
        return await this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Token data
     */
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/login`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get all polls
     * @param {number} skip - Number of polls to skip
     * @param {number} limit - Maximum number of polls to return
     * @returns {Promise<Array>} Array of polls
     */
    async getPolls(skip = 0, limit = 10) {
        return await this.makeRequest(`/polls?skip=${skip}&limit=${limit}`);
    }

    /**
     * Get a specific poll by ID
     * @param {number} pollId - Poll ID
     * @returns {Promise<Object>} Poll data
     */
    async getPoll(pollId) {
        return await this.makeRequest(`/polls/${pollId}`);
    }

    /**
     * Cast a vote on a poll
     * @param {number} pollId - Poll ID
     * @param {number} optionId - Option ID to vote for
     * @returns {Promise<Object>} Vote data
     */
    async castVote(pollId, optionId) {
        if (!this.token) {
            throw new Error('Authentication required to vote');
        }

        return await this.makeRequest(`/polls/${pollId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ option_id: optionId }),
        });
    }

    /**
     * Get poll results
     * @param {number} pollId - Poll ID
     * @returns {Promise<Object>} Poll results with vote counts
     */
    async getPollResults(pollId) {
        return await this.makeRequest(`/polls/${pollId}/results`);
    }

    /**
     * Create a new poll
     * @param {string} question - Poll question
     * @param {Array<string>} options - Array of option texts
     * @returns {Promise<Object>} Created poll data
     */
    async createPoll(question, options) {
        if (!this.token) {
            throw new Error('Authentication required to create polls');
        }

        return await this.makeRequest('/polls', {
            method: 'POST',
            body: JSON.stringify({ question, options }),
        });
    }

    /**
     * Delete a poll
     * @param {number} pollId - Poll ID
     * @returns {Promise<void>}
     */
    async deletePoll(pollId) {
        if (!this.token) {
            throw new Error('Authentication required to delete polls');
        }

        await this.makeRequest(`/polls/${pollId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get current user
     * @returns {string|null} Current username or null
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Create global API client instance
window.apiClient = new PollyAPIClient();
