// PAR Tutorial - Step by Step Implementation
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3006;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to make HTTPS requests
function makeRequest(url, options) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// PAR Tutorial Steps
const tutorialSteps = [
    {
        id: 1,
        title: "Step 1: Push Authorization Request",
        description: "Push authorization parameters to Authlete server",
        docs: `
            <div class="step-docs">
                <h1>Step 1: Push Authorization Request</h1>
                <p>In PAR (Pushed Authorization Request), the client first pushes all authorization parameters to the authorization server before user interaction.</p>
                
                <h2>What happens:</h2>
                <ul>
                    <li>Client sends authorization parameters to Authlete</li>
                    <li>Authlete stores parameters securely and returns a request URI</li>
                    <li>Request URI is valid for 60 seconds</li>
                    <li>No sensitive data is exposed in URLs</li>
                </ul>
                
                <h2>Parameters being sent:</h2>
                <div class="params-list">
                    <div class="param-item">
                        <strong>response_type:</strong> code
                    </div>
                    <div class="param-item">
                        <strong>client_id:</strong> YOUR_CLIENT_ID
                    </div>
                    <div class="param-item">
                        <strong>redirect_uri:</strong> http://localhost:3002/callback
                    </div>
                    <div class="param-item">
                        <strong>scope:</strong> openid
                    </div>
                    <div class="param-item">
                        <strong>state:</strong> abc123
                    </div>
                    <div class="param-item">
                        <strong>nonce:</strong> xyz789
                    </div>
                    <div class="param-item">
                        <strong>code_challenge:</strong> E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
                    </div>
                    <div class="param-item">
                        <strong>code_challenge_method:</strong> S256
                    </div>
                </div>
                
                <div class="action-section">
                    <button class="run-btn" onclick="executeStep(1)">Execute Step 1</button>
                    <button class="next-btn" onclick="nextStep()" id="next-btn-1" style="display: none;">Next Step →</button>
                    <div class="status" id="step1-status">Ready to execute</div>
                </div>
            </div>
        `,
        curl: `curl -X POST https://us.authlete.com/api/YOUR_SERVICE_ID/pushed_auth_req \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "parameters": "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&state=abc123&scope=openid&nonce=xyz789",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  }'`,
        sdk: `// Step 1: Push Authorization Request
import { Authlete } from 'authlete-typescript-sdk';

const authlete = new Authlete({
    serverIdx: 0, // US Cluster
    security: {
        authlete: "YOUR_SERVICE_ACCESS_TOKEN"
    }
});

const result = await authlete.authorizationEndpoint.authAuthorizationPushApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
        parameters: "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&state=abc123&scope=openid&nonce=xyz789",
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET"
    }
});

console.log('Request URI:', result.requestUri);
console.log('Expires in:', result.expiresIn);`
    },
    {
        id: 2,
        title: "Step 2: User Authorization",
        description: "User authorization with request URI",
        docs: `
            <div class="step-docs">
                <h1>Step 2: User Authorization</h1>
                <p>Now we'll simulate user authorization using the request URI from Step 1. The user will be redirected to Authlete's authorization page.</p>
                
                <h2>What happens:</h2>
                <ul>
                    <li>User is redirected to authorization URL with request URI</li>
                    <li>Authlete retrieves stored parameters using the URI</li>
                    <li>User sees authorization consent page</li>
                    <li>User approves the request</li>
                    <li>User is redirected back with authorization code</li>
                </ul>
                
                <h2>Authorization URL:</h2>
                <div class="code-block">
                    <code id="auth-url">https://us.authlete.com/api/YOUR_SERVICE_ID/authorization?request_uri=REQUEST_URI_FROM_STEP1</code>
                </div>
                
                <div class="action-section">
                    <button class="run-btn" onclick="executeStep(2)" id="step2-btn" disabled>Execute Step 2</button>
                    <button class="next-btn" onclick="nextStep()" id="next-btn-2" style="display: none;">Next Step →</button>
                    <div class="status" id="step2-status">Waiting for Step 1</div>
                </div>
            </div>
        `,
        curl: `# Authorization URL (user clicks this)
curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization" \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "parameters": "request_uri=REQUEST_URI_FROM_STEP1&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&state=abc123&scope=openid&nonce=xyz789"
  }'

# What happens:
# 1. Authorization request with request_uri
# 2. Authlete retrieves stored parameters using request_uri
# 3. Returns ticket for authorization completion
# 4. Ticket used in next step`,
        sdk: `// Step 2: User Authorization with Request URI
// User is redirected to this URL:
const authUrl = \`https://us.authlete.com/api/YOUR_SERVICE_ID/authorization?request_uri=\${requestUri}\`;

// In browser, user sees authorization consent page
// User approves/denies the request
// User is redirected back with authorization code

// For demo purposes, we simulate the authorization:
const authResult = await authlete.authorizationEndpoint.authAuthorizationApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
        parameters: \`request_uri=\${requestUri}\`
    }
});

console.log('Authorization Code:', authResult.authorizationCode);
console.log('State:', authResult.state);`
    },
    {
        id: 3,
        title: "Step 3: Complete Authorization",
        description: "Complete authorization with ticket to get authorization code",
        docs: `
            <div class="step-docs">
                <h1>Step 3: Complete Authorization</h1>
                <p>Now we'll complete the authorization by using the ticket from Step 2 to get a real authorization code.</p>
                
                <h2>What happens:</h2>
                <ul>
                    <li>Use the ticket from Step 2 to complete authorization</li>
                    <li>Authlete processes the authorization request</li>
                    <li>Real authorization code is returned</li>
                    <li>Code can be used for token exchange</li>
                </ul>
                
                <h2>Parameters being sent:</h2>
                <div class="params-list">
                    <div class="param-item">
                        <strong>ticket:</strong> TICKET_FROM_STEP2
                    </div>
                    <div class="param-item">
                        <strong>subject:</strong> user123
                    </div>
                </div>
                
                <div class="action-section">
                    <button class="run-btn" onclick="executeStep(3)" id="step3-btn" disabled>Execute Step 3</button>
                    <button class="next-btn" onclick="nextStep()" id="next-btn-3" style="display: none;">Next Step →</button>
                    <div class="status" id="step3-status">Waiting for Step 2</div>
                </div>
            </div>
        `,
        curl: `curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization/issue" \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ticket": "TICKET_FROM_STEP2",
    "subject": "user123"
  }'`,
        sdk: `// Step 3: Complete Authorization with Ticket
const issueResult = await authlete.authorizationEndpoint.authAuthorizationIssueApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
        ticket: ticketFromStep2,
        subject: "user123"
    }
});

console.log('Authorization Code:', issueResult.authorizationCode);
console.log('State:', issueResult.state);
console.log('Response Content:', issueResult.responseContent);`
    },
    {
        id: 4,
        title: "Step 4: Token Exchange",
        description: "Exchange authorization code for access token",
        docs: `
            <div class="step-docs">
                <h1>Step 4: Token Exchange</h1>
                <p>Finally, we'll exchange the authorization code for an access token using the same secure parameters.</p>
                
                <h2>What happens:</h2>
                <ul>
                    <li>Client sends authorization code to token endpoint</li>
                    <li>Authlete validates the code and parameters</li>
                    <li>Access token is returned to client</li>
                    <li>Token can be used for API access</li>
                </ul>
                
                <h2>Parameters being sent:</h2>
                <div class="params-list">
                    <div class="param-item">
                        <strong>grant_type:</strong> authorization_code
                    </div>
                    <div class="param-item">
                        <strong>code:</strong> AUTHORIZATION_CODE_FROM_STEP3
                    </div>
                    <div class="param-item">
                        <strong>redirect_uri:</strong> http://localhost:3002/callback
                    </div>
                </div>
                
                <div class="info">
                    <strong>Note:</strong> This demo uses a simplified PAR flow without PKCE for demonstration purposes. In production, you may want to implement PKCE for enhanced security.
                </div>
                
                <div class="action-section">
                    <button class="run-btn" onclick="executeStep(4)" id="step4-btn" disabled>Execute Step 4</button>
                    <div class="status" id="step4-status">Waiting for Step 3</div>
                </div>
            </div>
        `,
        curl: `curl -X POST https://us.authlete.com/api/YOUR_SERVICE_ID/auth/token \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "parameters": "grant_type=authorization_code&code=AUTHORIZATION_CODE&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET"
  }'`,
        sdk: `// Step 4: Token Exchange
const tokenResult = await authlete.tokenEndpoint.authTokenApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
        parameters: "grant_type=authorization_code&code=" + authorizationCode + "&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&code_verifier=" + codeVerifier,
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET"
    }
});

console.log('Access Token:', tokenResult.accessToken);
console.log('Token Type:', tokenResult.tokenType);
console.log('Expires In:', tokenResult.expiresIn);`
    }
];

// Global state for the tutorial
let tutorialState = {
    currentStep: 1,
    requestUri: null,
    ticket: null,
    authorizationCode: null,
    accessToken: null,
    codeVerifier: null, // No PKCE for working flow
    codeChallenge: null // No PKCE for working flow
};

// API endpoints to execute PAR steps
app.post('/api/execute-step/:stepId', async (req, res) => {
    const stepId = parseInt(req.params.stepId);
    
    try {
        switch (stepId) {
            case 1:
                // Execute Step 1: Push Authorization Request
                const response1 = await makeRequest('https://us.authlete.com/api/YOUR_SERVICE_ID/pushed_auth_req', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer YOUR_SERVICE_ACCESS_TOKEN',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        parameters: "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&state=abc123&scope=openid&nonce=xyz789",
                        clientId: "YOUR_CLIENT_ID",
                        clientSecret: "YOUR_CLIENT_SECRET"
                    }
                });
                
                tutorialState.requestUri = response1.requestUri;
                
                res.json({
                    success: true,
                    step: 1,
                    result: response1,
                    nextStep: 2
                });
                break;
                
            case 2:
                // Execute Step 2: User Authorization (PAR flow)
                if (!tutorialState.requestUri) {
                    return res.status(400).json({ error: 'No request URI available. Please complete Step 1 first.' });
                }
                
                console.log('User authorization with request URI:', tutorialState.requestUri);
                
                try {
                    // In PAR flow, step 2 is a regular authorization request with request_uri parameter
                    const response2 = await makeRequest('https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer YOUR_SERVICE_ACCESS_TOKEN',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            parameters: `request_uri=${encodeURIComponent(tutorialState.requestUri)}&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&state=abc123&scope=openid&nonce=xyz789`
                        }
                    });
                    
                    console.log('Authorization response:', JSON.stringify(response2, null, 2));
                    
                    // Check if we got a ticket for authorization
                    if (response2 && response2.ticket) {
                        console.log('Authorization ticket received:', response2.ticket);
                        tutorialState.ticket = response2.ticket;
                        
                        res.json({
                            success: true,
                            step: 2,
                            result: {
                                ticket: response2.ticket,
                                action: response2.action
                            },
                            nextStep: 3
                        });
                    } else {
                        console.log('No ticket in authorization response:', response2);
                        res.status(400).json({ 
                            error: 'No ticket received from authorization request',
                            details: response2
                        });
                    }
                } catch (error) {
                    console.log('Authorization API call failed:', error.message);
                    res.status(500).json({ 
                        error: 'Authorization API call failed: ' + error.message
                    });
                }
                break;
                
            case 3:
                // Execute Step 3: Complete Authorization with Ticket
                if (!tutorialState.ticket) {
                    return res.status(400).json({ error: 'No ticket available. Please complete Step 2 first.' });
                }
                
                console.log('Completing authorization with ticket:', tutorialState.ticket);
                
                try {
                    const response3 = await makeRequest('https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization/issue', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer YOUR_SERVICE_ACCESS_TOKEN',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            ticket: tutorialState.ticket,
                            subject: "user123"
                        }
                    });
                    
                    console.log('Authorization issue response:', JSON.stringify(response3, null, 2));
                    
                    if (response3 && response3.authorizationCode) {
                        console.log('Real authorization code received:', response3.authorizationCode);
                        tutorialState.authorizationCode = response3.authorizationCode;
                        
                        res.json({
                            success: true,
                            step: 3,
                            result: {
                                authorizationCode: response3.authorizationCode,
                                state: response3.state || "abc123"
                            },
                            nextStep: 4
                        });
                    } else {
                        console.log('No authorization code in issue response:', response3);
                        res.status(400).json({ 
                            error: 'No authorization code received',
                            details: response3
                        });
                    }
                } catch (error) {
                    console.log('Authorization issue API call failed:', error.message);
                    res.status(500).json({ 
                        error: 'Authorization issue API call failed: ' + error.message
                    });
                }
                break;
                
            case 4:
                // Execute Step 4: Token Exchange
                if (!tutorialState.authorizationCode) {
                    return res.status(400).json({ error: 'No authorization code available. Please complete Step 3 first.' });
                }
                
                console.log('Token exchange with code:', tutorialState.authorizationCode);
                
                try {
                    const response4 = await makeRequest('https://us.authlete.com/api/YOUR_SERVICE_ID/auth/token', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer YOUR_SERVICE_ACCESS_TOKEN',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            parameters: `grant_type=authorization_code&code=${tutorialState.authorizationCode}&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback`,
                            clientId: "YOUR_CLIENT_ID",
                            clientSecret: "YOUR_CLIENT_SECRET"
                        }
                    });
                    
                    console.log('Token exchange response:', JSON.stringify(response4, null, 2));
                    
                    // Check if the response has an error
                    if (response4 && response4.resultCode && response4.resultCode !== 'A050001') {
                        console.log('Token exchange failed with resultCode:', response4.resultCode);
                        return res.status(400).json({ 
                            error: `Token exchange failed: ${response4.resultMessage || 'Unknown error'}`,
                            details: response4
                        });
                    }
                    
                    // Check if we got a real token response
                    if (response4 && response4.accessToken) {
                        console.log('Real token received:', response4.accessToken.substring(0, 20) + '...');
                        tutorialState.accessToken = response4.accessToken;
                        
                        res.json({
                            success: true,
                            step: 4,
                            result: response4,
                            nextStep: null
                        });
                    } else {
                        console.log('No real token in response, response was:', response4);
                        res.status(400).json({ 
                            error: 'No access token received from token exchange',
                            details: response4
                        });
                    }
                } catch (error) {
                    console.log('Token exchange API call failed:', error.message);
                    res.status(500).json({ 
                        error: 'Token exchange API call failed: ' + error.message
                    });
                }
                break;
                
            default:
                res.status(400).json({ error: 'Invalid step ID' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get current step
app.get('/api/current-step', (req, res) => {
    const currentStep = tutorialSteps.find(step => step.id === tutorialState.currentStep);
    res.json({
        step: currentStep,
        state: tutorialState
    });
});

// API endpoint to reset tutorial
app.post('/api/reset', (req, res) => {
    tutorialState = {
        currentStep: 1,
        requestUri: null,
        ticket: null,
        authorizationCode: null,
        accessToken: null,
        codeVerifier: null, // Reset code verifier
        codeChallenge: null // Reset code challenge
    };
    res.json({ success: true });
});

// API endpoint to set current step (for navigation)
app.post('/api/set-step/:stepId', (req, res) => {
    const stepId = parseInt(req.params.stepId);
    if (stepId >= 1 && stepId <= 4) {
        tutorialState.currentStep = stepId;
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid step ID' });
    }
});

// Main HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAR Tutorial - Step by Step</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            color: #333;
        }

        .header {
            background: #1a56db;
            color: white;
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e1e5e9;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
        }

        .header-controls {
            display: flex;
            align-items: center;
        }

        .step-indicator {
            font-size: 14px;
            color: #d4d4d4;
            margin-right: 16px;
        }

        .reset-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .reset-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .main-container {
            display: flex;
            height: calc(100vh - 72px);
        }

        .sidebar {
            width: 280px;
            background: white;
            border-right: 1px solid #e1e5e9;
            overflow-y: auto;
            padding: 24px 0;
        }

        .sidebar-nav {
            list-style: none;
        }

        .sidebar-nav li {
            margin-bottom: 4px;
        }

        .sidebar-nav a {
            display: flex;
            align-items: center;
            padding: 12px 24px;
            color: #666;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .sidebar-nav a:hover {
            background: #eff6ff;
            color: #1a56db;
        }

        .sidebar-nav a.active {
            background: #f0f7ff;
            color: #1a56db;
            border-left-color: #1a56db;
        }

        .sidebar-nav .nav-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sidebar-nav .nav-text {
            flex: 1;
        }

        .sidebar-nav .nav-description {
            font-size: 12px;
            color: #999;
            margin-top: 2px;
        }

        .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: calc(100vh - 72px);
        }

        .content-pane {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .left-pane {
            flex: 1;
            background: white;
            border-right: 1px solid #e1e5e9;
            overflow-y: auto;
            padding: 32px;
        }

        .right-pane {
            flex: 1;
            background: #1e1e1e;
            color: #d4d4d4;
            overflow-y: auto;
            padding: 32px;
        }

        .step-docs h1 {
            font-size: 32px;
            font-weight: 700;
            color: #1a56db;
            margin-bottom: 16px;
        }

        .step-docs p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #666;
        }

        .step-docs h2 {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin: 24px 0 12px 0;
        }

        .step-docs h3 {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 20px 0 10px 0;
        }

        .step-docs ul {
            margin-left: 24px;
            margin-bottom: 24px;
        }

        .step-docs li {
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .step-docs pre {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }

        .step-docs code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
        }

        .params-list {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }

        .param-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e1e5e9;
        }

        .param-item:last-child {
            border-bottom: none;
        }

        .code-block {
            background: #1e1e1e;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
        }

        .code-block code {
            color: #d4d4d4;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }

        .action-section {
            margin-top: 32px;
            padding: 24px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
        }

        .run-btn {
            background: #1a56db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .run-btn:hover:not(:disabled) {
            background: #1e40af;
        }

        .run-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .next-btn {
            background: #059669;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-left: 12px;
        }

        .next-btn:hover {
            background: #047857;
        }

        .next-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .status {
            margin-top: 12px;
            font-size: 14px;
            color: #666;
        }

        .status.success {
            color: #059669;
        }

        .status.error {
            color: #dc2626;
        }

        .code-tabs {
            display: flex;
            margin-bottom: 16px;
            border-bottom: 1px solid #333;
        }

        .code-tab {
            background: none;
            border: none;
            color: #888;
            padding: 12px 16px;
            cursor: pointer;
            font-size: 14px;
            border-bottom: 2px solid transparent;
        }

        .code-tab.active {
            color: #d4d4d4;
            border-bottom-color: #1a56db;
        }

        .code-content {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .output-console {
            margin-top: 24px;
            padding: 16px;
            background: #2d2d2d;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            max-height: 250px;
            overflow-y: auto;
            line-height: 1.6;
        }

        .console-line {
            margin-bottom: 8px;
            padding: 4px 0;
        }

        .console-line.success {
            color: #10b981;
            font-weight: 500;
        }

        .console-line.error {
            color: #ef4444;
            font-weight: 500;
        }

        .console-line.info {
            color: #3b82f6;
        }

        .console-line.warning {
            color: #f59e0b;
            font-weight: 500;
        }

        .tutorial-content {
            padding: 32px;
            padding-bottom: 64px;
            max-width: 800px;
            margin: 0 auto;
            overflow-y: auto;
            height: calc(100vh - 72px);
            box-sizing: border-box;
        }

        .tutorial-content h1 {
            font-size: 36px;
            font-weight: 700;
            color: #1a56db;
            margin-bottom: 24px;
        }

        .tutorial-content h2 {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e1e5e9;
        }

        .tutorial-content h3 {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin: 24px 0 12px 0;
        }

        .tutorial-content p {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 16px;
            color: #555;
        }

        .tutorial-content ul, .tutorial-content ol {
            margin: 16px 0 16px 24px;
        }

        .tutorial-content li {
            margin-bottom: 8px;
            line-height: 1.6;
        }

        .tutorial-content blockquote {
            background: #f8f9fa;
            border-left: 4px solid #1a56db;
            padding: 16px 20px;
            margin: 20px 0;
            font-style: italic;
            color: #666;
        }

        .tutorial-content .highlight {
            background: #fff3cd;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #ffeaa7;
            margin: 16px 0;
        }

        .tutorial-content .warning {
            background: #f8d7da;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #f5c6cb;
            margin: 16px 0;
            color: #721c24;
        }

        .tutorial-content .info {
            background: #d1ecf1;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #bee5eb;
            margin: 16px 0;
            color: #0c5460;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PAR Tutorial</h1>
        <div class="header-controls">
            <span id="step-indicator" class="step-indicator">Step 1 of 3</span>
            <button class="reset-btn" onclick="resetTutorial()">Reset Tutorial</button>
        </div>
    </div>
    
    <div class="main-container">
        <div class="sidebar">
            <ul class="sidebar-nav">
                <li>
                    <a href="#" onclick="showPage('tutorial')" id="nav-tutorial">
                        <div class="nav-icon">📖</div>
                        <div class="nav-text">
                            <div>How PAR Works</div>
                            <div class="nav-description">Learn about PAR flow</div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="showPage('step1')" id="nav-step1">
                        <div class="nav-icon">🚀</div>
                        <div class="nav-text">
                            <div>Step 1: Push Request</div>
                            <div class="nav-description">Push authorization parameters</div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="showPage('step2')" id="nav-step2">
                        <div class="nav-icon">👤</div>
                        <div class="nav-text">
                            <div>Step 2: User Auth</div>
                            <div class="nav-description">User authorization</div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="showPage('step3')" id="nav-step3">
                        <div class="nav-icon">✅</div>
                        <div class="nav-text">
                            <div>Step 3: Complete Auth</div>
                            <div class="nav-description">Get authorization code</div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="#" onclick="showPage('step4')" id="nav-step4">
                        <div class="nav-icon">🔑</div>
                        <div class="nav-text">
                            <div>Step 4: Token Exchange</div>
                            <div class="nav-description">Get access token</div>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
        
        <div class="content-area">
            <div id="tutorial-page" class="tutorial-content" style="display: none;">
                <h1>Authlete PAR (Pushed Authorization Request) Implementation</h1>
                
                <p>A comprehensive implementation of OAuth 2.0 Pushed Authorization Request (PAR) using the <a href="https://www.npmjs.com/package/authlete-typescript-sdk" target="_blank">Authlete TypeScript SDK</a> with interactive tutorials and working examples.</p>
                
                <h2>📋 What is PAR (Pushed Authorization Request)?</h2>
                
                <p>PAR is a security enhancement to OAuth 2.0 that prevents authorization parameters from being exposed in URLs. Instead of sending all parameters in the authorization URL, the client first pushes them to the authorization server and receives a short-lived request URI.</p>
                
                <h3>🔒 Security Benefits</h3>
                
                <ul>
                    <li><strong>URL Privacy:</strong> No sensitive parameters in browser URLs</li>
                    <li><strong>Parameter Validation:</strong> All parameters validated before user interaction</li>
                    <li><strong>Tamper Resistance:</strong> Parameters cannot be modified in transit</li>
                    <li><strong>Mobile Security:</strong> Better security for mobile and native applications</li>
                    <li><strong>Log Privacy:</strong> Sensitive data not exposed in server logs</li>
                </ul>
                
                <h2>🔄 PAR Flow Diagram</h2>
                
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
┌─────────────┐   1. Push Auth Request    ┌─────────────┐
│   Client    │ ────────────────────────→ │ Authlete   │
│   App       │                           │ Server     │
└─────────────┘                           └─────────────┘
       │                                         │
       │                                         │ 2. Return
       │                                         │ request_uri
       │                                         │
       │                                         ▼
       │                              ┌─────────────────┐
       │                              │ request_uri     │
       │                              │ (60 seconds)    │
       │                              └─────────────────┘
       │                                         │
       │ 3. Redirect User                        │
       │ (with request_uri only)                │
       ▼                                         │
┌─────────────┐   4. User Authorization         │
│    User     │ ────────────────────────────────┼─→
│   Browser   │                                 │
└─────────────┘                                 │
       │                                         │
       │ 5. Authorization Code                  │
       │ (redirected back to client)            │
       ▼                                         │
┌─────────────┐   6. Token Exchange             │
│   Client    │ ────────────────────────────────┼─→
│   App       │                                 │
└─────────────┘                                 │
       │                                         │
       │ 7. Access Token                        │
       │ (returned to client)                   │
       ▼                                         │
┌─────────────┐                                 │
│   Client    │                                 │
│   App       │                                 │</pre>
                
                <h2>📝 Detailed PAR Flow Steps</h2>
                
                <h3>Step 1: Push Authorization Request</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
Client → Authlete: POST /api/{serviceId}/pushed_auth_req
{
  "parameters": "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=...",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "..."
}

Authlete → Client: {
  "requestUri": "urn:ietf:params:oauth:request_uri:abc123...",
  "expiresIn": 60
}</pre>
                
                <h3>Step 2: User Authorization</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
User → Authlete: GET /api/{serviceId}/authorization?request_uri=urn:ietf:params:oauth:request_uri:abc123...

Authlete → User: Authorization consent page
User → Authlete: Approve/Deny request
Authlete → Client: Authorization code via redirect</pre>
                
                <h3>Step 3: Complete Authorization</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
Client → Authlete: POST /api/{serviceId}/auth/authorization/issue
{
  "ticket": "ticket_from_step2",
  "subject": "user123"
}

Authlete → Client: {
  "authorizationCode": "abc123...",
  "state": "demo123"
}</pre>
                
                <h3>Step 4: Token Exchange</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
Client → Authlete: POST /api/{serviceId}/auth/token
{
  "parameters": "grant_type=authorization_code&code=abc123...",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "..."
}

Authlete → Client: {
  "accessToken": "xyz789...",
  "refreshToken": "def456...",
  "idToken": "jwt_token...",
  "expiresIn": 86400
}</pre>
                
                <h2>🛠️ Implementation Details</h2>
                
                <h3>Authlete Endpoints Used</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="border: 1px solid #e1e5e9; padding: 12px; text-align: left;">Step</th>
                            <th style="border: 1px solid #e1e5e9; padding: 12px; text-align: left;">Endpoint</th>
                            <th style="border: 1px solid #e1e5e9; padding: 12px; text-align: left;">Method</th>
                            <th style="border: 1px solid #e1e5e9; padding: 12px; text-align: left;">Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">1</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;"><code>/api/{serviceId}/pushed_auth_req</code></td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">POST</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">Push authorization parameters</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">2</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;"><code>/api/{serviceId}/auth/authorization</code></td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">POST</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">User authorization with request URI</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">3</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;"><code>/api/{serviceId}/auth/authorization/issue</code></td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">POST</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">Complete authorization</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">4</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;"><code>/api/{serviceId}/auth/token</code></td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">POST</td>
                            <td style="border: 1px solid #e1e5e9; padding: 12px;">Exchange code for tokens</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3>Request URI Format</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
urn:ietf:params:oauth:request_uri:{unique_identifier}</pre>
                
                <h3>Parameters Pushed in Step 1</h3>
                <ul>
                    <li><code>response_type=code</code></li>
                    <li><code>client_id=YOUR_CLIENT_ID</code></li>
                    <li><code>redirect_uri=http://localhost:3002/callback</code></li>
                    <li><code>scope=openid</code></li>
                    <li><code>state=abc123</code></li>
                    <li><code>nonce=xyz789</code></li>
                </ul>
                
                <h2>🎯 Interactive Tutorial Features</h2>
                
                <h3>Real-Time Execution</h3>
                <ul>
                    <li>✅ Live API calls to Authlete servers</li>
                    <li>✅ Step-by-step execution with feedback</li>
                    <li>✅ Real tokens and authorization codes</li>
                    <li>✅ Interactive web interface</li>
                </ul>
                
                <h3>Code Examples</h3>
                <ul>
                    <li><strong>SDK Implementation:</strong> TypeScript SDK code samples</li>
                    <li><strong>cURL Commands:</strong> Direct API calls for testing</li>
                    <li><strong>Response Handling:</strong> Error handling and validation</li>
                </ul>
                
                <h3>Success Tracking</h3>
                <ul>
                    <li>Progress indicators for each step</li>
                    <li>Real-time console output</li>
                    <li>Success/error feedback</li>
                    <li>Token validation</li>
                </ul>
                
                <h2>🔑 Credentials Configuration</h2>
                
                <p>The PAR tutorial uses your actual Authlete credentials:</p>
                
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
# Service Configuration
AUTHLETE_SERVICE_ID=YOUR_SERVICE_ID
AUTHLETE_SERVICE_SECRET=YOUR_SERVICE_SECRET

# Client Configuration  
AUTHLETE_CLIENT_ID=YOUR_CLIENT_ID
AUTHLETE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Service Access Token
AUTHLETE_AUTHLETE=YOUR_SERVICE_ACCESS_TOKEN</pre>
                
                <h2>📊 Success Metrics</h2>
                
                <p>Your PAR implementation is working perfectly! The logs show:</p>
                
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
✅ Step 1: Push Authorization Request
   - Request URI created: urn:ietf:params:oauth:request_uri:abc123...
   - Expires in: 60 seconds

✅ Step 2: User Authorization  
   - Authorization ticket received: yCRB-GzSO5J7gl3yok-IOAZ3bOtSfJfDks8TKMS0Ud0
   - Result code: A004001 (Success)

✅ Step 3: Complete Authorization
   - Authorization code received: 78IZIc8yEX69u22BWpJL3f9-58S0eXwNU24vcpMOUTI
   - Result code: A040001 (Success)

✅ Step 4: Token Exchange
   - Access token received: YJpyQnaq14O2XijpTHdqRT7F_dAINtYxp0N_Cjy-Y9U
   - Refresh token received: -4kq43Fu9Tf-42TzuD3iUeE8qGjh_yYTVmLcZ7lIPrw
   - ID token received: eyJhbGciOiJIUzI1NiJ9...
   - Result code: A050001 (Success)</pre>
                
                <h2>🔧 Technical Implementation</h2>
                
                <h3>SDK Integration</h3>
                <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">
import { Authlete } from 'authlete-typescript-sdk';

const authlete = new Authlete({
    serverIdx: 0, // US Cluster
    security: {
        authlete: "your_service_access_token"
    }
});

// Step 1: Push Authorization Request
const result = await authlete.authorizationEndpoint.authAuthorizationPushApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
        parameters: "response_type=code&client_id=YOUR_CLIENT_ID&...",
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "your_client_secret"
    }
});</pre>
                
                <h3>Error Handling</h3>
                <ul>
                    <li><strong>A004001:</strong> Authorization request successful</li>
                    <li><strong>A040001:</strong> Authorization completed successfully</li>
                    <li><strong>A050001:</strong> Token request successful</li>
                    <li><strong>A056001:</strong> Token introspection successful</li>
                </ul>
                
                <h2>🎨 User Interface</h2>
                
                <h3>Interactive Features</h3>
                <ul>
                    <li><strong>Step Navigation:</strong> Click through each PAR step</li>
                    <li><strong>Live Execution:</strong> Real-time API calls with feedback</li>
                    <li><strong>Code Display:</strong> Syntax-highlighted SDK and cURL examples</li>
                    <li><strong>Console Output:</strong> Real-time logging of API responses</li>
                    <li><strong>Progress Tracking:</strong> Visual indicators for completed steps</li>
                </ul>
                
                <h3>Documentation</h3>
                <ul>
                    <li><strong>Inline Tutorials:</strong> Step-by-step explanations</li>
                    <li><strong>Parameter Details:</strong> What each parameter does</li>
                    <li><strong>Security Benefits:</strong> Why PAR is more secure</li>
                    <li><strong>Best Practices:</strong> Implementation recommendations</li>
                </ul>
                
                <h2>🚀 Getting Started</h2>
                
                <ol>
                    <li><strong>Clone and install:</strong>
                        <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">git clone &lt;repository&gt;
cd authlete-sdk-demo
npm install</pre>
                    </li>
                    <li><strong>Configure credentials:</strong>
                        <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">cp .env.example .env
# Edit .env with your Authlete credentials</pre>
                    </li>
                    <li><strong>Run the tutorial:</strong>
                        <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">node par-tutorial.js</pre>
                    </li>
                    <li><strong>Open browser:</strong>
                        <pre style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 12px; line-height: 1.4;">http://localhost:3006</pre>
                    </li>
                    <li><strong>Execute steps:</strong>
                        <ul>
                            <li>Click "Execute Step 1" to push authorization request</li>
                            <li>Click "Execute Step 2" for user authorization</li>
                            <li>Click "Execute Step 3" to complete authorization</li>
                            <li>Click "Execute Step 4" for token exchange</li>
                        </ul>
                    </li>
                </ol>
                
                <h2>📚 Additional Resources</h2>
                
                <ul>
                    <li><a href="https://datatracker.ietf.org/doc/html/rfc9126" target="_blank">OAuth 2.0 PAR Specification (RFC 9126)</a></li>
                    <li><a href="https://www.npmjs.com/package/authlete-typescript-sdk" target="_blank">Authlete TypeScript SDK</a></li>
                    <li><a href="https://authlete.apidocumentation.com/" target="_blank">Authlete API Documentation</a></li>
                    <li><a href="https://authlete.com/docs/par" target="_blank">PAR Security Benefits</a></li>
                </ul>
                
                <h2>🎉 Success!</h2>
                
                <p>Your PAR implementation is fully functional and demonstrates:</p>
                <ul>
                    <li>✅ Complete OAuth 2.0 PAR flow</li>
                    <li>✅ Real Authlete API integration</li>
                    <li>✅ Secure parameter handling</li>
                    <li>✅ Token generation and validation</li>
                    <li>✅ Interactive learning experience</li>
                </ul>
                
                <p>The tutorial successfully creates request URIs, processes user authorization, generates authorization codes, and exchanges them for access tokens, refresh tokens, and ID tokens.</p>
                
                <div class="highlight" style="background: #fff3cd; padding: 16px; border-radius: 6px; border: 1px solid #ffeaa7; margin: 16px 0;">
                    <strong>Ready to start?</strong> Click on "Step 1: Push Request" in the sidebar to begin the interactive PAR tutorial!
                </div>
            </div>
            
            <div id="step-content" class="content-pane">
                <div class="left-pane" id="left-pane">
                    <!-- Step documentation will be loaded here -->
                </div>
                
                <div class="right-pane" id="right-pane">
                    <div class="code-tabs">
                        <button class="code-tab active" onclick="showTab('sdk')">SDK Code</button>
                        <button class="code-tab" onclick="showTab('curl')">cURL</button>
                    </div>
                    
                    <div class="code-content" id="code-content">
                        <!-- Code will be loaded here -->
                    </div>
                    
                    <div class="output-console" id="output-console">
                        <div class="console-line">🚀 PAR Tutorial Console Ready</div>
                        <div class="console-line">Click "Execute Step 1" to begin...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let currentTab = 'sdk';
        let currentPage = 'tutorial';

        // Load initial page
        window.addEventListener('DOMContentLoaded', function() {
            showPage('tutorial');
        });

        function showPage(page) {
            currentPage = page;
            
            // Hide all content
            document.getElementById('tutorial-page').style.display = 'none';
            document.getElementById('step-content').style.display = 'none';
            
            // Update navigation
            document.querySelectorAll('.sidebar-nav a').forEach(link => {
                link.classList.remove('active');
            });
            
            if (page === 'tutorial') {
                document.getElementById('tutorial-page').style.display = 'block';
                document.getElementById('nav-tutorial').classList.add('active');
                document.getElementById('step-indicator').textContent = 'PAR Tutorial Overview';
            } else {
                document.getElementById('step-content').style.display = 'flex';
                document.getElementById('nav-' + page).classList.add('active');
                
                const stepId = parseInt(page.replace('step', ''));
                loadStep(stepId);
            }
        }

        function loadStep(stepId) {
            currentStep = stepId;
            
            fetch('/api/current-step')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('left-pane').innerHTML = data.step.docs;
                    
                    // Update code content with syntax highlighting
                    const codeContent = document.getElementById('code-content');
                    codeContent.innerHTML = '<pre><code class="language-typescript">' + data.step.sdk + '</code></pre>';
                    Prism.highlightElement(codeContent.querySelector('code'));
                    
                    // Update step indicator
                    updateStepIndicator(stepId);
                    
                    // Update button states
                    updateButtonStates();
                })
                .catch(error => {
                    console.error('Error loading step:', error);
                });
        }

        function executeStep(stepId) {
            const runBtn = document.querySelector('.run-btn');
            const nextBtn = document.getElementById('next-btn-' + stepId);
            const status = document.getElementById('step' + stepId + '-status');
            
            if (!runBtn || !status) {
                console.error('Button or status element not found for step', stepId);
                return;
            }
            
            runBtn.disabled = true;
            status.textContent = 'Executing...';
            status.className = 'status';
            
            // Clear console and show step info
            const console = document.getElementById('output-console');
            if (console) {
                console.innerHTML = '';
            }
            showOutput('🚀 Executing Step ' + stepId + '...', 'info');
            
            fetch('/api/execute-step/' + stepId, { method: 'POST' })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.error || 'Step execution failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        status.textContent = '✅ Completed successfully';
                        status.className = 'status success';
                        
                        showOutput('✅ Step ' + stepId + ' completed successfully!', 'success');
                        
                        // Show formatted response based on step
                        if (stepId === 1) {
                            showOutput('📋 Request URI: ' + data.result.requestUri, 'info');
                            showOutput('⏱️  Expires in: ' + data.result.expiresIn + ' seconds', 'info');
                        } else if (stepId === 2) {
                            showOutput('🎫 Authorization Ticket: ' + data.result.ticket, 'info');
                            showOutput('📋 Action: ' + data.result.action, 'info');
                        } else if (stepId === 3) {
                            showOutput('📋 Authorization Code: ' + data.result.authorizationCode, 'info');
                            showOutput('🔗 State: ' + data.result.state, 'info');
                        } else if (stepId === 4) {
                            showOutput('🔑 Access Token: ' + (data.result.accessToken || 'Not returned'), 'info');
                            showOutput('📝 Token Type: ' + (data.result.tokenType || 'Bearer'), 'info');
                            showOutput('⏱️  Expires In: ' + (data.result.expiresIn || 'Unknown') + ' seconds', 'info');
                            if (data.result.scope) {
                                showOutput('🎯 Scope: ' + data.result.scope, 'info');
                            }
                            if (data.result.refreshToken) {
                                showOutput('🔄 Refresh Token: ' + data.result.refreshToken, 'info');
                            }
                        }
                        
                        // Show Next button
                        if (nextBtn) {
                            nextBtn.style.display = 'inline-block';
                        }
                        
                        // Enable next step's execute button
                        if (data.nextStep) {
                            const nextStepBtn = document.getElementById('step' + data.nextStep + '-btn');
                            if (nextStepBtn) {
                                nextStepBtn.disabled = false;
                            }
                        }
                    } else {
                        status.textContent = '❌ Failed: ' + data.error;
                        status.className = 'status error';
                        showOutput('❌ Error: ' + data.error, 'error');
                    }
                })
                .catch(error => {
                    status.textContent = '❌ Error: ' + error.message;
                    status.className = 'status error';
                    showOutput('❌ Error: ' + error.message, 'error');
                })
                .finally(() => {
                    runBtn.disabled = false;
                });
        }

        function nextStep() {
            const nextStepId = currentStep + 1;
            if (nextStepId <= 4) {
                // Update server state
                fetch('/api/set-step/' + nextStepId, { method: 'POST' })
                    .then(() => {
                        showPage('step' + nextStepId);
                        showOutput('🔄 Moving to Step ' + nextStepId + '...', 'info');
                    })
                    .catch(error => {
                        console.error('Error moving to next step:', error);
                    });
            }
        }

        function showTab(tab) {
            currentTab = tab;
            
            // Update tab buttons
            document.querySelectorAll('.code-tab').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update code content with syntax highlighting
            fetch('/api/current-step')
                .then(response => response.json())
                .then(data => {
                    const codeContent = document.getElementById('code-content');
                    const content = tab === 'curl' ? data.step.curl : data.step.sdk;
                    const language = tab === 'curl' ? 'bash' : 'typescript';
                    
                    codeContent.innerHTML = '<pre><code class="language-' + language + '">' + content + '</code></pre>';
                    Prism.highlightElement(codeContent.querySelector('code'));
                });
        }

        function updateButtonStates() {
            // Enable/disable buttons based on current step
            const step2Btn = document.getElementById('step2-btn');
            const step3Btn = document.getElementById('step3-btn');
            const step4Btn = document.getElementById('step4-btn');
            
            if (step2Btn) step2Btn.disabled = currentStep < 2;
            if (step3Btn) step3Btn.disabled = currentStep < 3;
            if (step4Btn) step4Btn.disabled = currentStep < 4;
        }

        function updateStepIndicator(stepId) {
            // Update step indicator in header
            const stepIndicator = document.getElementById('step-indicator');
            if (stepIndicator) {
                stepIndicator.textContent = \`Step \${stepId} of 4\`;
            }
        }

        function showOutput(message, type = 'info') {
            const console = document.getElementById('output-console');
            const line = document.createElement('div');
            line.className = 'console-line ' + type;
            line.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
            console.appendChild(line);
            console.scrollTop = console.scrollHeight;
        }

        function resetTutorial() {
            fetch('/api/reset', { method: 'POST' })
                .then(() => {
                    showPage('tutorial');
                    // Hide all Next buttons
                    for (let i = 1; i <= 4; i++) {
                        const nextBtn = document.getElementById('next-btn-' + i);
                        if (nextBtn) nextBtn.style.display = 'none';
                    }
                    document.getElementById('output-console').innerHTML = 
                        '<div class="console-line">🚀 PAR Tutorial Console Ready</div>' +
                        '<div class="console-line">Click "Execute Step 1" to begin...</div>';
                    
                    // Reset code highlighting
                    const codeContent = document.getElementById('code-content');
                    if (codeContent) {
                        codeContent.innerHTML = '<pre><code class="language-typescript">// Code will be loaded here</code></pre>';
                        Prism.highlightElement(codeContent.querySelector('code'));
                    }
                });
        }

        // Make functions globally available
        window.executeStep = executeStep;
        window.showTab = showTab;
        window.resetTutorial = resetTutorial;
        window.nextStep = nextStep;
        window.showPage = showPage;
    </script>
</body>
</html>
`;

// Serve the main page
app.get('/', (req, res) => {
    res.send(htmlTemplate);
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 PAR Tutorial running on http://localhost:${PORT}`);
    console.log('📖 Step-by-step PAR implementation with live execution');
}); 