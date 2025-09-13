# Polly Client-Side Voting Interface

This directory contains the client-side implementation for the Polly Poll Voting System. The client provides a modern, responsive web interface for users to view polls and cast votes.

## Files

- `index.html` - Main HTML structure with poll voting interface
- `styles.css` - Modern CSS styling with responsive design
- `api-client.js` - API client for communicating with the FastAPI backend
- `app.js` - Main application logic and vote casting functionality

## Features

### Vote Casting Functionality
The main vote casting function is implemented in `app.js`:

```javascript
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
```

### API Integration
The `api-client.js` file provides a clean interface to the FastAPI backend:

```javascript
async castVote(pollId, optionId) {
    if (!this.token) {
        throw new Error('Authentication required to vote');
    }

    return await this.makeRequest(`/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId }),
    });
}
```

## Usage

1. **Start the FastAPI backend** (if not already running):
   ```bash
   uvicorn main:app --reload
   ```

2. **Open the client**:
   - Open `index.html` in a web browser
   - Or serve it using a local web server

3. **Vote on polls**:
   - Register or login to your account
   - Browse available polls
   - Click on a poll to view details
   - Select an option and click "Cast Vote"
   - View real-time results

## Key Features

- **Authentication**: JWT-based authentication with login/register
- **Vote Casting**: Secure vote casting with validation
- **Real-time Results**: Live poll results with vote counts
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Modern UI**: Clean, modern interface with smooth animations

## Security Features

- XSS protection with HTML escaping
- JWT token storage in localStorage
- Input validation and sanitization
- Secure API communication

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- Fetch API for HTTP requests
- CSS Grid and Flexbox for layout
