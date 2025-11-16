const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = isUser 
        ? `<strong>You:</strong> ${escapeHtml(content)}`
        : `<strong>Assistant:</strong> ${escapeHtml(content)}`;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simple HTML escaping
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show loading indicator
function showLoading() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'loading-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<strong>Assistant:</strong> Thinking<span class="loading"></span>';
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove loading indicator
function removeLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Send message to server
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    sendButton.disabled = true;
    showLoading();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        removeLoading();
        
        // Read response text once (can only read body once)
        const text = await response.text();
        
        // Check if response is ok
        if (!response.ok) {
            addMessage(`Error: Server returned ${response.status}. ${text || 'Unknown error'}`);
            return;
        }
        
        // Check if response has content
        if (!text || text.trim() === '') {
            addMessage(`Error: Server returned empty response. Is the server running?`);
            return;
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            addMessage(`Error: Server returned non-JSON response: ${text.substring(0, 100)}`);
            return;
        }
        
        // Parse JSON response
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            addMessage(`Error: Invalid JSON response from server: ${text.substring(0, 200)}`);
            return;
        }
        
        if (data.error) {
            addMessage(`Error: ${data.error}`);
        } else if (data.response) {
            addMessage(data.response);
        } else {
            addMessage(`Error: Unexpected response format: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        removeLoading();
        if (error.message.includes('fetch')) {
            addMessage(`Error: Failed to connect to server. Make sure the server is running on http://localhost:3000`);
        } else {
            addMessage(`Error: ${error.message}`);
        }
    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendButton.disabled) {
        sendMessage();
    }
});

// Focus input on load
userInput.focus();

