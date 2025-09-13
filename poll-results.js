/**
 * Poll Results Retrieval and Display System
 * Dedicated functions for retrieving and displaying poll results
 */

class PollResultsManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.cache = new Map(); // Cache for poll results
        this.cacheTimeout = 30000; // 30 seconds cache timeout
    }

    /**
     * Retrieve poll results with caching and error handling
     * @param {number} pollId - Poll ID
     * @param {boolean} forceRefresh - Force refresh from server
     * @returns {Promise<Object>} Poll results object
     */
    async getPollResults(pollId, forceRefresh = false) {
        try {
            // Check cache first (unless force refresh)
            if (!forceRefresh && this.cache.has(pollId)) {
                const cached = this.cache.get(pollId);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log(`Using cached results for poll ${pollId}`);
                    return cached.data;
                }
            }

            console.log(`Fetching fresh results for poll ${pollId}`);
            const results = await this.apiClient.getPollResults(pollId);
            
            // Cache the results
            this.cache.set(pollId, {
                data: results,
                timestamp: Date.now()
            });

            return results;
        } catch (error) {
            console.error(`Error retrieving poll results for poll ${pollId}:`, error);
            throw new Error(`Failed to retrieve poll results: ${error.message}`);
        }
    }

    /**
     * Get poll results with detailed statistics
     * @param {number} pollId - Poll ID
     * @returns {Promise<Object>} Enhanced poll results with statistics
     */
    async getDetailedPollResults(pollId) {
        try {
            const results = await this.getPollResults(pollId);
            const enhancedResults = this.enhanceResultsWithStats(results);
            return enhancedResults;
        } catch (error) {
            console.error(`Error getting detailed poll results for poll ${pollId}:`, error);
            throw error;
        }
    }

    /**
     * Enhance poll results with additional statistics
     * @param {Object} results - Basic poll results
     * @returns {Object} Enhanced results with statistics
     */
    enhanceResultsWithStats(results) {
        const totalVotes = results.results.reduce((sum, result) => sum + result.vote_count, 0);
        
        const enhancedResults = {
            ...results,
            total_votes: totalVotes,
            results: results.results.map(result => ({
                ...result,
                percentage: totalVotes > 0 ? Math.round((result.vote_count / totalVotes) * 100) : 0,
                is_winner: result.vote_count === Math.max(...results.results.map(r => r.vote_count)) && result.vote_count > 0
            }))
        };

        return enhancedResults;
    }

    /**
     * Display poll results in a specified container
     * @param {number} pollId - Poll ID
     * @param {string} containerId - HTML element ID to display results
     * @param {Object} options - Display options
     */
    async displayPollResults(pollId, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }

        try {
            // Show loading state
            container.innerHTML = '<div class="loading">Loading poll results...</div>';

            const results = await this.getDetailedPollResults(pollId);
            this.renderResults(container, results, options);
        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Results</h3>
                    <p>${error.message}</p>
                    <button onclick="pollResultsManager.displayPollResults(${pollId}, '${containerId}', ${JSON.stringify(options)})">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Render poll results in the container
     * @param {HTMLElement} container - Container element
     * @param {Object} results - Poll results
     * @param {Object} options - Display options
     */
    renderResults(container, results, options = {}) {
        const {
            showPercentages = true,
            showWinner = true,
            showTotalVotes = true,
            showCharts = false,
            compact = false
        } = options;

        const totalVotes = results.total_votes;
        const hasVotes = totalVotes > 0;

        let html = `
            <div class="poll-results-container ${compact ? 'compact' : ''}">
                <div class="poll-results-header">
                    <h3>${this.escapeHtml(results.question)}</h3>
                    ${showTotalVotes ? `<p class="total-votes">Total Votes: <strong>${totalVotes}</strong></p>` : ''}
                </div>
                <div class="poll-results-list">
        `;

        if (!hasVotes) {
            html += `
                <div class="no-votes">
                    <p>No votes have been cast yet.</p>
                </div>
            `;
        } else {
            results.results.forEach((result, index) => {
                const percentage = result.percentage;
                const isWinner = result.is_winner && showWinner;
                
                html += `
                    <div class="result-item ${isWinner ? 'winner' : ''}" data-option-id="${result.option_id}">
                        <div class="result-content">
                            <div class="option-text">${this.escapeHtml(result.text)}</div>
                            <div class="vote-info">
                                <span class="vote-count">${result.vote_count} vote${result.vote_count !== 1 ? 's' : ''}</span>
                                ${showPercentages ? `<span class="percentage">${percentage}%</span>` : ''}
                            </div>
                        </div>
                        ${showCharts ? this.renderProgressBar(percentage) : ''}
                        ${isWinner ? '<div class="winner-badge">🏆 Winner</div>' : ''}
                    </div>
                `;
            });
        }

        html += `
                </div>
                <div class="poll-results-footer">
                    <button onclick="pollResultsManager.refreshResults(${results.poll_id}, '${container.id}')" class="refresh-btn">
                        🔄 Refresh Results
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render a progress bar for vote percentages
     * @param {number} percentage - Percentage value
     * @returns {string} HTML for progress bar
     */
    renderProgressBar(percentage) {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }

    /**
     * Refresh poll results for a specific poll
     * @param {number} pollId - Poll ID
     * @param {string} containerId - Container ID
     */
    async refreshResults(pollId, containerId) {
        // Clear cache for this poll
        this.cache.delete(pollId);
        // Reload results
        await this.displayPollResults(pollId, containerId);
    }

    /**
     * Get poll results as JSON data
     * @param {number} pollId - Poll ID
     * @returns {Promise<Object>} Poll results as JSON
     */
    async getPollResultsAsJSON(pollId) {
        try {
            const results = await this.getDetailedPollResults(pollId);
            return {
                success: true,
                data: results,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Export poll results to CSV format
     * @param {number} pollId - Poll ID
     * @returns {Promise<string>} CSV formatted results
     */
    async exportPollResultsToCSV(pollId) {
        try {
            const results = await this.getDetailedPollResults(pollId);
            
            let csv = `Poll Question,${results.question}\n`;
            csv += `Total Votes,${results.total_votes}\n`;
            csv += `Option Text,Vote Count,Percentage\n`;
            
            results.results.forEach(result => {
                csv += `"${result.text}",${result.vote_count},${result.percentage}%\n`;
            });
            
            return csv;
        } catch (error) {
            throw new Error(`Failed to export results: ${error.message}`);
        }
    }

    /**
     * Download poll results as CSV file
     * @param {number} pollId - Poll ID
     * @param {string} filename - Optional filename
     */
    async downloadPollResultsAsCSV(pollId, filename = null) {
        try {
            const csv = await this.exportPollResultsToCSV(pollId);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `poll-${pollId}-results-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            throw error;
        }
    }

    /**
     * Clear all cached results
     */
    clearCache() {
        this.cache.clear();
        console.log('Poll results cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
            timeout: this.cacheTimeout
        };
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

// Create global poll results manager instance
window.pollResultsManager = new PollResultsManager(window.apiClient);

// Utility functions for easy access
window.getPollResults = (pollId) => pollResultsManager.getPollResults(pollId);
window.getDetailedPollResults = (pollId) => pollResultsManager.getDetailedPollResults(pollId);
window.displayPollResults = (pollId, containerId, options) => pollResultsManager.displayPollResults(pollId, containerId, options);
window.exportPollResults = (pollId) => pollResultsManager.downloadPollResultsAsCSV(pollId);
