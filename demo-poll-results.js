/**
 * Demo script showing how to use the poll results retrieval system
 * This file demonstrates various ways to retrieve and display poll results
 */

// Example 1: Basic poll results retrieval
async function demoBasicRetrieval() {
    console.log('=== Basic Poll Results Retrieval ===');
    
    try {
        // Get basic poll results
        const results = await pollResultsManager.getPollResults(1);
        console.log('Basic results:', results);
        
        // Get detailed results with statistics
        const detailedResults = await pollResultsManager.getDetailedPollResults(1);
        console.log('Detailed results:', detailedResults);
        
    } catch (error) {
        console.error('Error retrieving poll results:', error.message);
    }
}

// Example 2: Display poll results in different containers
async function demoDisplayResults() {
    console.log('=== Display Poll Results ===');
    
    try {
        // Create a test container if it doesn't exist
        if (!document.getElementById('demo-container')) {
            const container = document.createElement('div');
            container.id = 'demo-container';
            container.style.margin = '20px';
            container.style.padding = '20px';
            container.style.border = '1px solid #ccc';
            document.body.appendChild(container);
        }
        
        // Display with all features
        await pollResultsManager.displayPollResults(1, 'demo-container', {
            showPercentages: true,
            showWinner: true,
            showTotalVotes: true,
            showCharts: true,
            compact: false
        });
        
        console.log('Results displayed in demo-container');
        
    } catch (error) {
        console.error('Error displaying poll results:', error.message);
    }
}

// Example 3: Export functionality
async function demoExport() {
    console.log('=== Export Poll Results ===');
    
    try {
        // Export as CSV string
        const csvData = await pollResultsManager.exportPollResultsToCSV(1);
        console.log('CSV Data:', csvData);
        
        // Download as CSV file
        await pollResultsManager.downloadPollResultsAsCSV(1, 'demo-poll-results.csv');
        console.log('CSV file downloaded');
        
    } catch (error) {
        console.error('Error exporting poll results:', error.message);
    }
}

// Example 4: Cache management
function demoCacheManagement() {
    console.log('=== Cache Management ===');
    
    // Get cache statistics
    const stats = pollResultsManager.getCacheStats();
    console.log('Cache stats:', stats);
    
    // Clear cache
    pollResultsManager.clearCache();
    console.log('Cache cleared');
    
    // Get updated stats
    const newStats = pollResultsManager.getCacheStats();
    console.log('Updated cache stats:', newStats);
}

// Example 5: Error handling
async function demoErrorHandling() {
    console.log('=== Error Handling ===');
    
    try {
        // Try to get results for a non-existent poll
        await pollResultsManager.getPollResults(99999);
    } catch (error) {
        console.log('Expected error for non-existent poll:', error.message);
    }
    
    try {
        // Try to display results in non-existent container
        await pollResultsManager.displayPollResults(1, 'non-existent-container');
    } catch (error) {
        console.log('Expected error for non-existent container:', error.message);
    }
}

// Example 6: Using global utility functions
async function demoGlobalFunctions() {
    console.log('=== Global Utility Functions ===');
    
    try {
        // Use global functions for quick access
        const results = await getPollResults(1);
        console.log('Using global getPollResults:', results);
        
        const detailed = await getDetailedPollResults(1);
        console.log('Using global getDetailedPollResults:', detailed);
        
    } catch (error) {
        console.error('Error using global functions:', error.message);
    }
}

// Example 7: Real-time results monitoring
async function demoRealTimeMonitoring() {
    console.log('=== Real-time Results Monitoring ===');
    
    const pollId = 1;
    const containerId = 'realtime-container';
    
    // Create container for real-time updates
    if (!document.getElementById(containerId)) {
        const container = document.createElement('div');
        container.id = containerId;
        container.style.margin = '20px';
        container.style.padding = '20px';
        container.style.border = '2px solid #4CAF50';
        container.innerHTML = '<h3>Real-time Poll Results</h3>';
        document.body.appendChild(container);
    }
    
    // Display initial results
    await pollResultsManager.displayPollResults(pollId, containerId, {
        showPercentages: true,
        showWinner: true,
        showTotalVotes: true,
        showCharts: true
    });
    
    // Set up periodic refresh (every 10 seconds)
    const refreshInterval = setInterval(async () => {
        try {
            console.log('Refreshing poll results...');
            await pollResultsManager.refreshResults(pollId, containerId);
        } catch (error) {
            console.error('Error refreshing results:', error.message);
        }
    }, 10000);
    
    // Stop refreshing after 2 minutes
    setTimeout(() => {
        clearInterval(refreshInterval);
        console.log('Stopped real-time monitoring');
    }, 120000);
}

// Example 8: Batch operations
async function demoBatchOperations() {
    console.log('=== Batch Operations ===');
    
    const pollIds = [1, 2, 3]; // Example poll IDs
    
    try {
        // Get results for multiple polls
        const results = await Promise.all(
            pollIds.map(id => pollResultsManager.getDetailedPollResults(id))
        );
        
        console.log('Batch results:', results);
        
        // Export all results
        const csvPromises = pollIds.map(id => 
            pollResultsManager.exportPollResultsToCSV(id)
        );
        
        const csvData = await Promise.all(csvPromises);
        console.log('Batch CSV data:', csvData);
        
    } catch (error) {
        console.error('Error in batch operations:', error.message);
    }
}

// Main demo function
async function runAllDemos() {
    console.log('🚀 Starting Poll Results Demo');
    console.log('===============================');
    
    // Run all demos
    await demoBasicRetrieval();
    await demoDisplayResults();
    await demoExport();
    demoCacheManagement();
    await demoErrorHandling();
    await demoGlobalFunctions();
    await demoRealTimeMonitoring();
    await demoBatchOperations();
    
    console.log('===============================');
    console.log('✅ All demos completed!');
}

// Auto-run demos when page loads (if in browser)
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Poll Results Demo loaded. Run runAllDemos() to start.');
        
        // Add demo buttons to the page
        const demoContainer = document.createElement('div');
        demoContainer.style.position = 'fixed';
        demoContainer.style.top = '10px';
        demoContainer.style.right = '10px';
        demoContainer.style.zIndex = '1000';
        demoContainer.style.background = 'white';
        demoContainer.style.padding = '10px';
        demoContainer.style.border = '1px solid #ccc';
        demoContainer.style.borderRadius = '5px';
        
        demoContainer.innerHTML = `
            <h4>Poll Results Demo</h4>
            <button onclick="runAllDemos()">Run All Demos</button>
            <button onclick="demoBasicRetrieval()">Basic Retrieval</button>
            <button onclick="demoDisplayResults()">Display Results</button>
            <button onclick="demoExport()">Export Demo</button>
            <button onclick="demoCacheManagement()">Cache Management</button>
        `;
        
        document.body.appendChild(demoContainer);
    });
}

// Export functions for manual testing
if (typeof window !== 'undefined') {
    window.runAllDemos = runAllDemos;
    window.demoBasicRetrieval = demoBasicRetrieval;
    window.demoDisplayResults = demoDisplayResults;
    window.demoExport = demoExport;
    window.demoCacheManagement = demoCacheManagement;
    window.demoErrorHandling = demoErrorHandling;
    window.demoGlobalFunctions = demoGlobalFunctions;
    window.demoRealTimeMonitoring = demoRealTimeMonitoring;
    window.demoBatchOperations = demoBatchOperations;
}
