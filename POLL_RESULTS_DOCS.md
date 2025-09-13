# Poll Results Retrieval System

This document describes the comprehensive poll results retrieval system implemented for the Polly Poll Voting System.

## Overview

The poll results system provides multiple ways to retrieve, display, and export poll results with advanced features like caching, statistics, and data export capabilities.

## Files

- `poll-results.js` - Core poll results management system
- `poll-results-viewer.html` - Standalone poll results viewer
- `styles.css` - Enhanced styling for poll results display
- `api-client.js` - API client with poll results methods

## Core Functions

### 1. Basic Poll Results Retrieval

```javascript
// Simple poll results retrieval
const results = await pollResultsManager.getPollResults(pollId);

// Force refresh from server (bypass cache)
const freshResults = await pollResultsManager.getPollResults(pollId, true);
```

### 2. Detailed Poll Results with Statistics

```javascript
// Get enhanced results with percentages and winner detection
const detailedResults = await pollResultsManager.getDetailedPollResults(pollId);

// Results include:
// - total_votes: Total number of votes cast
// - results: Array with enhanced data
//   - percentage: Vote percentage for each option
//   - is_winner: Boolean indicating if option is winning
```

### 3. Display Poll Results

```javascript
// Display results in a specific container
await pollResultsManager.displayPollResults(pollId, 'container-id', {
    showPercentages: true,
    showWinner: true,
    showTotalVotes: true,
    showCharts: false,
    compact: false
});
```

### 4. Export Functionality

```javascript
// Export as CSV
await pollResultsManager.downloadPollResultsAsCSV(pollId, 'custom-filename.csv');

// Get CSV data as string
const csvData = await pollResultsManager.exportPollResultsToCSV(pollId);
```

## API Reference

### PollResultsManager Class

#### Constructor
```javascript
const manager = new PollResultsManager(apiClient);
```

#### Methods

##### `getPollResults(pollId, forceRefresh = false)`
Retrieves poll results with optional caching.

**Parameters:**
- `pollId` (number): ID of the poll
- `forceRefresh` (boolean): Skip cache and fetch fresh data

**Returns:** Promise<Object> - Poll results object

##### `getDetailedPollResults(pollId)`
Gets poll results with enhanced statistics.

**Parameters:**
- `pollId` (number): ID of the poll

**Returns:** Promise<Object> - Enhanced poll results with statistics

##### `displayPollResults(pollId, containerId, options = {})`
Displays poll results in a specified HTML container.

**Parameters:**
- `pollId` (number): ID of the poll
- `containerId` (string): HTML element ID
- `options` (Object): Display options
  - `showPercentages` (boolean): Show vote percentages
  - `showWinner` (boolean): Highlight winning option
  - `showTotalVotes` (boolean): Display total vote count
  - `showCharts` (boolean): Show progress bars
  - `compact` (boolean): Use compact display mode

##### `exportPollResultsToCSV(pollId)`
Exports poll results as CSV string.

**Parameters:**
- `pollId` (number): ID of the poll

**Returns:** Promise<string> - CSV formatted data

##### `downloadPollResultsAsCSV(pollId, filename = null)`
Downloads poll results as CSV file.

**Parameters:**
- `pollId` (number): ID of the poll
- `filename` (string, optional): Custom filename

##### `refreshResults(pollId, containerId)`
Refreshes poll results for a specific poll.

**Parameters:**
- `pollId` (number): ID of the poll
- `containerId` (string): HTML element ID

##### `clearCache()`
Clears all cached poll results.

##### `getCacheStats()`
Gets cache statistics.

**Returns:** Object with cache information

## Global Utility Functions

For convenience, several global functions are available:

```javascript
// Quick access functions
const results = await getPollResults(pollId);
const detailed = await getDetailedPollResults(pollId);
await displayPollResults(pollId, 'container-id', options);
await exportPollResults(pollId);
```

## Usage Examples

### 1. Basic Usage

```javascript
// Get poll results
const results = await pollResultsManager.getPollResults(1);
console.log(results);

// Display in container
await pollResultsManager.displayPollResults(1, 'results-container');
```

### 2. Advanced Display Options

```javascript
// Display with all features enabled
await pollResultsManager.displayPollResults(1, 'results-container', {
    showPercentages: true,
    showWinner: true,
    showTotalVotes: true,
    showCharts: true,
    compact: false
});
```

### 3. Export and Download

```javascript
// Download as CSV
await pollResultsManager.downloadPollResultsAsCSV(1, 'poll-1-results.csv');

// Get CSV data
const csvData = await pollResultsManager.exportPollResultsToCSV(1);
console.log(csvData);
```

### 4. Cache Management

```javascript
// Check cache stats
const stats = pollResultsManager.getCacheStats();
console.log(`Cached polls: ${stats.size}`);

// Clear cache
pollResultsManager.clearCache();
```

## Standalone Viewer

The `poll-results-viewer.html` provides a complete interface for viewing poll results:

### Features
- Enter poll ID to view results
- Browse all available polls
- Export results as CSV
- Toggle chart display
- Cache management
- Real-time statistics

### Usage
1. Open `poll-results-viewer.html` in a web browser
2. Enter a poll ID or browse available polls
3. View detailed results with statistics
4. Export data or manage cache as needed

## Error Handling

The system includes comprehensive error handling:

```javascript
try {
    const results = await pollResultsManager.getPollResults(pollId);
} catch (error) {
    console.error('Failed to retrieve poll results:', error.message);
    // Handle error appropriately
}
```

## Caching System

- **Automatic Caching**: Results are cached for 30 seconds by default
- **Cache Invalidation**: Manual refresh or timeout-based invalidation
- **Memory Efficient**: Automatic cleanup of expired entries
- **Statistics**: Track cache usage and performance

## Styling

The system includes comprehensive CSS styling for:
- Result items with hover effects
- Winner highlighting
- Progress bars for visual representation
- Responsive design for mobile devices
- Error states and loading indicators

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- Fetch API for HTTP requests
- CSS Grid and Flexbox for layout

## Security Features

- XSS protection with HTML escaping
- Input validation and sanitization
- Secure API communication
- No sensitive data exposure in client-side code
