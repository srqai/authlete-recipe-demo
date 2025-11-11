(function(){
	'use strict';

	// Data injected by server
	const steps = window.__ONBOARDING_STEPS__ || [];
	let userCredentials = window.__USER_CREDENTIALS__ || {
		serviceId: null,
		serviceSecret: null,
		clientId: null,
		clientSecret: null
	};

	let currentStep = 1;
	let demoState = {
		ticket: null,
		authorizationCode: null,
		accessToken: null
	};

	const demoOrder = ['authorization','consent','token','introspection'];

	function getNextDemoStep(step) {
		const idx = demoOrder.indexOf(step);
		if (idx === -1 || idx === demoOrder.length - 1) return null;
		return demoOrder[idx + 1];
	}

	function showNextButton(show) {
		const btn = document.getElementById('next-step-btn');
		if (!btn) return;
		btn.style.display = 'inline-flex';
		btn.disabled = !show;
	}

	function showBackButton(show) {
		const btn = document.getElementById('back-step-btn');
		if (!btn) return;
		btn.style.display = 'inline-flex';
		btn.disabled = !show;
	}

	function getPreviousDemoStep(step) {
		const idx = demoOrder.indexOf(step);
		if (idx <= 0) return null;
		return demoOrder[idx - 1];
	}

	function showStep(stepId) {
		// Update navigation
		document.querySelectorAll('.nav-item').forEach(item => {
			item.classList.remove('active');
		});
		const nav = document.getElementById('nav-' + stepId);
		if (nav) nav.classList.add('active');

		// Find step
		const step = steps.find(s => s.id === stepId);
		if (!step) return;

		// Update header
		const titleEl = document.getElementById('main-title');
		const subEl = document.getElementById('main-subtitle');
		if (titleEl) titleEl.textContent = step.title;
		if (subEl) subEl.textContent = step.description;

		// Check if this is the demo step (step 5)
		const isDemoStep = stepId === 5;
		const isFullWidthStep = stepId >= 1 && stepId <= 4; // Welcome, Service, Client, Project Setup

		// Clear any active endpoint navigation when not on demo step
		if (!isDemoStep) {
			document.querySelectorAll('.nav-endpoint').forEach(endpoint => {
				endpoint.classList.remove('active');
			});
		}

		// Update content
		const content = document.getElementById('content-area');
		if (content) {
			content.innerHTML = `
				<div class="docs-wrapper">
					<div class="docs-grid ${isFullWidthStep ? 'full-width' : ''}" id="docs-grid">
						<div class="docs-content">
							${step.content}
						</div>
						
						<div class="code-column" id="code-column" style="display: ${isDemoStep ? 'block' : 'none'};">
							<div class="code-card">
								<div class="code-header">
									<div class="code-path" id="code-path">GET /api/{serviceId}/service/get</div>
									<div class="code-actions">
										<select id="code-view-selector" class="code-view-dropdown" onchange="switchCodeView()">
											<option value="sdk">SDK Code</option>
											<option value="curl">cURL Commands</option>
										</select>
										<button class="copy-btn" onclick="copyCode()">Copy</button>
									</div>
								</div>
								
								<div class="code-editor">
									<div class="code-editor-content">
										<pre class="code-block language-typescript" id="code-block"><code class="language-typescript">${step.code}</code></pre>
										<pre class="code-block language-bash" id="curl-block" style="display: none;"><code class="language-bash"># Step 1: Authorization Request
curl -X POST https://api.authlete.com/api/auth/authorization \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "715948317",
    "parameters": "response_type=code&client_id=3737820648&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&scope=read&state=demo123"
  }'</code></pre>
									</div>
								</div>
								
								<div class="run-section">
									<button class="run-btn" onclick="runCurrentDemo()" id="run-demo-btn" disabled>Run Sample</button>
								</div>
								
								<!-- OUTPUT CONSOLE - ALWAYS PRESENT -->
								<div class="output-section" style="display: block !important;">
									<div class="output-label">Output Console</div>
									<div class="output-console" id="output-console" style="display: block !important;">
										<div class="output-placeholder">Output will appear here when you run the sample...</div>
									</div>
									<div class="output-actions">
										<button class="output-console-btn" onclick="clearOutput()">Clear</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		}

		currentStep = stepId;
		updateUIState();
		showNextButton(false);
		
		// Initialize Prism.js for the new content
		if (window.Prism) {
			const codeElement = document.querySelector('#code-block code');
			if (codeElement) {
				Prism.highlightElement(codeElement);
			}
		}
	}

	function nextStep() {
		if (currentStep < steps.length) {
			showStep(currentStep + 1);
		}
	}

	function updateUIState() {
		if (currentStep === 3) {
			const createClientBtn = document.getElementById('create-client-btn');
			const formNote = document.querySelector('.form-note');
			if (createClientBtn) {
				createClientBtn.disabled = false;
				if (formNote) formNote.style.display = 'none';
			}
		}

		if (currentStep === 4) {
			updateCredentialsDisplay();
			const demoBtn = document.getElementById('demo-ready-btn');
			if (demoBtn) demoBtn.disabled = false;
		}

		if (currentStep === 5) {
			const authBtn = document.getElementById('auth-btn');
			if (authBtn) authBtn.disabled = false;
		}
	}

	function updateCredentialsDisplay() {
		const sId = document.getElementById('final-service-id');
		const sSec = document.getElementById('final-service-secret');
		const cId = document.getElementById('final-client-id');
		const cSec = document.getElementById('final-client-secret');
		if (sId) sId.textContent = userCredentials.serviceId || 'Create service first';
		if (sSec) sSec.textContent = userCredentials.serviceSecret || 'Create service first';
		if (cId) cId.textContent = userCredentials.clientId || 'Create client first';
		if (cSec) cSec.textContent = userCredentials.clientSecret || 'Create client first';
	}

	async function createService(event) {
		if (event) event.preventDefault();
		try {
			// Simulate service creation delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Just move to next step without creating anything
			const nav2 = document.getElementById('nav-2'); 
			if (nav2) nav2.classList.add('completed');
			nextStep();
		} catch (e) {
			console.error('Error in createService:', e);
		}
	}

	async function createClient(event) {
		if (event) event.preventDefault();
		try {
			// Simulate client creation delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Just move to next step without creating anything
			const nav3 = document.getElementById('nav-3'); 
			if (nav3) nav3.classList.add('completed');
			nextStep();
		} catch (e) {
			console.error('Error in createClient:', e);
		}
	}

	function copyToClipboard(elementId) {
		const element = document.getElementById(elementId);
		if (!element) return;
		navigator.clipboard.writeText(element.textContent).then(() => {
			const originalText = element.textContent;
			element.textContent = 'Copied!';
			element.style.background = '#ecfdf5';
			element.style.color = '#059669';
			setTimeout(() => {
				element.textContent = originalText;
				element.style.background = '';
				element.style.color = '';
			}, 1000);
		});
	}

	function copyCode() {
		const selector = document.getElementById('code-view-selector');
		const sdkBlock = document.getElementById('code-block');
		const curlBlock = document.getElementById('curl-block');
		
		let textToCopy = '';
		
		if (selector && selector.value === 'curl' && curlBlock) {
			const curlElement = curlBlock.querySelector('code');
			textToCopy = curlElement ? curlElement.textContent : curlBlock.textContent;
		} else if (sdkBlock) {
			const sdkElement = sdkBlock.querySelector('code');
			textToCopy = sdkElement ? sdkElement.textContent : sdkBlock.textContent;
		}
		
		if (textToCopy) {
			navigator.clipboard.writeText(textToCopy).then(() => {
				const button = event?.target;
				if (!button) return;
				const originalText = button.textContent;
				button.textContent = 'Copied!';
				button.style.background = '#059669';
				setTimeout(() => {
					button.textContent = originalText;
					button.style.background = '';
				}, 1000);
			});
		}
	}

	// Demo UI helpers
	let currentDemoStep = null;
	function showStepExplanation(step) {
		document.querySelectorAll('.step-explanation').forEach(el => el.classList.remove('active'));
		const el = document.getElementById('explanation-' + step);
		if (el) el.classList.add('active');
		currentDemoStep = step;
		showNextButton(false);
		
		// Update endpoint navigation highlighting
		document.querySelectorAll('.nav-endpoint').forEach(endpoint => {
			endpoint.classList.remove('active');
		});
		
		// Find and highlight the clicked endpoint
		const endpointMap = {
			'authorization': 'Authorization',
			'consent': 'Grant Consent', 
			'token': 'Exchange Token',
			'introspection': 'Access API'
		};
		
		const endpointTitle = endpointMap[step];
		if (endpointTitle) {
			const endpointEl = Array.from(document.querySelectorAll('.nav-endpoint')).find(el => 
				el.querySelector('h3').textContent === endpointTitle
			);
			if (endpointEl) {
				endpointEl.classList.add('active');
			}
		}
	}

	function updateRightPanel(endpoint, sdkCode, curlCode) {
		const sdkBlock = document.getElementById('code-block');
		const curlBlock = document.getElementById('curl-block');
		const codePath = document.getElementById('code-path');

		if (sdkBlock && sdkCode) {
			const sdkElement = sdkBlock.querySelector('code');
			if (sdkElement) {
				sdkElement.textContent = sdkCode;
				// Re-highlight with Prism.js
				if (window.Prism) {
					Prism.highlightElement(sdkElement);
				}
			}
		}
		if (curlBlock && curlCode) {
			const curlElement = curlBlock.querySelector('code');
			if (curlElement) {
				curlElement.textContent = curlCode;
				// Re-highlight with Prism.js
				if (window.Prism) {
					Prism.highlightElement(curlElement);
				}
			}
		}
		if (codePath) {
			codePath.textContent = endpoint;
		}
		const runBtn = document.getElementById('run-demo-btn');
		if (runBtn) runBtn.disabled = false;
	}

	function showOutput(message) {
		console.log('showOutput called with:', message);
		const outputConsole = document.getElementById('output-console');
		console.log('outputConsole element:', outputConsole);
		
		if (outputConsole) {
			// Format the message with colors and minimal styling
			const formattedMessage = formatOutput(message);
			outputConsole.innerHTML = formattedMessage;
			// Scroll to bottom to show latest output
			outputConsole.scrollTop = outputConsole.scrollHeight;
			console.log('Output updated successfully');
		} else {
			console.error('Output console element not found!');
			// Fallback: try to find it by class name
			const fallbackConsole = document.querySelector('.output-console');
			if (fallbackConsole) {
				const formattedMessage = formatOutput(message);
				fallbackConsole.innerHTML = formattedMessage;
				fallbackConsole.scrollTop = fallbackConsole.scrollHeight;
				console.log('Output updated via fallback');
			} else {
				console.error('No output console found at all!');
				// Last resort: alert the user
				alert('Output console not found! Please refresh the page.');
			}
		}
	}

	function formatOutput(message) {
		// If it's already an array (formatted message), join it
		if (Array.isArray(message)) {
			message = message.join('\n');
		}
		
		// Add color coding and minimal formatting
		return message
			.replace(/✅/g, '<span style="color: #059669; font-weight: bold;">✅</span>')
			.replace(/❌/g, '<span style="color: #dc2626; font-weight: bold;">❌</span>')
			.replace(/🔵/g, '<span style="color: #3b82f6; font-weight: bold;">🔵</span>')
			.replace(/🔧/g, '<span style="color: #f59e0b; font-weight: bold;">🔧</span>')
			.replace(/🚀/g, '<span style="color: #8b5cf6; font-weight: bold;">🚀</span>')
			.replace(/📖/g, '<span style="color: #10b981; font-weight: bold;">📖</span>')
			.replace(/🎯/g, '<span style="color: #ef4444; font-weight: bold;">🎯</span>')
			.replace(/🎉/g, '<span style="color: #f97316; font-weight: bold;">🎉</span>')
			// Color code status messages
			.replace(/(Status: ✅ .*)/g, '<span style="color: #059669; font-weight: bold;">$1</span>')
			.replace(/(Status: ❌ .*)/g, '<span style="color: #dc2626; font-weight: bold;">$1</span>')
			// Color code headers
			.replace(/(✅ .*Response:)/g, '<span style="color: #059669; font-weight: bold; font-size: 14px;">$1</span>')
			.replace(/(❌ .*Error:)/g, '<span style="color: #dc2626; font-weight: bold; font-size: 14px;">$1</span>')
			// Color code important values
			.replace(/(ticket": ")([^"]+)(")/g, '$1<span style="color: #8b5cf6; font-weight: bold;">$2</span>$3')
			.replace(/(authorizationCode": ")([^"]+)(")/g, '$1<span style="color: #3b82f6; font-weight: bold;">$2</span>$3')
			.replace(/(access_token": ")([^"]+)(")/g, '$1<span style="color: #10b981; font-weight: bold;">$2</span>$3')
			.replace(/(refresh_token": ")([^"]+)(")/g, '$1<span style="color: #f59e0b; font-weight: bold;">$2</span>$3')
			// Color code action types
			.replace(/"action": "(INTERACTION|LOCATION|OK|BAD_REQUEST)"/g, '"action": "<span style="color: #8b5cf6; font-weight: bold;">$1</span>"')
			// Color code result codes
			.replace(/"resultCode": "([^"]+)"/g, '"resultCode": "<span style="color: #6b7280; font-weight: bold;">$1</span>"')
			// Color code expiration times
			.replace(/(expires_in": )(\d+)/g, '$1<span style="color: #f59e0b; font-weight: bold;">$2</span>')
			.replace(/(expiresAt": ")([^"]+)(")/g, '$1<span style="color: #f59e0b; font-weight: bold;">$2</span>$3')
			// Color code scopes
			.replace(/"scope": "([^"]+)"/g, '"scope": "<span style="color: #10b981; font-weight: bold;">$1</span>"')
			.replace(/"scopes": \[([^\]]+)\]/g, '"scopes": [<span style="color: #10b981; font-weight: bold;">$1</span>]')
			// Color code client info
			.replace(/"clientId": (\d+)/g, '"clientId": <span style="color: #3b82f6; font-weight: bold;">$1</span>')
			.replace(/"clientName": "([^"]+)"/g, '"clientName": "<span style="color: #3b82f6; font-weight: bold;">$1</span>"')
			// Color code subject
			.replace(/"subject": "([^"]+)"/g, '"subject": "<span style="color: #8b5cf6; font-weight: bold;">$1</span>"')
			// Color code active status
			.replace(/"active": (true|false)/g, '"active": <span style="color: #059669; font-weight: bold;">$1</span>')
			.replace(/"usable": (true|false)/g, '"usable": <span style="color: #059669; font-weight: bold;">$1</span>')
			// Color code redirect URLs
			.replace(/(responseContent": ")([^"]+)(")/g, '$1<span style="color: #3b82f6; font-weight: bold;">$2</span>$3')
			// Add line breaks for better readability and ensure proper wrapping
			.replace(/\n/g, '<br>')
			.replace(/\s{2,}/g, '&nbsp;&nbsp;')
			// Ensure long lines break properly
			.replace(/([^>])(https?:\/\/[^\s<>"]+)/g, '$1<span style="word-break: break-all;">$2</span>')
			.replace(/([^>])([a-zA-Z0-9._-]{50,})/g, '$1<span style="word-break: break-all;">$2</span>');
	}

	function runCurrentDemo() {
		if (!currentDemoStep) return;
		const button = document.getElementById('run-demo-btn');
		if (button) { button.disabled = true; button.textContent = 'Running...'; }
		switch(currentDemoStep) {
			case 'authorization': executeAuthFlow(); break;
			case 'consent': executeConsent(); break;
			case 'token': executeTokenExchange(); break;
			case 'introspection': executeAPIAccess(); break;
		}
		setTimeout(() => { if (button) { button.disabled = false; button.textContent = 'Run Sample'; } }, 2000);
	}

	async function executeAuthFlow() {
		try {
			const params = new URLSearchParams({
				response_type: 'code',
				client_id: userCredentials.clientId,
				redirect_uri: 'http://localhost:3002/callback',
				scope: 'read',
				state: 'demo123'
			}).toString();
			const response = await fetch('/par/pushed-auth-req', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parameters: params }) });
			const result = await response.json();
			if (result.action === 'INTERACTION') {
				demoState.ticket = result.ticket;
				showOutput([
					'✅ Authorization Response',
					'{',
					'  "action": "' + result.action + '",',
					'  "ticket": "' + result.ticket + '",',
					'  "clientName": "' + (result.client?.clientName || 'N/A') + '",',
					'  "scopes": [' + (result.scopes?.map(s => '"' + s.name + '"').join(', ') || '') + ']',
					'}',
					'',
					'Status: ✅ Ready for user consent'
				].join('\n'));
				showNextButton(true);
			} else {
				showOutput('❌ Unexpected response: ' + JSON.stringify(result, null, 2));
			}
		} catch (error) {
			showOutput('❌ Authorization Error: ' + error.message);
		}
	}

	async function executeConsent() {
		try {
			const response = await fetch('/par/authorization', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticket: demoState.ticket,
					subject: 'user-123',
					sub: 'user@example.com',
					claims: { name: 'Sara Wallet', email: 'sara@example.com' },
					authTime: Math.floor(Date.now() / 1000)
				})
			});
			const result = await response.json();
			let isSuccess = result?.action === 'LOCATION';
			let redirectUrl = result?.responseContent;
			if (!isSuccess && typeof redirectUrl === 'string') {
				// Accept raw JSON without action as long as responseContent is present
				isSuccess = true;
			}
			if (isSuccess) {
				try {
					const url = new URL(redirectUrl);
					demoState.authorizationCode = url.searchParams.get('code');
				} catch (_) {
					// fallback: some payloads include authorizationCode directly
					demoState.authorizationCode = result.authorizationCode || demoState.authorizationCode || null;
				}
				showOutput([
					'✅ Consent Response',
					'{',
					'  "action": "' + (result.action || 'LOCATION') + '",',
					'  "authorizationCode": "' + (demoState.authorizationCode || '') + '"',
					'}',
					'',
					'Redirect URL: ' + (redirectUrl || ''),
					'',
					'Status: ✅ Ready for token exchange'
				].join('\n'));
				showNextButton(true);
			} else {
				showOutput('❌ Unexpected response: ' + JSON.stringify(result, null, 2));
			}
		} catch (error) {
			showOutput('❌ Consent Error: ' + error.message);
		}
	}

	async function executeTokenExchange() {
		try {
			const response = await fetch('/par/token', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					grant_type: 'authorization_code',
					code: demoState.authorizationCode,
					redirect_uri: 'http://localhost:3002/callback',
					client_id: userCredentials.clientId,
					client_secret: userCredentials.clientSecret
				})
			});
			const result = await response.json();
			if (result.action === 'OK') {
				const tokenData = JSON.parse(result.responseContent);
				demoState.accessToken = tokenData.access_token;
				showOutput([
					'✅ Token Response',
					'{',
					'  "action": "' + result.action + '",',
					'  "access_token": "' + demoState.accessToken.substring(0, 30) + '...",',
					'  "token_type": "' + tokenData.token_type + '",',
					'  "expires_in": ' + tokenData.expires_in + ',',
					'  "scope": "' + (tokenData.scope || 'read') + '"',
					'}',
					'',
					'Access Token: ' + demoState.accessToken.substring(0, 30) + '...',
					'Expires In: ' + tokenData.expires_in + ' seconds',
					'',
					'Status: ✅ Ready for API access'
				].join('\n'));
				showNextButton(true);
			} else {
				showOutput('❌ Unexpected response: ' + JSON.stringify(result, null, 2));
			}
		} catch (error) {
			showOutput('❌ Token Error: ' + error.message);
		}
	}

	async function executeAPIAccess() {
		try {
			const response = await fetch('/oauth/introspect', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: demoState.accessToken })
			});
			const result = await response.json();
			if (result.action === 'OK') {
				// Determine token status based on Authlete's existent and usable fields
				const isTokenActive = result.existent === true && result.usable === true;
				
				showOutput([
					'✅ Introspection Response',
					'{',
					'  "action": "' + result.action + '",',
					'  "existent": ' + result.existent + ',',
					'  "usable": ' + result.usable + ',',
					'  "clientId": ' + result.clientId + ',',
					'  "subject": "' + result.subject + '",',
					'  "scopes": [' + (result.scopes?.map(s => '"' + s + '"').join(', ') || '') + '],',
					'  "expiresAt": "' + new Date(result.expiresAt).toLocaleString() + '"',
					'}',
					'',
					'Token Status: ' + (isTokenActive ? '✅ ACTIVE' : '❌ INACTIVE'),
					'Token Existent: ' + (result.existent ? '✅ YES' : '❌ NO'),
					'Token Usable: ' + (result.usable ? '✅ YES' : '❌ NO'),
					'Expires: ' + new Date(result.expiresAt).toLocaleString(),
					'',
					'Status: ✅ OAuth flow completed successfully!'
				].join('\n'));
				showNextButton(false);
			} else {
				showOutput('❌ Unexpected response: ' + JSON.stringify(result, null, 2));
			}
		} catch (error) {
			showOutput('❌ API Access Error: ' + error.message);
		}
	}

	function initializeDemo() {
		if (currentStep === 5) {
			showStepExplanation('authorization');
			showOutput('🎯 Welcome to the OAuth Demo! Click "Start Authorization Flow" to begin...');
		}
	}

	async function startAuthFlow() {
		showStepExplanation('authorization');
		const sdkCode = `// Step 1: Authorization Endpoint
import { Authlete } from "authlete-typescript-sdk";

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

async function authorizationExample() {
  const result = await authlete.authorizationEndpoint.authAuthorizationApi({
    serviceId: "715948317",
    requestBody: {
      parameters: "response_type=code&client_id=3737820648&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&scope=read&state=demo123",
    },
  });

  console.log(result);
}

authorizationExample();`;

		const curlCode = `# Step 1: Authorization Request
curl -X POST https://api.authlete.com/api/auth/authorization \\
  -H "Authorization: Bearer xk1Cnyy9O-7b5q9a6-98g2oYO0trF9IS0ERi0iOGMqQ" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "715948317",
    "parameters": "response_type=code&client_id=3737820648&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&scope=read&state=demo123"
  }'`;

		updateRightPanel('Authorization Endpoint', sdkCode, curlCode);
		showOutput('🚀 Click "Run Sample" to execute the authorization request...');
		showNextButton(false);
		showBackButton(false);
	}

	async function grantConsent() {
		showStepExplanation('consent');
		const sdkCode = `// Step 2: Consent Endpoint
import { Authlete } from "authlete-typescript-sdk";

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

async function consentExample() {
  try {
    const result = await authlete.authorizationEndpoint.authAuthorizationIssueApi({
      serviceId: "715948317",
      requestBody: {
        ticket: "${demoState.ticket || 'TICKET_FROM_STEP_1'}",
        subject: "user-123",
        sub: "user@example.com",
      },
    });

    console.log(result);
  } catch (error) {
    if (error.name === 'ResponseValidationError' && error.rawValue) {
      console.log(error.rawValue);
    } else {
      throw error;
    }
  }
}

consentExample();`;

		const curlCode = `# Step 2: Grant Consent
curl -X POST https://api.authlete.com/api/auth/authorization/issue \\
  -H "Authorization: Bearer xk1Cnyy9O-7b5q9a6-98g2oYO0trF9IS0ERi0iOGMqQ" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "715948317",
    "ticket": "${demoState.ticket || 'TICKET_FROM_STEP_1'}",
    "subject": "user-123",
    "sub": "user@example.com"
  }'`;

		updateRightPanel('Authorization Decision Endpoint', sdkCode, curlCode);
		showOutput('🔧 Click "Run Sample" to send the consent decision...');
		showNextButton(false);
		showBackButton(true);
	}

	async function exchangeToken() {
		showStepExplanation('token');
		const sdkCode = `// Step 3: Token Endpoint
import { Authlete } from "authlete-typescript-sdk";

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

async function tokenExample() {
  const result = await authlete.tokenEndpoint.authTokenApi({
    serviceId: "715948317",
    requestBody: {
      parameters: "grant_type=authorization_code&code=${demoState.authorizationCode || 'AUTH_CODE_FROM_STEP_2'}&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback",
      clientId: "3737820648",
      clientSecret: "dETX4AAyQh7s0CSq-mX7EK5Vayq8TOp5RiumH7N_YBuj8pfAYZtmVLwFvvDUZRg8sUzgmajqmut282STbDZXMw",
    },
  });

  console.log(result);
}

tokenExample();`;

		const curlCode = `# Step 3: Token Exchange
curl -X POST https://api.authlete.com/api/auth/token \\
  -H "Authorization: Bearer xk1Cnyy9O-7b5q9a6-98g2oYO0trF9IS0ERi0iOGMqQ" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "715948317",
    "parameters": "grant_type=authorization_code&code=${demoState.authorizationCode || 'AUTH_CODE_FROM_STEP_2'}&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback",
    "clientId": "3737820648",
    "clientSecret": "dETX4AAyQh7s0CSq-mX7EK5Vayq8TOp5RiumH7N_YBuj8pfAYZtmVLwFvvDUZRg8sUzgmajqmut282STbDZXMw"
  }'`;

		updateRightPanel('Token Endpoint', sdkCode, curlCode);
		showOutput('🔑 Click "Run Sample" to exchange the authorization code for a token...');
		showNextButton(false);
		showBackButton(true);
	}

	async function accessAPI() {
		showStepExplanation('introspection');
		const sdkCode = `// Step 4: Introspection Endpoint
import { Authlete } from "authlete-typescript-sdk";

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

async function introspectionExample() {
  const result = await authlete.introspectionEndpoint.authIntrospectionApi({
    serviceId: "715948317",
    requestBody: {
      token: "${demoState.accessToken || 'ACCESS_TOKEN_FROM_STEP_3'}",
    },
  });

  console.log(result);
}

introspectionExample();`;

		const curlCode = `# Step 4: Token Introspection
curl -X POST https://api.authlete.com/api/auth/introspection \\
  -H "Authorization: Bearer xk1Cnyy9O-7b5q9a6-98g2oYO0trF9IS0ERi0iOGMqQ" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "715948317",
    "token": "${demoState.accessToken || 'ACCESS_TOKEN_FROM_STEP_3'}"
  }'`;

		updateRightPanel('Introspection Endpoint', sdkCode, curlCode);
		showOutput('📖 Click "Run Sample" to introspect the access token...');
		showNextButton(false);
		showBackButton(true);
	}

	function goToNextDemoStep() {
		if (!currentDemoStep) return;
		const next = getNextDemoStep(currentDemoStep);
		if (!next) return;
		switch(next) {
			case 'consent':
				grantConsent();
				break;
			case 'token':
				exchangeToken();
				break;
			case 'introspection':
				accessAPI();
				break;
		}
		showNextButton(false);
	}

	function goToPreviousDemoStep() {
		if (!currentDemoStep) return;
		const prev = getPreviousDemoStep(currentDemoStep);
		if (!prev) return;
		switch(prev) {
			case 'authorization':
				startAuthFlow();
				break;
			case 'consent':
				grantConsent();
				break;
			case 'token':
				exchangeToken();
				break;
		}
		showNextButton(false);
	}

	// Expose required functions to inline handlers
	window.showStep = showStep;
	window.nextStep = nextStep;
	window.createService = createService;
	window.createClient = createClient;
	window.copyToClipboard = copyToClipboard;
	window.copyCode = copyCode;
	window.runCurrentDemo = runCurrentDemo;
	window.startAuthFlow = startAuthFlow;
	window.grantConsent = grantConsent;
	window.exchangeToken = exchangeToken;
	window.accessAPI = accessAPI;
	window.goToNextDemoStep = goToNextDemoStep;
	window.goToPreviousDemoStep = goToPreviousDemoStep;
	window.switchCodeView = switchCodeView;
	window.clearOutput = clearOutput;

	// Setup guide copy functions
	window.copySetupCode = function(codeType) {
		let textToCopy = '';
		switch(codeType) {
			case 'init-project':
				textToCopy = 'mkdir oauth-project && cd oauth-project';
				break;
			case 'install-deps':
				textToCopy = 'npm install authlete-typescript-sdk express dotenv cors';
				break;
			case 'create-env':
				textToCopy = 'touch .env';
				break;
			case 'env-config':
				textToCopy = `# Authlete Configuration
AUTHLETE_SERVICE_ID=715948317
AUTHLETE_SERVICE_SECRET=5t5CO9JsNiBNXVdnjMzMf6jlx6gxSPTL9E9zhXiFyto
AUTHLETE_CLIENT_ID=3737820648
AUTHLETE_CLIENT_SECRET=dETX4AAyQh7s0CSq-mX7EK5Vayq8TOp5RiumH7N_YBuj8pfAYZtmVLwFvvDUZRg8sUzgmajqmut282STbDZXMw
AUTHLETE_AUTHLETE=xk1Cnyy9O-7b5q9a6-98g2oYO0trF9IS0ERi0iOGMqQ

# Server Configuration
PORT=3000
NODE_ENV=development`;
				break;
			case 'package-json':
				textToCopy = `{
  "name": "oauth-project",
  "version": "1.0.0",
  "description": "OAuth 2.0 implementation with Authlete",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "authlete-typescript-sdk": "^1.0.0",
    "express": "^4.18.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}`;
				break;
			case 'auth-file':
				textToCopy = `const express = require('express');
const { Authlete } = require('authlete-typescript-sdk');
require('dotenv').config();

const router = express.Router();

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

router.post('/authorize', async (req, res) => {
  async function run() {
    const result = await authlete.authorizationEndpoint.authAuthorizationApi({
      serviceId: process.env.AUTHLETE_SERVICE_ID,
      requestBody: {
        parameters: req.body.parameters,
      },
    });
    res.json(result);
  }
  run();
});

module.exports = router;`;
				break;
			case 'consent-file':
				textToCopy = `const express = require('express');
const { Authlete } = require('authlete-typescript-sdk');
require('dotenv').config();

const router = express.Router();

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

router.post('/consent', async (req, res) => {
  async function run() {
    let result;
    try {
      result = await authlete.authorizationEndpoint.authAuthorizationIssueApi({
        serviceId: process.env.AUTHLETE_SERVICE_ID,
        requestBody: {
          ticket: req.body.ticket,
          subject: req.body.subject || 'user-123',
          sub: req.body.sub || undefined,
        },
      });
    } catch (error) {
      if (error.name === 'ResponseValidationError' && error.rawValue) {
        result = error.rawValue;
      } else {
        throw error;
      }
    }
    res.json(result);
  }
  run();
});

module.exports = router;`;
				break;
			case 'token-file':
				textToCopy = `const express = require('express');
const { Authlete } = require('authlete-typescript-sdk');
require('dotenv').config();

const router = express.Router();

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

router.post('/token', async (req, res) => {
  const { client_id, client_secret, ...otherParams } = req.body;
  const tokenParams = new URLSearchParams(otherParams).toString();

  async function run() {
    const result = await authlete.tokenEndpoint.authTokenApi({
      serviceId: process.env.AUTHLETE_SERVICE_ID,
      requestBody: {
        parameters: tokenParams,
        clientId: client_id,
        clientSecret: client_secret,
      },
    });
    res.json(result);
  }
  run();
});

module.exports = router;`;
				break;
			case 'introspection-file':
				textToCopy = `const express = require('express');
const { Authlete } = require('authlete-typescript-sdk');
require('dotenv').config();

const router = express.Router();

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

router.post('/introspect', async (req, res) => {
  async function run() {
    const result = await authlete.introspectionEndpoint.authIntrospectionApi({
      serviceId: process.env.AUTHLETE_SERVICE_ID,
      requestBody: {
        token: req.body.token,
      },
    });
    res.json(result);
  }
  run();
});

module.exports = router;`;
				break;
			case 'server-file':
				textToCopy = `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import route modules
const authorizationRoutes = require('./auth/authorization');
const consentRoutes = require('./auth/consent');
const tokenRoutes = require('./auth/token');
const introspectionRoutes = require('./auth/introspection');

// Mount routes
app.use('/oauth', authorizationRoutes);
app.use('/oauth', consentRoutes);
app.use('/oauth', tokenRoutes);
app.use('/oauth', introspectionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth server is running' });
});

app.listen(PORT, () => {
  console.log(\`🚀 OAuth server running on http://localhost:\${PORT}\`);
  console.log('📖 Available endpoints:');
  console.log('  POST /par/pushed-auth-req');
  console.log('  POST /par/authorization');
  console.log('  POST /par/token');
  console.log('  POST /oauth/introspect');
});`;
				break;
		}
		
		if (textToCopy) {
			navigator.clipboard.writeText(textToCopy).then(() => {
				// Find the button that was clicked and show feedback
				const button = event?.target;
				if (button) {
					const originalText = button.textContent;
					button.textContent = 'Copied!';
					button.style.background = '#059669';
					setTimeout(() => {
						button.textContent = originalText;
						button.style.background = '';
					}, 1000);
				}
			});
		}
	};

	// Code view switching functionality
	function switchCodeView() {
		const selector = document.getElementById('code-view-selector');
		const sdkBlock = document.getElementById('code-block');
		const curlBlock = document.getElementById('curl-block');
		
		if (!selector || !sdkBlock || !curlBlock) return;
		
		if (selector.value === 'curl') {
			sdkBlock.style.display = 'none';
			curlBlock.style.display = 'block';
			// Re-highlight curl block
			if (window.Prism) {
				const curlElement = curlBlock.querySelector('code');
				if (curlElement) {
					Prism.highlightElement(curlElement);
				}
			}
		} else {
			sdkBlock.style.display = 'block';
			curlBlock.style.display = 'none';
			// Re-highlight SDK block
			if (window.Prism) {
				const sdkElement = sdkBlock.querySelector('code');
				if (sdkElement) {
					Prism.highlightElement(sdkElement);
				}
			}
		}
	}

	// Clear output console
	function clearOutput() {
		const outputConsole = document.getElementById('output-console');
		if (outputConsole) {
			outputConsole.innerHTML = '<div class="output-placeholder">Output will appear here when you run the sample...</div>';
		}
	}

	// Init
	document.addEventListener('DOMContentLoaded', function(){
		updateUIState();
		setTimeout(initializeDemo, 100);
		
		// Initialize Prism.js syntax highlighting
		if (window.Prism) {
			const codeElement = document.querySelector('#code-block code');
			if (codeElement) {
				Prism.highlightElement(codeElement);
			}
		}
	});
}());