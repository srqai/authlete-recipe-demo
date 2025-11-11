// Load environment variables from .env file
require('dotenv').config();

const { fetch, Request, Response, Headers } = require('undici');
if (!globalThis.fetch) globalThis.fetch = fetch;
if (!globalThis.Request) globalThis.Request = Request;
if (!globalThis.Response) globalThis.Response = Response;
if (!globalThis.Headers) globalThis.Headers = Headers;

const express = require('express');
const cors = require('cors');
const { Authlete } = require('authlete-typescript-sdk');

const app = express();
const PORT = process.env.PORT || 3004;
const AUTHLETE_BASE_URL = process.env.AUTHLETE_BASE_URL || 'https://us.authlete.com';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Admin credentials for creating services and clients
const ADMIN_CREDENTIALS = {
    serviceId: process.env.AUTHLETE_SERVICE_ID || "YOUR_SERVICE_ID",
    serviceSecret: process.env.AUTHLETE_SERVICE_SECRET || "YOUR_SERVICE_SECRET"
};

// Initialize Authlete SDK for admin operations
const adminAuthlete = new Authlete({
    security: {
        authlete: ADMIN_CREDENTIALS.serviceSecret
    }
});

// Store user's created credentials - these will be simulated with demo values
let userCredentials = {
    serviceId: process.env.AUTHLETE_SERVICE_ID || "YOUR_SERVICE_ID", // Use the same as admin for demo
    serviceSecret: process.env.AUTHLETE_SERVICE_SECRET || "YOUR_SERVICE_SECRET", // Use the same as admin for demo
    clientId: process.env.AUTHLETE_CLIENT_ID || "YOUR_CLIENT_ID", // Correct client ID
    clientSecret: process.env.AUTHLETE_CLIENT_SECRET || "YOUR_CLIENT_SECRET" // Correct client secret
};

// Service Access Token from environment variable
const SERVICE_ACCESS_TOKEN = process.env.AUTHLETE_AUTHLETE || "YOUR_SERVICE_ACCESS_TOKEN";

function getServiceAccessToken() {
    if (!SERVICE_ACCESS_TOKEN || SERVICE_ACCESS_TOKEN === "YOUR_SERVICE_ACCESS_TOKEN") {
        throw new Error('Please set AUTHLETE_AUTHLETE in your .env file to your actual token from Authlete Management Console');
    }
    return SERVICE_ACCESS_TOKEN;
}

const onboardingSteps = [
    {
        id: 1,
        title: "Implementation with Authlete",
        description: "Oauth 2.0 Flow",
        icon: "🚀",
        content: `
            <div class="step-content">
                <div class="docs-layout">
                    <!-- Main Content -->
                    <div class="docs-main">
                        <div class="docs-content">
                            <section class="docs-section">
                                <h1>OAuth 2.0 Implementation</h1>
                                <p class="docs-description">Complete guide to implementing OAuth 2.0 Authorization Code Flow using Authlete's enterprise platform</p>
                                <h2>What You Will Accomplish</h2>
                                <p>By the end of this guide, you will have successfully implemented a complete OAuth 2.0 authorization code flow using Authlete's enterprise platform. You'll learn how to:</p>
                                
                                <div class="accomplishments-grid">
                                    <div class="accomplishment-card">
                                        <div class="accomplishment-icon">🔧</div>
                                        <h3>Create OAuth Services</h3>
                                        <p>Set up your authorization server with custom configurations, grant types, and security policies</p>
                </div>
                                    <div class="accomplishment-card">
                                        <div class="accomplishment-icon">📱</div>
                                        <h3>Register Client Applications</h3>
                                        <p>Configure your applications to securely authenticate and request access to protected resources</p>
                                    </div>
                                    <div class="accomplishment-card">
                                        <div class="accomplishment-icon">🔐</div>
                                        <h3>Implement Authorization Flow</h3>
                                        <p>Handle user consent, authorization requests, and token exchanges using Authlete's APIs</p>
                                    </div>
                                    <div class="accomplishment-card">
                                        <div class="accomplishment-icon">🛡️</div>
                                        <h3>Secure API Access</h3>
                                        <p>Validate access tokens and protect your APIs with enterprise-grade security</p>
                                    </div>
                                </div>
                            </section>
                            
                            <section class="docs-section">
                                <h2>How Authlete Works</h2>
                                <p>Authlete acts as your OAuth 2.0 authorization server, handling all the complex security requirements while you focus on your application logic:</p>
                                
                                <div class="workflow-steps">
                                    <div class="workflow-step">
                                        <div class="step-number">1</div>
                                        <div class="step-content">
                                            <h4>Service & Client Setup</h4>
                                            <p>Create your OAuth service and register your client applications through Authlete's management APIs or web console.</p>
                                    </div>
                                </div>
                                
                                    <div class="workflow-step">
                                        <div class="step-number">2</div>
                                        <div class="step-content">
                                            <h4>Authorization Flow</h4>
                                            <p>When users want to access your app, Authlete handles the authorization request, user consent, and issues authorization codes.</p>
                                    </div>
                                </div>
                                
                                    <div class="workflow-step">
                                        <div class="step-number">3</div>
                                        <div class="step-content">
                                            <h4>Token Management</h4>
                                            <p>Authlete exchanges authorization codes for access tokens, manages token lifetimes, and handles refresh tokens.</p>
                                    </div>
                                </div>
                                
                                    <div class="workflow-step">
                                        <div class="step-number">4</div>
                                        <div class="step-content">
                                            <h4>API Protection</h4>
                                            <p>Your APIs validate access tokens through Authlete's introspection endpoint to ensure secure access to protected resources.</p>
                                    </div>
                                </div>
                            </div>
                            </section>
                            
                            <section class="docs-section">
                                <h2>OAuth 2.0 Authorization Code Flow</h2>
                                <p>The authorization code flow is the most common and secure OAuth 2.0 flow. Here's how it works with Authlete:</p>
                                
                                <div class="flow-diagram">
                                    <pre><code>┌─────────────┐   1. Authorization Request    ┌─────────────┐
│   Client    │ ────────────────────────────→ │ Authlete   │
│   App       │   POST /auth/authorization    │ Server     │
│             │   (client_id, scope, etc.)    │            │
└─────────────┘                               └─────────────┘
       │                                              │
       │                                              │ 2. Return
       │                                              │ INTERACTION
       │                                              │ (ticket)
       │                                              │
       │ 3. User Consent                             │
       │ (redirect to consent page)                  │
       ▼                                              │
┌─────────────┐   4. Grant Consent                   │
│    User     │ ────────────────────────────┼─────────┼─→
│   Browser   │   POST /auth/authorization/issue     │
└─────────────┘   (ticket, subject, claims)          │
       │                                              │
       │ 5. Authorization Code                        │
       │ (redirected back to client)                  │
       ▼                                              │
┌─────────────┐   6. Token Exchange                   │
│   Client    │ ────────────────────────────┼─────────┼─→
│   App       │   POST /auth/token                   │
└─────────────┘   (code, client_credentials)         │
       │                                              │
       │ 7. Access Token                              │
       │ (Bearer token for API calls)                 │
       ▼                                              │
┌─────────────┐   8. API Access                       │
│   Client    │ ────────────────────────────┼─────────┼─→
│   App       │   POST /auth/introspection            │
└─────────────┘   (validate token)                   │</code></pre>
                        </div>
                            </section>
                            
                            <section class="docs-section">
                                <h2>Endpoints You'll Work With</h2>
                                <p>This guide will walk you through implementing these four core OAuth endpoints:</p>
                                
                                <div class="endpoints-grid">
                                    <div class="endpoint-card">
                                        <div class="endpoint-number">1</div>
                                        <div class="endpoint-content">
                                            <h4>POST /auth/authorization</h4>
                                            <p>Push authorization request to Authlete server</p>
                    </div>
                                    </div>
                                    <div class="endpoint-card">
                                        <div class="endpoint-number">2</div>
                                        <div class="endpoint-content">
                                            <h4>POST /auth/authorization/issue</h4>
                                            <p>Process user consent and issue authorization code</p>
                                        </div>
                                    </div>
                                    <div class="endpoint-card">
                                        <div class="endpoint-number">3</div>
                                        <div class="endpoint-content">
                                            <h4>POST /auth/token</h4>
                                            <p>Exchange authorization code for access token</p>
                                        </div>
                                    </div>
                                    <div class="endpoint-card">
                                        <div class="endpoint-number">4</div>
                                        <div class="endpoint-content">
                                            <h4>POST /auth/introspection</h4>
                                            <p>Validate access tokens and get token metadata</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <section class="docs-section">
                                <h2>Choose a Language</h2>
                                <p>Select your preferred language to see code examples throughout this guide:</p>
                                
                                <div class="language-selection">
                                    <button class="language-btn active" onclick="selectLanguage('typescript')" id="typescript-btn">
                                        <div class="language-icon">⚡</div>
                                        <div class="language-info">
                                            <h4>TypeScript</h4>
                                            <p>Recommended - Full type safety</p>
                        </div>
                                    </button>
                                    <button class="language-btn" onclick="selectLanguage('javascript')" id="javascript-btn">
                                        <div class="language-icon">🟨</div>
                                        <div class="language-info">
                                            <h4>JavaScript</h4>
                                            <p>Vanilla JS implementation</p>
                                </div>
                                    </button>
                                    <button class="language-btn" onclick="selectLanguage('python')" id="python-btn">
                                        <div class="language-icon">🐍</div>
                                        <div class="language-info">
                                            <h4>Python</h4>
                                            <p>Python SDK implementation</p>
                                </div>
                                    </button>
                                    <button class="language-btn" onclick="selectLanguage('java')" id="java-btn">
                                        <div class="language-icon">☕</div>
                                        <div class="language-info">
                                            <h4>Java</h4>
                                            <p>Java SDK implementation</p>
                                </div>
                                    </button>
                                    <button class="language-btn" onclick="selectLanguage('csharp')" id="csharp-btn">
                                        <div class="language-icon">🔷</div>
                                        <div class="language-info">
                                            <h4>C#</h4>
                                            <p>.NET SDK implementation</p>
                                </div>
                                    </button>
                                    <button class="language-btn" onclick="selectLanguage('php')" id="php-btn">
                                        <div class="language-icon">🐘</div>
                                        <div class="language-info">
                                            <h4>PHP</h4>
                                            <p>PHP SDK implementation</p>
                            </div>
                                    </button>
                                </div>
                            </section>
                            
                            <div class="next-button-section">
                                <button class="primary-button" onclick="nextStep()" id="start-btn" disabled>
                                    Start OAuth Setup
                                </button>
                                <p class="button-note">Please select a language to continue</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Sidebar - On This Page -->
                    <div class="docs-sidebar">
                        <div class="on-this-page">
                            <h3>On This Page</h3>
                            <ul>
                                <li><a href="#what-you-will-accomplish">What You Will Accomplish</a></li>
                                <li><a href="#how-authlete-works">How Authlete Works</a></li>
                                <li><a href="#oauth-flow">OAuth 2.0 Flow</a></li>
                                <li><a href="#endpoints">Endpoints</a></li>
                                <li><a href="#choose-language">Choose Language</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        code: `// Welcome to Authlete!
// This onboarding guide will help you:

// 1. Create your OAuth 2.0 service
const service = {
    name: "My OAuth Service",
    description: "OAuth service for my application",
    features: [
        "Authorization Code Flow",
        "Token Management", 
        "Scope-based Access Control",
        "Enterprise Security"
    ]
};

// 2. Create a client application
const client = {
    name: "My Application",
    type: "Confidential Client",
    grantTypes: ["authorization_code", "refresh_token"],
    redirectUris: ["http://localhost:3000/callback"]
};

// 3. Get your credentials
const credentials = {
    serviceId: "YOUR_SERVICE_ID",
    serviceSecret: "YOUR_SERVICE_SECRET", 
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET"
};

console.log("🚀 Ready to start your OAuth journey!");`
    },
    {
        id: 2,
        title: "Create a Service",
        description: "Set up your OAuth 2.0 service",
        icon: "🔧",
        content: `
            <div class="step-content">
                <div class="service-form-container">
                    <div class="form-sections">
                        <!-- API Cluster Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>API Cluster</h3>
                                <p>The API Cluster you select will be the location of all data hosted for this service.</p>
                </div>
                            <div class="cluster-selection">
                                <label class="cluster-label">Select Cluster</label>
                                <div class="cluster-options">
                                    <button class="cluster-option" data-cluster="BR">
                                        <span class="flag">🇧🇷</span>
                                        <span class="code">BR</span>
                                    </button>
                                    <button class="cluster-option" data-cluster="JP">
                                        <span class="flag">🇯🇵</span>
                                        <span class="code">JP</span>
                                    </button>
                                    <button class="cluster-option" data-cluster="EU">
                                        <span class="flag">🇪🇺</span>
                                        <span class="code">EU</span>
                                    </button>
                                    <button class="cluster-option active" data-cluster="US">
                                        <span class="flag">🇺🇸</span>
                                        <span class="code">US</span>
                                    </button>
                        </div>
                                </div>
                                </div>
                                
                        <!-- Service Name Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Service Name</h3>
                                <p>The name of this service (up to 100 Unicode characters).</p>
                                    </div>
                            <div class="form-field">
                                <input type="text" id="service-name" name="serviceName" 
                                       placeholder="Sample Service" value="Sample Service" class="form-input">
                                </div>
                                </div>
                                
                        <!-- Service Description Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Service Description</h3>
                                <p>The description of this service (up to 200 Unicode characters).</p>
                                </div>
                            <div class="form-field">
                                <textarea id="service-description" name="serviceDescription" 
                                          placeholder="Friendly description for this service" 
                                          class="form-textarea">Friendly description for this service</textarea>
                                        </div>
                                        </div>
                        
                        <!-- FAPI Profile Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>FAPI Profile</h3>
                                <p>Choose whether FAPI 1.0 and FAPI 2.0 settings may be applied to this service.</p>
                                    </div>
                            <div class="toggle-section">
                                <label class="toggle-label">Enable</label>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="fapi-toggle" class="toggle-input">
                                    <label for="fapi-toggle" class="toggle-slider"></label>
                                </div>
                                <span class="help-icon">?</span>
                        </div>
                    </div>
                    
                        <!-- Action Buttons -->
                        <div class="form-actions">
                            <button type="button" class="cancel-button">Cancel</button>
                            <button type="button" class="create-button" onclick="createService()">Create</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        code: `// Service Creation with Authlete API
const serviceConfig = {
    serviceName: "My OAuth Service",
    description: "OAuth service for my application",
    
    // Grant types that this service supports
    supportedGrantTypes: [
        "AUTHORIZATION_CODE",
        "REFRESH_TOKEN",
        "CLIENT_CREDENTIALS"
    ],
    
    // Token configuration
    accessTokenDuration: 3600,      // 1 hour
    refreshTokenDuration: 604800,   // 1 week
    
    // Security settings
    pkceRequired: false,
    clientIdAliasEnabled: true,
    
    // Additional features
    directIntrospectionEndpointEnabled: true,
    directUserInfoEndpointEnabled: true
};

// Create service using Authlete API
const response = await authlete.serviceManagementApi
    .createService({ requestBody: serviceConfig });

console.log('✅ Service created with ID:', response.serviceId);
console.log('🔑 Service Secret:', response.serviceSecret);`
    },
    {
        id: 3,
        title: "Create a Client",
        description: "Configure your application client",
        icon: "📱",
        content: `
            <div class="step-content">
                <div class="client-form-container">
                    <div class="form-sections">
                        <!-- Client Name Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Client Name</h3>
                                <p>The name of this client (up to 100 Unicode characters).</p>
                            </div>
                            <div class="form-field">
                                <input type="text" id="client-name" name="clientName" 
                                       placeholder="Enter Name" value="Sample Client" class="form-input">
                            </div>
                </div>
                
                        <!-- Client ID Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Client ID (Optional)</h3>
                                <p>The Client ID must be set if an existing client is being migrated to Authlete. Leave blank to auto-generate.</p>
                        </div>
                            <div class="form-field">
                                <input type="text" id="client-id" name="clientId" 
                                       placeholder="Enter ID" value="0123456789" class="form-input">
                            </div>
                                </div>
                                
                        <!-- Client Description Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Client Description</h3>
                                <p>The description of this client (up to 200 Unicode characters).</p>
                            </div>
                            <div class="form-field">
                                    <textarea id="client-description" name="clientDescription" 
                                          placeholder="Enter Description" 
                                          class="form-textarea">Friendly description for this client</textarea>
                            </div>
                                </div>
                                
                        <!-- Client Type Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Client Type</h3>
                                <p>The client type of this client application.</p>
                            </div>
                                    <div class="radio-group">
                                        <label class="radio-item">
                                    <input type="radio" name="clientType" value="PUBLIC">
                                    <span>PUBLIC</span>
                                        </label>
                                        <label class="radio-item">
                                    <input type="radio" name="clientType" value="CONFIDENTIAL" checked>
                                    <span>CONFIDENTIAL</span>
                                        </label>
                                    </div>
                                </div>
                                
                        <!-- Application Type Section -->
                        <div class="form-section">
                            <div class="section-header">
                                <h3>Application Type</h3>
                                <p>The application type of this client. WEB, NATIVE, or unspecified.</p>
                                </div>
                            <div class="form-field">
                                <select id="application-type" name="applicationType" class="form-select">
                                    <option value="">Select</option>
                                    <option value="WEB">WEB</option>
                                    <option value="NATIVE">NATIVE</option>
                                </select>
                            </div>
                                </div>
                                
                        <!-- Action Buttons -->
                                <div class="form-actions">
                            <button type="button" class="cancel-button">Cancel</button>
                            <button type="button" class="create-button" onclick="createClient()">Create</button>
                                </div>
                    </div>
                </div>
            </div>
        `,
        code: `// Client Creation with Authlete API
const clientConfig = {
    clientName: "My Application",
    description: "My web application that uses OAuth",
    
    // Client type and authentication
    clientType: "CONFIDENTIAL",
    
    // Allowed redirect URIs after authorization
    redirectUris: [
        "http://localhost:3000/callback",
        "https://myapp.com/callback"
    ],
    
    // Grant types this client can use
    grantTypes: [
        "AUTHORIZATION_CODE",
        "REFRESH_TOKEN"
    ],
    
    // Response types for authorization endpoint
    responseTypes: ["CODE"],
    
    // Scopes this client can request
    scope: "read write profile",
    
    // Additional security settings
    tokenEndpointAuthMethod: "CLIENT_SECRET_BASIC"
};

// Create client using Authlete API
const response = await authlete.clientManagementApi.createClient({ 
        serviceId: YOUR_SERVICE_ID,
        requestBody: clientConfig 
    });

console.log('✅ Client created with ID:', response.clientId);
console.log('🔑 Client Secret:', response.clientSecret);`
    },
    {
        id: 4,
        title: "Project Setup",
        description: "Complete project setup guide",
        icon: "🔧",
        content: `
            <div class="step-content">
                <div class="setup-guide-container">
                    <div class="setup-sections">
                        <!-- Project Setup Header -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h2>Project Setup Guide</h2>
                                <p>Complete instructions to set up your OAuth 2.0 project with Authlete SDK</p>
                            </div>
                        </div>
                        
                        <!-- Prerequisites -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Prerequisites</h3>
                                <p>Before you begin, ensure you have the following installed:</p>
                            </div>
                            <div class="prerequisites-list">
                                <div class="prerequisite-item">
                                    <div class="prerequisite-icon">📦</div>
                                    <div class="prerequisite-content">
                                        <h4>Node.js</h4>
                                        <p>Version 16 or higher</p>
                                        <code>node --version</code>
                                    </div>
                                </div>
                                <div class="prerequisite-item">
                                    <div class="prerequisite-icon">📦</div>
                                    <div class="prerequisite-content">
                                        <h4>npm or yarn</h4>
                                        <p>Package manager</p>
                                        <code>npm --version</code>
                                    </div>
                                </div>
                                <div class="prerequisite-item">
                                    <div class="prerequisite-icon">🔑</div>
                                    <div class="prerequisite-content">
                                        <h4>Authlete Credentials</h4>
                                        <p>Service ID, Service Secret, Client ID, and Client Secret</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Project Structure -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Project Structure</h3>
                                <p>Create the following directory structure for your OAuth implementation:</p>
                            </div>
                            <div class="project-structure">
                                <pre><code>oauth-project/
├── package.json
├── .env
├── src/
│   ├── auth/
│   │   ├── authorization.js
│   │   ├── consent.js
│   │   ├── token.js
│   │   └── introspection.js
│   ├── config/
│   │   └── authlete.js
│   └── server.js
└── README.md</code></pre>
                            </div>
                        </div>
                        
                        <!-- Installation -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Installation</h3>
                                <p>Install the required dependencies:</p>
                            </div>
                            <div class="installation-steps">
                                <div class="step-item">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h4>Initialize Project</h4>
                                        <div class="code-block">
                                            <code>mkdir oauth-project && cd oauth-project</code>
                                            <button class="copy-btn" onclick="copySetupCode('init-project')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="step-item">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h4>Install Dependencies</h4>
                                        <div class="code-block">
                                            <code>npm install authlete-typescript-sdk express dotenv cors</code>
                                            <button class="copy-btn" onclick="copySetupCode('install-deps')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="step-item">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h4>Create Environment File</h4>
                                        <div class="code-block">
                                            <code>touch .env</code>
                                            <button class="copy-btn" onclick="copySetupCode('create-env')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Environment Configuration -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Environment Configuration</h3>
                                <p>Add your Authlete credentials to the .env file:</p>
                            </div>
                            <div class="env-config">
                                <div class="code-block">
                                    <code># Authlete Configuration
AUTHLETE_SERVICE_ID=YOUR_SERVICE_ID
AUTHLETE_SERVICE_SECRET=YOUR_SERVICE_SECRET
AUTHLETE_CLIENT_ID=YOUR_CLIENT_ID
AUTHLETE_CLIENT_SECRET=YOUR_CLIENT_SECRET
AUTHLETE_AUTHLETE=YOUR_SERVICE_ACCESS_TOKEN

# Server Configuration
PORT=3000
NODE_ENV=development</code>
                                    <button class="copy-btn" onclick="copySetupCode('env-config')">Copy</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Your Credentials -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Your Authlete Credentials</h3>
                                <p>These are your actual credentials for implementing OAuth in your application:</p>
                            </div>
                            <div class="credentials-display">
                                <div class="credentials-grid">
                                    <div class="credential-group">
                                        <h4>Service Credentials</h4>
                                        <p>For server-to-server API calls</p>
                                        <div class="credential-items">
                                            <div class="credential-item">
                                                <label>Service ID:</label>
                                                <code id="setup-service-id">YOUR_SERVICE_ID</code>
                                                <button class="copy-btn" onclick="copyToClipboard('setup-service-id')">Copy</button>
                                            </div>
                                            <div class="credential-item">
                                                <label>Service Secret:</label>
                                                <code id="setup-service-secret">YOUR_SERVICE_SECRET</code>
                                                <button class="copy-btn" onclick="copyToClipboard('setup-service-secret')">Copy</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="credential-group">
                                        <h4>Client Credentials</h4>
                                        <p>For your application authentication</p>
                                        <div class="credential-items">
                                            <div class="credential-item">
                                                <label>Client ID:</label>
                                                <code id="setup-client-id">YOUR_CLIENT_ID</code>
                                                <button class="copy-btn" onclick="copyToClipboard('setup-client-id')">Copy</button>
                                            </div>
                                            <div class="credential-item">
                                                <label>Client Secret:</label>
                                                <code id="setup-client-secret">YOUR_CLIENT_SECRET</code>
                                                <button class="copy-btn" onclick="copyToClipboard('setup-client-secret')">Copy</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Package.json -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Package.json Configuration</h3>
                                <p>Create your package.json file:</p>
                            </div>
                            <div class="package-config">
                                <div class="code-block">
                                    <code>{
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
}</code>
                                    <button class="copy-btn" onclick="copySetupCode('package-json')">Copy</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Next Steps -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>Next Steps</h3>
                                <p>Now you're ready to implement the OAuth endpoints. Copy the code samples from the Live Demo section into your project files:</p>
                            </div>
                            <div class="next-steps-list">
                                <div class="next-step-item">
                                    <div class="step-icon">🔐</div>
                                    <div class="step-content">
                                        <h4>Authorization Endpoint</h4>
                                        <p>Copy the authorization code to <code>src/auth/authorization.js</code></p>
                                    </div>
                                </div>
                                <div class="next-step-item">
                                    <div class="step-icon">✅</div>
                                    <div class="step-content">
                                        <h4>Consent Endpoint</h4>
                                        <p>Copy the consent code to <code>src/auth/consent.js</code></p>
                                    </div>
                                </div>
                                <div class="next-step-item">
                                    <div class="step-icon">🔑</div>
                                    <div class="step-content">
                                        <h4>Token Endpoint</h4>
                                        <p>Copy the token exchange code to <code>src/auth/token.js</code></p>
                                    </div>
                                </div>
                                <div class="next-step-item">
                                    <div class="step-icon">🔍</div>
                                    <div class="step-content">
                                        <h4>Introspection Endpoint</h4>
                                        <p>Copy the introspection code to <code>src/auth/introspection.js</code></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- File Implementation Guide -->
                        <div class="setup-section">
                            <div class="section-header">
                                <h3>File Implementation Guide</h3>
                                <p>Here's exactly how to implement each endpoint in your project files:</p>
                            </div>
                            <div class="file-implementation-guide">
                                <div class="file-guide-item">
                                    <div class="file-header">
                                        <h4>1. src/auth/authorization.js</h4>
                                        <p>Authorization endpoint implementation</p>
                                    </div>
                                    <div class="file-content">
                                        <div class="code-block">
                                            <code>const express = require('express');
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

module.exports = router;</code>
                                            <button class="copy-btn" onclick="copySetupCode('auth-file')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="file-guide-item">
                                    <div class="file-header">
                                        <h4>2. src/auth/consent.js</h4>
                                        <p>Consent endpoint implementation</p>
                                    </div>
                                    <div class="file-content">
                                        <div class="code-block">
                                            <code>const express = require('express');
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

module.exports = router;</code>
                                            <button class="copy-btn" onclick="copySetupCode('consent-file')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="file-guide-item">
                                    <div class="file-header">
                                        <h4>3. src/auth/token.js</h4>
                                        <p>Token exchange endpoint implementation</p>
                                    </div>
                                    <div class="file-content">
                                        <div class="code-block">
                                            <code>const express = require('express');
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

module.exports = router;</code>
                                            <button class="copy-btn" onclick="copySetupCode('token-file')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="file-guide-item">
                                    <div class="file-header">
                                        <h4>4. src/auth/introspection.js</h4>
                                        <p>Token introspection endpoint implementation</p>
                                    </div>
                                    <div class="file-content">
                                        <div class="code-block">
                                            <code>const express = require('express');
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

module.exports = router;</code>
                                            <button class="copy-btn" onclick="copySetupCode('introspection-file')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="file-guide-item">
                                    <div class="file-header">
                                        <h4>5. src/server.js</h4>
                                        <p>Main server file to wire everything together</p>
                                    </div>
                                    <div class="file-content">
                                        <div class="code-block">
                                            <code>const express = require('express');
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
  console.log('  POST /oauth/authorize');
  console.log('  POST /oauth/consent');
  console.log('  POST /oauth/token');
  console.log('  POST /oauth/introspect');
});</code>
                                            <button class="copy-btn" onclick="copySetupCode('server-file')">Copy</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        code: `// Welcome to Authlete!
// This onboarding guide will help you:

// 1. Create your OAuth 2.0 service
const service = {
    name: "My OAuth Service",
    description: "OAuth service for my application",
    features: [
        "Authorization Code Flow",
        "Token Management", 
        "Scope-based Access Control",
        "Enterprise Security"
    ]
};

// 2. Create a client application
const client = {
    name: "My Application",
    type: "Confidential Client",
    grantTypes: ["authorization_code", "refresh_token"],
    redirectUris: ["http://localhost:3000/callback"]
};

// 3. Get your credentials
const credentials = {
    serviceId: "YOUR_SERVICE_ID",
    serviceSecret: "YOUR_SERVICE_SECRET", 
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET"
};

console.log("🚀 Ready to start your OAuth journey!");`
    },
    {
        id: 5,
        title: "Live Demo",
        description: "See your OAuth flow in action",
        icon: "🎯",
        content: `
            <div class="step-content">
                <div class="page-header">
                    <h1>Live OAuth Demo</h1>
                    <p class="subtitle">Experience your OAuth flow with your actual credentials</p>
                </div>
                
                <div class="demo-layout">
                    <!-- Middle Panel: Explanations -->
                    <div class="explanation-section">
                        <div class="step-explanation active" id="explanation-authorization">
                            <h3>1. Authorization Request</h3>
                            <div class="explanation-content">
                                <div class="what-happens">
                                    <h4>What happens in this step:</h4>
                                    <div class="actor-explanation">
                                        <div class="actor">
                                            <strong>👤 Client Application:</strong> Redirects user to authorization server with client_id, scope, and redirect_uri parameters
                                        </div>
                                        <div class="actor">
                                            <strong>🖥️ Your Server:</strong> Receives authorization request, validates parameters, and processes the OAuth flow initiation
                                        </div>
                                        <div class="actor">
                                            <strong>🔐 Authlete:</strong> Processes authorization request, validates client credentials, and returns interaction ticket for user consent
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="endpoint-info">
                                    <h4>Endpoint: POST /auth/authorization</h4>
                                    <p>This endpoint initiates the OAuth 2.0 authorization flow. It validates the authorization request and determines what action should be taken next.</p>
                                </div>
                                
                                <div class="reference-docs">
                                    <h4>Reference Documentation:</h4>
                                    <ul>
                                        <li><a href="https://docs.authlete.com/#authorization-endpoint" target="_blank">Authorization Endpoint API</a></li>
                                        <li><a href="https://tools.ietf.org/html/rfc6749#section-4.1.1" target="_blank">RFC 6749 - Authorization Request</a></li>
                                    </ul>
                                </div>
                                
                                <div class="demo-actions">
                                    <button class="demo-action-btn" onclick="startAuthFlow()">Start Authorization Flow</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-explanation" id="explanation-consent">
                            <h3>2. Grant Consent</h3>
                            <div class="explanation-content">
                                <div class="what-happens">
                                    <h4>What happens in this step:</h4>
                                    <div class="actor-explanation">
                                        <div class="actor">
                                            <strong>👤 Client Application:</strong> User reviews requested permissions and approves or denies the authorization request
                                        </div>
                                        <div class="actor">
                                            <strong>🖥️ Your Server:</strong> Processes user consent decision and communicates the result to Authlete
                                        </div>
                                        <div class="actor">
                                            <strong>🔐 Authlete:</strong> Issues authorization code and generates redirect response back to the client application
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="endpoint-info">
                                    <h4>Endpoint: POST /auth/authorization/issue</h4>
                                    <p>This endpoint processes the user's consent decision and issues an authorization code if the user grants permission.</p>
                                </div>
                                
                                <div class="reference-docs">
                                    <h4>Reference Documentation:</h4>
                                    <ul>
                                        <li><a href="https://docs.authlete.com/#authorization-decision-endpoint" target="_blank">Authorization Decision API</a></li>
                                        <li><a href="https://tools.ietf.org/html/rfc6749#section-4.1.2" target="_blank">RFC 6749 - Authorization Response</a></li>
                                    </ul>
                                </div>
                                
                                <div class="demo-actions">
                                    <button class="demo-action-btn" onclick="grantConsent()" id="consent-btn" disabled>Grant Consent</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-explanation" id="explanation-token">
                            <h3>3. Exchange Token</h3>
                            <div class="explanation-content">
                                <div class="what-happens">
                                    <h4>What happens in this step:</h4>
                                    <div class="actor-explanation">
                                        <div class="actor">
                                            <strong>👤 Client Application:</strong> Exchanges authorization code for access token using client credentials and redirect URI
                                        </div>
                                        <div class="actor">
                                            <strong>🖥️ Your Server:</strong> Validates authorization code, client authentication, and redirect URI match
                                        </div>
                                        <div class="actor">
                                            <strong>🔐 Authlete:</strong> Issues access token, refresh token, and returns token metadata including expiration time
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="endpoint-info">
                                    <h4>Endpoint: POST /auth/token</h4>
                                    <p>This endpoint exchanges an authorization code for an access token. It's the core of the OAuth 2.0 authorization code flow.</p>
                                </div>
                                
                                <div class="reference-docs">
                                    <h4>Reference Documentation:</h4>
                                    <ul>
                                        <li><a href="https://docs.authlete.com/#token-endpoint" target="_blank">Token Endpoint API</a></li>
                                        <li><a href="https://tools.ietf.org/html/rfc6749#section-4.1.3" target="_blank">RFC 6749 - Access Token Request</a></li>
                                    </ul>
                                </div>
                                
                                <div class="demo-actions">
                                    <button class="demo-action-btn" onclick="exchangeToken()" id="token-btn" disabled>Exchange for Token</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step-explanation" id="explanation-introspection">
                            <h3>4. Access Protected API</h3>
                            <div class="explanation-content">
                                <div class="what-happens">
                                    <h4>What happens in this step:</h4>
                                    <div class="actor-explanation">
                                        <div class="actor">
                                            <strong>👤 Client Application:</strong> Sends API request with access token in Authorization header to access protected resources
                                        </div>
                                        <div class="actor">
                                            <strong>🖥️ Your Server:</strong> Validates access token before serving protected resources to ensure request is authorized
                                        </div>
                                        <div class="actor">
                                            <strong>🔐 Authlete:</strong> Introspects token and returns validation result with token metadata, scopes, and expiration info
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="endpoint-info">
                                    <h4>Endpoint: POST /auth/introspection</h4>
                                    <p>This endpoint validates access tokens and returns metadata about the token including its validity, scopes, and expiration.</p>
                                </div>
                                
                                <div class="reference-docs">
                                    <h4>Reference Documentation:</h4>
                                    <ul>
                                        <li><a href="https://docs.authlete.com/#introspection-endpoint" target="_blank">Introspection Endpoint API</a></li>
                                        <li><a href="https://tools.ietf.org/html/rfc7662" target="_blank">RFC 7662 - Token Introspection</a></li>
                                    </ul>
                                </div>
                                
                                <div class="demo-actions">
                                    <button class="demo-action-btn" onclick="accessAPI()" id="api-btn" disabled>Access Protected API</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="completion-card" id="completion-card" style="display: none;">
                    <h3>🎉 Congratulations!</h3>
                    <p>You've successfully completed the OAuth 2.0 onboarding and seen your credentials in action.</p>
                    <div class="action-buttons">
                        <button class="primary-button" onclick="downloadCredentials()">
                            Download Configuration
                        </button>
                        <button class="secondary-button" onclick="viewDocumentation()">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>
        `,
        code: `// OAuth Flow Implementation with Authlete SDK
// Copy and paste these code samples to implement OAuth in your application

import { Authlete } from "authlete-typescript-sdk";

const authlete = new Authlete({
  security: {
    authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
  },
});

// Step 1: Authorization Endpoint
async function authorizationExample() {
  const result = await authlete.authorizationEndpoint.authAuthorizationApi({
    serviceId: "YOUR_SERVICE_ID",
    requestBody: {
      parameters: "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&scope=read&state=demo123",
    },
  });

  console.log(result);
}

authorizationExample();`
    }
];

// API endpoints for simulating service and client creation (demo purposes)
app.post('/api/create-service', async (req, res) => {
    try {
        const { serviceName, serviceDescription, grantTypes, accessTokenDuration } = req.body;
        
        // Simulate service creation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return demo credentials
        res.json({
            success: true,
            serviceId: userCredentials.serviceId,
            serviceSecret: userCredentials.serviceSecret
        });
    } catch (error) {
        console.error('Service creation simulation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/create-client', async (req, res) => {
    try {
        const { clientName, clientDescription, clientType, redirectUris, scopes } = req.body;
        
        // Simulate client creation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return demo credentials
        res.json({
            success: true,
            clientId: userCredentials.clientId,
            clientSecret: userCredentials.clientSecret
        });
    } catch (error) {
        console.error('Client creation simulation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// OAuth demo endpoints
app.post('/oauth/authorize', async (req, res) => {
    const authlete = new Authlete({
        security: {
            authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
        },
    });

    async function run() {
        const result = await authlete.authorizationEndpoint.authAuthorizationApi({
            serviceId: userCredentials.serviceId,
            requestBody: {
                parameters: req.body.parameters,
            },
        });

        res.json(result);
    }

    run();
});

app.post('/oauth/consent', async (req, res) => {
    console.log('🔵 /oauth/consent - Consent request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const authlete = new Authlete({
        security: {
            authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
        },
    });

    try {
        console.log('🔧 Initializing Authlete SDK with official pattern...');
        console.log('✅ Authlete SDK initialized successfully');
        console.log('🚀 Calling authAuthorizationIssueApi...');
        console.log('Service ID:', userCredentials.serviceId);
        console.log('Ticket:', req.body.ticket);
        
        let result;
        try {
            result = await authlete.authorizationEndpoint.authAuthorizationIssueApi({
                serviceId: userCredentials.serviceId,
                requestBody: {
                    ticket: req.body.ticket,
                    subject: req.body.subject || 'user-123',
                    sub: req.body.sub || undefined,
                },
            });
        } catch (error) {
            if (error.name === 'ResponseValidationError' && error.rawValue) {
                console.log('SDK validation error, but API call succeeded. Using raw response.');
                result = error.rawValue;
            } else {
                console.log('Authorization issue API call failed:', error.message);
                return res.status(500).json({ 
                    error: 'Authorization issue API call failed: ' + error.message,
                    details: error.toString()
                });
            }
        }

        console.log('✅ Consent (SDK) response:', JSON.stringify(result, null, 2));
        res.json(result);
    } catch (error) {
        console.log('❌ Consent endpoint error:', error.message);
        res.status(500).json({ 
            error: 'Consent endpoint error: ' + error.message,
            details: error.toString()
        });
    }
});

app.post('/oauth/token', async (req, res) => {
    const authlete = new Authlete({
        security: {
            authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
        },
    });

        const { client_id, client_secret, ...otherParams } = req.body;
        const tokenParams = new URLSearchParams(otherParams).toString();

    async function run() {
        const result = await authlete.tokenEndpoint.authTokenApi({
            serviceId: userCredentials.serviceId,
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

app.post('/oauth/introspect', async (req, res) => {
        const authlete = new Authlete({
        security: {
            authlete: process.env["AUTHLETE_AUTHLETE"] ?? "",
        },
        });
        
    async function run() {
        const result = await authlete.introspectionEndpoint.authIntrospectionApi({
            serviceId: userCredentials.serviceId,
            requestBody: {
                token: req.body.token,
            },
        });
        
        res.json(result);
    }

    run();
});

// Debug endpoint to log button clicks to the server terminal
app.post('/debug/button-click', (req, res) => {
    console.log('🛎️ Create Service button clicked (ping received)');
    res.json({ ok: true, at: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Authlete Onboarding</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
            <script>
                window.__ONBOARDING_STEPS__ = ${JSON.stringify(onboardingSteps)};
                window.__USER_CREDENTIALS__ = ${JSON.stringify(userCredentials)};
                
                // Language selection functionality
                window.selectLanguage = function(language) {
                    // Update button states
                    document.querySelectorAll('.language-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    if (language === 'typescript') {
                        document.getElementById('typescript-btn').classList.add('active');
                    } else if (language === 'javascript') {
                        document.getElementById('javascript-btn').classList.add('active');
                    } else if (language === 'python') {
                        document.getElementById('python-btn').classList.add('active');
                    } else if (language === 'java') {
                        document.getElementById('java-btn').classList.add('active');
                    } else if (language === 'csharp') {
                        document.getElementById('csharp-btn').classList.add('active');
                    } else if (language === 'php') {
                        document.getElementById('php-btn').classList.add('active');
                    }
                    
                    // Store selected language
                    window.selectedLanguage = language;
                    
                    // Enable start button
                    const startBtn = document.getElementById('start-btn');
                    const buttonNote = document.querySelector('.button-note');
                    
                    if (startBtn) {
                        startBtn.disabled = false;
                        startBtn.textContent = 'Start OAuth Setup with ' + language.charAt(0).toUpperCase() + language.slice(1);
                    }
                    
                    if (buttonNote) {
                        buttonNote.textContent = 'Selected: ' + language.charAt(0).toUpperCase() + language.slice(1);
                    }
                };
            </script>
            <script src="/app.js" defer></script>
            <style>
                :root {
                    --primary: 210 100% 25%;
                    --primary-foreground: 0 0% 100%;
                    --background: 0 0% 99%;
                    --foreground: 215 25% 27%;
                    --card: 0 0% 100%;
                    --card-foreground: 215 25% 27%;
                    --popover: 0 0% 100%;
                    --popover-foreground: 215 25% 27%;
                    --secondary: 210 17% 95%;
                    --secondary-foreground: 215 25% 27%;
                    --muted: 210 17% 95%;
                    --muted-foreground: 215 13% 45%;
                    --accent: 210 17% 95%;
                    --accent-foreground: 215 25% 27%;
                    --destructive: 0 84.2% 60.2%;
                    --destructive-foreground: 210 40% 98%;
                    --border: 214 13% 91%;
                    --input: 214 13% 91%;
                    --ring: 210 100% 25%;
                    --radius: 0.375rem;
                    --sidebar-background: 0 0% 100%;
                    --sidebar-foreground: 215 25% 27%;
                    --sidebar-primary: 210 100% 25%;
                    --sidebar-primary-foreground: 0 0% 100%;
                    --sidebar-accent: 210 17% 97%;
                    --sidebar-accent-foreground: 215 25% 27%;
                    --sidebar-border: 214 13% 91%;
                    --sidebar-ring: 210 100% 25%;
                    --sidebar-width: 280px;
                    --code-panel-width: 600px;
                    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
                    
                    /* Authlete original colors */
                    --authlete-blue: rgb(0, 64, 128);
                    --authlete-blue-hover: rgb(0, 48, 96);
                    --authlete-blue-light: rgb(240, 248, 255);
                    --authlete-gray-50: #f9fafb;
                    --authlete-gray-100: #f3f4f6;
                    --authlete-gray-200: #e5e7eb;
                    --authlete-gray-300: #d1d5db;
                    --authlete-gray-400: #9ca3af;
                    --authlete-gray-500: #6b7280;
                    --authlete-gray-600: #4b5563;
                    --authlete-gray-700: #374151;
                    --authlete-gray-800: #1f2937;
                    --authlete-gray-900: #111827;
                    --border-radius: 0.375rem;
                    --border-radius-lg: 0.5rem;
                    --color-success: #059669;
                    --color-success-light: #d1fae5;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    background: white;
                    color: var(--authlete-gray-900);
                    line-height: 1.6;
                    font-size: 14px;
                }
                
                .layout {
                    display: grid;
                    grid-template-columns: var(--sidebar-width) 1fr;
                    height: 100vh;
                    overflow: hidden;
                }
                
                /* Sidebar */
                .sidebar {
                    background: white;
                    border-right: 1px solid var(--authlete-gray-200);
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    box-shadow: var(--shadow);
                }
                
                .sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid var(--authlete-gray-200);
                    background: white;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                
                .logo-icon {
                    width: 28px;
                    height: 28px;
                    background: var(--authlete-blue);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                }
                
                .logo-text {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                }
                
                .sidebar-subtitle {
                    font-size: 12px;
                    color: var(--authlete-gray-600);
                    font-weight: 500;
                }
                
                .nav-menu {
                    flex: 1;
                    padding: 16px 0;
                }
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 14px 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    color: inherit;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    position: relative;
                }
                
                .nav-item:hover {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                }
                
                .nav-item.active {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                    border-right: 3px solid var(--authlete-blue);
                    font-weight: 500;
                }
                
                .nav-item.completed::after {
                    content: '✓';
                    position: absolute;
                    right: 20px;
                    color: var(--color-success);
                    font-weight: 600;
                }
                
                .nav-icon {
                    font-size: 18px;
                    margin-right: 12px;
                    width: 24px;
                    text-align: center;
                }
                
                .nav-content h3 {
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 2px;
                }
                
                .nav-content p {
                    font-size: 11px;
                    color: var(--authlete-gray-500);
                    line-height: 1.4;
                }
                
                /* Main Content */
                .main-content {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: white;
                }
                
                .main-header {
                    background: white;
                    border-bottom: 1px solid var(--authlete-gray-200);
                    padding: 24px 32px;
                }
                
                .main-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                    margin-bottom: 4px;
                }
                
                .main-header .subtitle {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    font-weight: 400;
                }
                
                .content-area {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                    background: white;
                }
                
                /* Documentation Layout - Scalar Style */
                .docs-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 32px;
                }
                
                .docs-grid {
                    display: grid;
                    grid-template-columns: 1fr 540px;
                    gap: 24px;
                    align-items: start;
                }
                
                .docs-content {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .code-column {
                    position: sticky;
                    top: 16px;
                    align-self: start;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                /* For non-demo steps, hide the code column and use full width */
                .docs-grid.no-code {
                    grid-template-columns: 1fr;
                }
                
                .code-column.hidden {
                    display: none;
                }
                
                /* Full width layout for welcome, service, client, credentials pages */
                .docs-grid.full-width {
                    grid-template-columns: 1fr;
                    max-width: 1000px;
                }
                
                .docs-grid.full-width .docs-content {
                    max-width: none;
                }
                
                /* Welcome styles */
                .welcome-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                
                .welcome-header h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                    margin-bottom: 12px;
                    letter-spacing: -0.025em;
                }
                
                .welcome-header .subtitle {
                    font-size: 16px;
                    color: var(--authlete-gray-600);
                    font-weight: 400;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .docs-content {
                    max-width: 900px;
                    margin: 0 auto;
                }
                
                .docs-content h2 {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 16px;
                    margin-top: 32px;
                }
                
                .docs-content h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--authlete-gray-800);
                    margin-bottom: 12px;
                    margin-top: 28px;
                }
                
                .docs-content p {
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--authlete-gray-700);
                    margin-bottom: 16px;
                }
                
                .docs-content ul {
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--authlete-gray-700);
                    margin-bottom: 24px;
                    padding-left: 20px;
                }
                
                .docs-content li {
                    margin-bottom: 6px;
                }
                
                /* Content Boxes */
                .content-box {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 20px;
                    margin-bottom: 24px;
                    box-shadow: var(--shadow);
                }
                
                .content-box:last-child {
                    margin-bottom: 0;
                }
                
                .content-box h2 {
                    margin-top: 0;
                    margin-bottom: 12px;
                }
                
                .content-box h3 {
                    margin-top: 0;
                    margin-bottom: 12px;
                }
                
                .content-box p {
                    margin-bottom: 12px;
                }
                
                .content-box ul {
                    margin-bottom: 16px;
                }
                
                /* Flow Diagram */
                .flow-diagram {
                    margin: 24px 0;
                    padding: 20px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                }
                
                .flow-diagram h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-800);
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .flow-diagram pre {
                    background: #f8f9fa !important;
                    padding: 16px !important;
                    border-radius: 6px !important;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace !important;
                    font-size: 11px !important;
                    line-height: 1.3 !important;
                    overflow-x: auto !important;
                    border: 1px solid #e5e7eb !important;
                    margin: 0 !important;
                    color: var(--authlete-gray-800) !important;
                }
                
                /* Endpoints Grid */
                .endpoints-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                    margin: 24px 0;
                }
                
                .endpoint-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                    transition: all 0.2s ease;
                }
                
                .endpoint-card:hover {
                    border-color: var(--authlete-blue);
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-1px);
                }
                
                .endpoint-number {
                    background: var(--authlete-blue);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 12px;
                    flex-shrink: 0;
                }
                
                .endpoint-content h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 6px;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                }
                
                .endpoint-content p {
                    font-size: 12px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.4;
                }
                
                /* Language Selection */
                .language-selection {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin: 24px 0;
                }
                
                .language-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: white;
                    border: 2px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                }
                
                .language-btn:hover {
                    border-color: var(--authlete-blue);
                    box-shadow: var(--shadow);
                    transform: translateY(-1px);
                }
                
                .language-btn.active {
                    border-color: var(--authlete-blue);
                    background: var(--authlete-blue-light);
                    box-shadow: var(--shadow);
                }
                
                .language-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .language-info h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 2px;
                }
                
                .language-info p {
                    font-size: 12px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                }
                
                /* Next Button Section */
                .next-button-section {
                    text-align: center;
                    margin-top: 32px;
                    padding: 24px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                }
                
                .button-note {
                    font-size: 12px;
                    color: var(--authlete-gray-500);
                    margin-top: 8px;
                    margin-bottom: 0;
                }
                
                /* Benefits Grid */
                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin: 20px 0;
                }
                
                .benefit-item {
                    padding: 16px;
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius);
                    text-align: center;
                }
                
                .benefit-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                
                .benefit-item h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 8px;
                }
                
                .benefit-item p {
                    font-size: 13px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.4;
                }
                
                /* Concepts Grid */
                .concepts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                    margin: 20px 0;
                }
                
                .concept-card {
                    padding: 20px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                }
                
                .concept-card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .concept-card p {
                    font-size: 14px;
                    color: var(--authlete-gray-700);
                    margin-bottom: 12px;
                }
                
                .concept-card ul {
                    font-size: 13px;
                    color: var(--authlete-gray-700);
                    margin-bottom: 16px;
                    padding-left: 16px;
                }
                
                .concept-card li {
                    margin-bottom: 4px;
                }
                
                .concept-example {
                    margin-top: 16px;
                    padding: 12px;
                    background: var(--authlete-gray-50);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--authlete-gray-200);
                }
                
                .concept-example h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--authlete-gray-800);
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .concept-example pre {
                    background: white;
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 11px;
                    line-height: 1.3;
                    overflow-x: auto;
                    margin: 0;
                }
                
                .concept-example code {
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    color: var(--authlete-gray-800);
                }
                
                /* Workflow Steps */
                .workflow-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin: 20px 0;
                }
                
                .workflow-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius);
                    border-left: 4px solid var(--authlete-blue);
                }
                
                .step-number {
                    background: var(--authlete-blue);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .step-content h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 6px;
                    margin-top: 0;
                }
                
                .step-content p {
                    font-size: 14px;
                    color: var(--authlete-gray-700);
                    margin: 0;
                    line-height: 1.4;
                }
                
                /* Cards */
                .info-card, .form-card {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    margin-bottom: 24px;
                    box-shadow: var(--shadow);
                }
                
                .card-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--authlete-gray-200);
                    background: var(--authlete-gray-50);
                }
                
                .card-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                }
                
                .card-content {
                    padding: 24px;
                }
                
                /* Forms */
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--authlete-gray-700);
                    margin-bottom: 6px;
                }
                
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                    background: white;
                    box-sizing: border-box;
                }
                
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--authlete-blue);
                    box-shadow: 0 0 0 3px var(--authlete-blue-light);
                }
                
                .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                    width: 100%;
                }
                
                .form-field {
                    margin-top: 16px;
                    width: 100%;
                }
                
                .checkbox-group, .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .checkbox-item, .radio-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    cursor: pointer;
                }
                
                .checkbox-item input, .radio-item input {
                    width: auto;
                    margin: 0;
                }
                
                .checkbox-item span, .radio-item span {
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .checkbox-item small, .radio-item small {
                    display: block;
                    font-size: 11px;
                    color: var(--authlete-gray-500);
                    margin-top: 2px;
                }
                
                /* Buttons */
                .primary-button, .secondary-button, .demo-btn, .copy-btn {
                    padding: 10px 16px;
                    border-radius: var(--border-radius);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    font-family: inherit;
                }
                
                .primary-button {
                    background: var(--authlete-blue);
                    color: white;
                }
                
                .primary-button:hover {
                    background: var(--authlete-blue-hover);
                }
                
                .primary-button:disabled {
                    background: var(--authlete-gray-300);
                    cursor: not-allowed;
                }
                
                .secondary-button {
                    background: white;
                    color: var(--authlete-blue);
                    border: 1px solid var(--authlete-blue);
                }
                
                .secondary-button:hover {
                    background: var(--authlete-blue-light);
                }
                
                .demo-btn {
                    background: var(--color-success);
                    color: white;
                    padding: 8px 12px;
                    font-size: 12px;
                }
                
                .demo-btn:hover {
                    background: #047857;
                }
                
                .demo-btn:disabled {
                    background: var(--authlete-gray-300);
                    cursor: not-allowed;
                }
                
                /* Results and displays */
                .result-section {
                    margin-top: 20px;
                    padding: 16px;
                    border-radius: var(--border-radius);
                    background: var(--color-success-light);
                    border: 1px solid var(--color-success);
                }
                
                .success-message h4 {
                    color: var(--color-success);
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                
                .credentials-display {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .credential-item, .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
                
                .credential-item label, .detail-item label {
                    font-weight: 500;
                    min-width: 100px;
                }
                
                .credential-item code, .detail-item code {
                    background: white;
                    border: 1px solid var(--authlete-gray-300);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                    flex: 1;
                }
                
                /* Credentials overview */
                .credentials-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }
                
                .credential-card {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 24px;
                    text-align: center;
                    box-shadow: var(--shadow);
                }
                
                .card-icon {
                    font-size: 32px;
                    margin-bottom: 12px;
                }
                
                .credential-card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                
                .credential-card p {
                    color: var(--authlete-gray-600);
                    margin-bottom: 20px;
                }
                
                .credential-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    text-align: left;
                }
                
                /* Demo styles */
                .demo-card {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    margin-bottom: 24px;
                    box-shadow: var(--shadow);
                }
                
                .demo-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-top: 20px;
                }
                
                .demo-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: var(--authlete-gray-50);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--authlete-gray-200);
                    transition: all 0.3s ease;
                }
                
                .demo-step:hover {
                    border-color: var(--authlete-blue);
                    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.1);
                }
                
                .demo-step.active {
                    border-color: var(--authlete-blue);
                    background: var(--authlete-blue-light);
                }
                
                .demo-step.completed .step-indicator {
                    background: var(--color-success);
                    color: white;
                }
                
                .step-indicator {
                    background: var(--authlete-blue);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .step-details {
                    flex: 1;
                }
                
                .step-details h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                
                .step-details p {
                    color: var(--authlete-gray-600);
                    margin-bottom: 12px;
                }
                
                .demo-btn {
                    background: var(--color-success);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: var(--border-radius);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .demo-btn:hover:not(:disabled) {
                    background: #047857;
                    transform: translateY(-1px);
                }
                
                .demo-btn:disabled {
                    background: var(--authlete-gray-300);
                    cursor: not-allowed;
                    transform: none;
                }
                
                .step-result {
                    margin-top: 12px;
                    padding: 12px;
                    background: white;
                    border-radius: var(--border-radius);
                    border: 1px solid var(--authlete-gray-300);
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                    display: none;
                }
                
                /* Learning and comparison grids */
                .learning-grid, .comparison-grid, .usage-grid {
                    display: grid;
                    gap: 16px;
                }
                
                .learning-item, .comparison-item, .usage-item {
                    padding: 16px;
                    background: var(--authlete-gray-50);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--authlete-gray-200);
                }
                
                .learning-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .check-icon {
                    color: var(--color-success);
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .comparison-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                }
                
                .usage-grid {
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                }
                
                /* Next steps and completion */
                .next-steps-card, .completion-card {
                    background: linear-gradient(135deg, var(--color-success) 0%, #047857 100%);
                    color: white;
                    border-radius: var(--border-radius-lg);
                    padding: 24px;
                    text-align: center;
                    margin-top: 24px;
                }
                
                .next-steps-card h3, .completion-card h3 {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                
                .next-steps-card p {
                    margin-bottom: 16px;
                    opacity: 0.9;
                }
                
                .next-actions {
                    text-align: left;
                    margin: 20px 0;
                }
                
                .next-actions h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                
                .next-actions ul {
                    list-style: none;
                    padding: 0;
                }
                
                .next-actions li {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 13px;
                }
                
                .next-actions li::before {
                    content: '→';
                    font-weight: 600;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                /* Code Card - Scalar Style */
                .code-card {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: var(--shadow);
                }

                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0;
                    border: none;
                    background: none;
                }
                
                .code-path {
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 12px;
                    color: var(--authlete-gray-600);
                }
                
                .code-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .code-view-dropdown {
                    background: white;
                    color: var(--authlete-gray-900);
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: var(--border-radius);
                    padding: 4px 8px;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                }
                
                .code-view-dropdown:focus {
                    border-color: var(--authlete-blue);
                    box-shadow: 0 0 0 2px rgba(26, 86, 219, 0.2);
                }
                
                .code-view-dropdown option {
                    background: white;
                    color: var(--authlete-gray-900);
                }
                
                .copy-btn {
                    background: var(--authlete-gray-100);
                    color: var(--authlete-gray-700);
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .copy-btn:hover {
                    background: var(--authlete-gray-200);
                }
                
                /* Code Editor */
                .code-editor {
                    background: #1e1e1e;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    height: 400px;
                }
                
                .code-editor-content {
                    padding: 8px;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 14px;
                    line-height: 20px;
                    color: #e5e7eb;
                    overflow-y: auto;
                    height: 100%;
                }

                .code-block {
                    background: transparent;
                    color: #e5e7eb;
                    padding: 0;
                    border-radius: 0;
                    border: none;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    overflow-x: auto;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 14px;
                    line-height: 20px;
                }
                
                .code-block pre {
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 0 !important;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }

                .code-block code {
                    background: transparent !important;
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    line-height: inherit !important;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }
                
                /* Run Button */
                .run-section {
                    padding: 0;
                    border: none;
                    background: none;
                }

                .run-btn {
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: var(--border-radius);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                    height: 32px;
                }

                .run-btn:hover:not(:disabled) {
                    background: var(--authlete-blue-hover);
                }

                .run-btn:disabled {
                    background: var(--authlete-gray-300);
                    cursor: not-allowed;
                }

                /* MINIMAL OUTPUT CONSOLE - COMPACT AND CLEAN */
                .output-section {
                    display: block !important;
                    visibility: visible !important;
                    margin-top: 12px;
                    padding: 0;
                    background: transparent;
                    border: none;
                    border-radius: 0;
                    box-shadow: none;
                    min-height: auto;
                }
                
                .output-label {
                    display: block !important;
                    visibility: visible !important;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-600);
                    margin-bottom: 4px;
                    padding: 0;
                    border: none;
                    font-family: 'SF Mono', Monaco, monospace;
                }

                .output-console {
                    display: block !important;
                    visibility: visible !important;
                    background: #1e1e1e;
                    border: none;
                    border-radius: var(--border-radius);
                    padding: 8px;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 14px;
                    color: #e5e7eb;
                    overflow-y: auto;
                    max-height: 350px;
                    min-height: 120px;
                    line-height: 20px;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }
                
                .output-console pre {
                    margin: 0;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 14px;
                    line-height: 20px;
                    color: #e5e7eb;
                }

                .output-placeholder {
                    color: #6b7280;
                    font-style: italic;
                    text-align: center;
                    padding: 12px;
                    font-size: 14px;
                }
                
                .output-actions {
                    display: flex;
                    gap: 6px;
                    justify-content: flex-end;
                    margin-top: 6px;
                }
                
                .output-console-btn {
                    background: var(--authlete-gray-100);
                    color: var(--authlete-gray-700);
                    border: none;
                    padding: 3px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    height: 24px;
                    font-weight: 500;
                    font-family: 'SF Mono', Monaco, monospace;
                }
                
                .output-console-btn:hover {
                    background: var(--authlete-gray-200);
                }
                
                /* Responsive */
                @media (max-width: 1200px) {
                    .layout {
                        grid-template-columns: 280px 1fr;
                    }
                }
                
                @media (max-width: 768px) {
                    .layout {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto auto 1fr;
                    }
                    
                    .sidebar {
                        max-height: 200px;
                    }
                    
                    .code-panel {
                        max-height: 300px;
                    }
                    
                    .credentials-overview {
                        grid-template-columns: 1fr;
                    }
                }

                /* Demo layout - corrected */
                .demo-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-top: 24px;
                }

                /* Middle Panel: Explanations */
                .explanation-section {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 24px;
                    box-shadow: var(--shadow);
                }

                .step-explanation {
                    display: none;
                }

                .step-explanation.active {
                    display: block;
                }

                .step-explanation h3 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--authlete-gray-900);
                    border-bottom: 2px solid var(--authlete-blue);
                    padding-bottom: 8px;
                }

                .what-happens {
                    margin-bottom: 24px;
                }

                .what-happens h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--authlete-gray-800);
                }

                .actor-explanation {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .actor {
                    padding: 16px;
                    background: var(--authlete-gray-50);
                    border-radius: var(--border-radius);
                    border-left: 4px solid var(--authlete-blue);
                    font-size: 14px;
                    line-height: 1.6;
                }

                .endpoint-info {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: var(--authlete-blue-light);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--authlete-blue);
                }

                .endpoint-info h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--authlete-blue);
                    font-family: 'SF Mono', Monaco, monospace;
                }

                .endpoint-info p {
                    font-size: 14px;
                    color: var(--authlete-gray-700);
                    margin: 0;
                }

                .reference-docs {
                    margin-bottom: 24px;
                }

                .reference-docs h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--authlete-gray-800);
                }

                .reference-docs ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .reference-docs li {
                    margin-bottom: 8px;
                }

                .reference-docs a {
                    color: var(--authlete-blue);
                    text-decoration: none;
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .reference-docs a:hover {
                    text-decoration: underline;
                }

                .reference-docs a::before {
                    content: '📖';
                    font-size: 12px;
                }

                .demo-actions {
                    text-align: center;
                }

                .demo-action-btn {
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: var(--border-radius);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: var(--shadow);
                }

                .demo-action-btn:hover:not(:disabled) {
                    background: var(--authlete-blue-hover);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .demo-action-btn:disabled {
                    background: var(--authlete-gray-300);
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                /* Remove old three-column layout CSS */
                .three-column-layout,
                .endpoints-panel,
                .explanations-panel,
                .code-output-panel,
                .code-section,
                .output-section {
                    display: none;
                }

                /* Prism.js overrides for better integration */
                .code-block pre {
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    border-radius: 0 !important;
                }

                .code-block code {
                    background: transparent !important;
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    line-height: inherit !important;
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }

                /* Scalar-style Documentation Layout */
                .docs-layout {
                    display: grid;
                    grid-template-columns: 1fr 250px;
                    gap: 48px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .docs-main {
                    min-width: 0;
                }
                
                .docs-header {
                    margin-bottom: 48px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--authlete-gray-200);
                }
                
                .docs-header h1 {
                    font-size: 36px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                    margin-bottom: 16px;
                    letter-spacing: -0.025em;
                    line-height: 1.2;
                }
                
                .docs-description {
                    font-size: 18px;
                    color: var(--authlete-gray-600);
                    line-height: 1.6;
                    margin: 0;
                }
                
                .docs-content {
                    display: flex;
                    flex-direction: column;
                    gap: 48px;
                }
                
                .docs-section {
                    scroll-margin-top: 100px;
                }
                
                .docs-section h2 {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                    margin-bottom: 24px;
                    letter-spacing: -0.025em;
                    line-height: 1.3;
                }
                
                .docs-section h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--authlete-gray-800);
                    margin-bottom: 16px;
                    margin-top: 32px;
                }
                
                .docs-section p {
                    font-size: 16px;
                    line-height: 1.7;
                    color: var(--authlete-gray-700);
                    margin-bottom: 16px;
                }
                
                .docs-section ul {
                    font-size: 16px;
                    line-height: 1.7;
                    color: var(--authlete-gray-700);
                    margin-bottom: 24px;
                    padding-left: 24px;
                }
                
                .docs-section li {
                    margin-bottom: 8px;
                }
                
                /* Info Box */
                .info-box {
                    display: flex;
                    gap: 16px;
                    padding: 20px;
                    background: var(--authlete-blue-light);
                    border: 1px solid var(--authlete-blue);
                    border-radius: var(--border-radius-lg);
                    margin: 24px 0;
                }
                
                .info-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .info-content {
                    flex: 1;
                }
                
                .info-content strong {
                    color: var(--authlete-blue);
                    font-weight: 600;
                }
                
                .info-content ul {
                    margin-top: 12px;
                    margin-bottom: 0;
                }
                
                /* Benefits Grid */
                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin: 24px 0;
                }
                
                .benefit-card {
                    padding: 24px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                    transition: all 0.2s ease;
                }
                
                .benefit-card:hover {
                    border-color: var(--authlete-blue);
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-2px);
                }
                
                .benefit-icon {
                    font-size: 32px;
                    margin-bottom: 16px;
                }
                
                .benefit-card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .benefit-card p {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.5;
                }
                
                /* Concept Grid */
                .concept-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                    margin: 24px 0;
                }
                
                .concept-card {
                    padding: 24px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                }
                
                .concept-card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 16px;
                    margin-top: 0;
                }
                
                .concept-card p {
                    font-size: 14px;
                    color: var(--authlete-gray-700);
                    margin-bottom: 16px;
                }
                
                .concept-card ul {
                    font-size: 14px;
                    color: var(--authlete-gray-700);
                    margin-bottom: 0;
                    padding-left: 20px;
                }
                
                .concept-card li {
                    margin-bottom: 6px;
                }
                
                /* Flow Diagram */
                .flow-diagram {
                    margin: 24px 0;
                    padding: 24px;
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                }
                
                .flow-diagram pre {
                    background: white !important;
                    border: 1px solid var(--authlete-gray-300) !important;
                    border-radius: var(--border-radius) !important;
                    padding: 16px !important;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace !important;
                    font-size: 12px !important;
                    line-height: 1.4 !important;
                    overflow-x: auto !important;
                    margin: 0 !important;
                    color: var(--authlete-gray-800) !important;
                }
                
                .flow-diagram code {
                    font-family: inherit !important;
                    font-size: inherit !important;
                    line-height: inherit !important;
                    color: inherit !important;
                }
                
                /* Right Sidebar */
                .docs-sidebar {
                    position: sticky;
                    top: 24px;
                    align-self: start;
                    max-height: calc(100vh - 48px);
                    overflow-y: auto;
                }
                
                .on-this-page {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 20px;
                    box-shadow: var(--shadow);
                }
                
                .on-this-page h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 16px;
                    margin-top: 0;
                }
                
                .on-this-page ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .on-this-page li {
                    margin-bottom: 8px;
                }
                
                .on-this-page a {
                    display: block;
                    padding: 8px 12px;
                    color: var(--authlete-gray-600);
                    text-decoration: none;
                    font-size: 14px;
                    border-radius: var(--border-radius);
                    transition: all 0.2s ease;
                }
                
                .on-this-page a:hover {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                }
                
                /* Responsive */
                @media (max-width: 1024px) {
                    .docs-layout {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    
                    .docs-sidebar {
                        position: static;
                        max-height: none;
                    }
                }
                
                @media (max-width: 768px) {
                    .docs-header h1 {
                        font-size: 28px;
                    }
                    
                    .docs-description {
                        font-size: 16px;
                    }
                    
                    .docs-section h2 {
                        font-size: 24px;
                    }
                    
                    .benefits-grid,
                    .concept-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Accomplishments Grid */
                .accomplishments-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin: 24px 0;
                }
                
                .accomplishment-card {
                    padding: 24px;
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow);
                    transition: all 0.2s ease;
                }
                
                .accomplishment-card:hover {
                    border-color: var(--authlete-blue);
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-2px);
                }
                
                .accomplishment-icon {
                    font-size: 32px;
                    margin-bottom: 16px;
                }
                
                .accomplishment-card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .accomplishment-card p {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.5;
                }

                /* Service Creation Layout */
                .service-creation-layout {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: white;
                    width: 100%;
                    max-width: none;
                }
                
                .service-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 32px;
                    border-bottom: 1px solid var(--authlete-gray-200);
                    background: white;
                    width: 100%;
                }
                
                .service-title h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--authlete-gray-900);
                    margin: 0;
                }
                
                .header-actions {
                    display: flex;
                    gap: 24px;
                }
                
                .header-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--authlete-gray-600);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }
                
                .header-link:hover {
                    color: var(--authlete-blue);
                }
                
                .header-icon {
                    font-size: 16px;
                }
                
                .service-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                    width: 100%;
                    max-width: none;
                }
                
                .service-sidebar {
                    width: 280px;
                    background: var(--authlete-gray-50);
                    border-right: 1px solid var(--authlete-gray-200);
                    padding: 24px 0;
                    flex-shrink: 0;
                }
                
                .sidebar-item {
                    padding: 16px 24px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-700);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .sidebar-item.active {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                    border-right: 3px solid var(--authlete-blue);
                }
                
                .service-form-content {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                    max-width: none;
                    width: 100%;
                }
                
                .form-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--authlete-gray-200);
                    margin-bottom: 32px;
                }
                
                .tab {
                    padding: 12px 24px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-600);
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s ease;
                }
                
                .tab.active {
                    color: var(--authlete-blue);
                    border-bottom-color: var(--authlete-blue);
                }
                
                .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    max-width: none;
                    width: 100%;
                }
                
                .form-section {
                    max-width: none;
                    width: 100%;
                }
                
                .section-header {
                    margin-bottom: 16px;
                }
                
                .section-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .section-header p {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.5;
                }
                
                .cluster-selection {
                    margin-top: 16px;
                }
                
                .cluster-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-700);
                    margin-bottom: 12px;
                }
                
                .cluster-options {
                    display: flex;
                    gap: 12px;
                }
                
                .cluster-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 20px;
                    background: white;
                    border: 2px solid var(--authlete-gray-200);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }
                
                .cluster-option:hover {
                    border-color: var(--authlete-blue);
                }
                
                .cluster-option.active {
                    border-color: var(--authlete-blue);
                    background: var(--authlete-blue-light);
                }
                
                .flag {
                    font-size: 24px;
                }
                
                .code {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--authlete-gray-700);
                }
                
                .cluster-option.active .code {
                    color: var(--authlete-blue);
                }
                
                .form-field {
                    margin-top: 16px;
                }
                
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                    background: white;
                    box-sizing: border-box;
                }
                
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--authlete-blue);
                    box-shadow: 0 0 0 3px var(--authlete-blue-light);
                }
                
                .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                    width: 100%;
                }
                
                .form-field {
                    margin-top: 16px;
                    width: 100%;
                }
                
                .toggle-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .toggle-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-700);
                }
                
                .toggle-switch {
                    position: relative;
                    width: 44px;
                    height: 24px;
                }
                
                .toggle-input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--authlete-gray-300);
                    transition: 0.2s;
                    border-radius: 24px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.2s;
                    border-radius: 50%;
                }
                
                .toggle-input:checked + .toggle-slider {
                    background-color: var(--authlete-blue);
                }
                
                .toggle-input:checked + .toggle-slider:before {
                    transform: translateX(20px);
                }
                
                .help-icon {
                    font-size: 16px;
                    color: var(--authlete-gray-400);
                    cursor: help;
                }
                
                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 48px;
                    padding-top: 24px;
                    border-top: 1px solid var(--authlete-gray-200);
                }
                
                .cancel-button {
                    padding: 12px 24px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .cancel-button:hover {
                    background: #b91c1c;
                }
                
                .create-button {
                    padding: 12px 24px;
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .create-button:hover {
                    background: var(--authlete-blue-hover);
                }

                /* Service Form Container - Simple Full Width */
                .service-form-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                
                .service-form-container .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    width: 100%;
                }
                
                .service-form-container .form-section {
                    width: 100%;
                }
                
                .service-form-container .section-header h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .service-form-container .section-header p {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.5;
                }
                
                .service-form-container .form-field {
                    margin-top: 16px;
                    width: 100%;
                }
                
                .service-form-container .form-input,
                .service-form-container .form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                    background: white;
                    box-sizing: border-box;
                }
                
                .service-form-container .form-input:focus,
                .service-form-container .form-textarea:focus {
                    outline: none;
                    border-color: var(--authlete-blue);
                    box-shadow: 0 0 0 3px var(--authlete-blue-light);
                }
                
                .service-form-container .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .service-form-container .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid var(--authlete-gray-200);
                }
                
                /* Client Form Container - Simple Full Width */
                .client-form-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                
                .client-form-container .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    width: 100%;
                }
                
                .client-form-container .form-section {
                    width: 100%;
                }
                
                .client-form-container .section-header h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--authlete-gray-900);
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .client-form-container .section-header p {
                    font-size: 14px;
                    color: var(--authlete-gray-600);
                    margin: 0;
                    line-height: 1.5;
                }
                
                .client-form-container .form-field {
                    margin-top: 16px;
                    width: 100%;
                }
                
                .client-form-container .form-input,
                .client-form-container .form-textarea,
                .client-form-container .form-select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--authlete-gray-300);
                    border-radius: 6px;
                    font-size: 14px;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                    background: white;
                    box-sizing: border-box;
                }
                
                .client-form-container .form-input:focus,
                .client-form-container .form-textarea:focus,
                .client-form-container .form-select:focus {
                    outline: none;
                    border-color: var(--authlete-blue);
                    box-shadow: 0 0 0 3px var(--authlete-blue-light);
                }
                
                .client-form-container .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .client-form-container .form-select {
                    cursor: pointer;
                }
                
                .client-form-container .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .client-form-container .radio-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px 0;
                }
                
                .client-form-container .radio-item input {
                    width: auto;
                    margin: 0;
                }
                
                .client-form-container .radio-item span {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--authlete-gray-700);
                }
                
                .client-form-container .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid var(--authlete-gray-200);
                }
                
                /* Endpoint Navigation */
                .nav-endpoints {
                    margin-top: 8px;
                    padding-left: 20px;
                    border-left: 2px solid var(--authlete-gray-200);
                }
                
                .nav-endpoint {
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    color: inherit;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    position: relative;
                    margin-bottom: 4px;
                }
                
                .nav-endpoint:hover {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                }
                
                .nav-endpoint.active {
                    background: var(--authlete-blue-light);
                    color: var(--authlete-blue);
                    font-weight: 500;
                }
                
                .nav-endpoint .nav-icon {
                    font-size: 14px;
                    margin-right: 10px;
                    width: 20px;
                    text-align: center;
                }
                
                .nav-endpoint .nav-content h3 {
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 2px;
                }
                
                .nav-endpoint .nav-content p {
                    font-size: 10px;
                    color: var(--authlete-gray-500);
                    line-height: 1.3;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                }

                /* Setup Guide Container - Specific styling for project setup page only */
                .setup-guide-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                
                /* Black text styling ONLY for setup guide content */
                .setup-guide-container .setup-section .section-header h2 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #000000 !important;
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .setup-guide-container .setup-section .section-header h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .setup-guide-container .setup-section .section-header p {
                    font-size: 16px;
                    color: #333333 !important;
                    margin: 0;
                    line-height: 1.6;
                }
                
                .setup-guide-container .prerequisite-content h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .setup-guide-container .prerequisite-content p {
                    font-size: 14px;
                    color: #333333 !important;
                    margin-bottom: 8px;
                }
                
                .setup-guide-container .prerequisite-content code {
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                    color: #000000 !important;
                }
                
                .setup-guide-container .project-structure pre {
                    background: #f8f9fa;
                    border: 1px solid #e5e7eb;
                    border-radius: var(--border-radius);
                    padding: 20px;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    overflow-x: auto;
                    color: #000000 !important;
                }
                
                .setup-guide-container .step-content h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 12px;
                    margin-top: 0;
                }
                
                .setup-guide-container .code-block {
                    background: #f8f9fa;
                    border: 1px solid #e5e7eb;
                    border-radius: var(--border-radius);
                    padding: 16px;
                    position: relative;
                }
                
                .setup-guide-container .code-block code {
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 14px;
                    color: #000000 !important;
                    display: block;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                
                .setup-guide-container .next-step-item .step-content h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 6px;
                    margin-top: 0;
                }
                
                .setup-guide-container .next-step-item .step-content p {
                    font-size: 12px;
                    color: #333333 !important;
                    margin: 0;
                    line-height: 1.4;
                }
                
                .setup-guide-container .next-step-item .step-content code {
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                    color: #000000 !important;
                }
                
                .setup-guide-container .credential-group h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 8px;
                    margin-top: 0;
                }
                
                .setup-guide-container .credential-group p {
                    font-size: 12px;
                    color: #333333 !important;
                    margin-bottom: 16px;
                    margin-top: 0;
                }
                
                .setup-guide-container .credential-item label {
                    font-weight: 500;
                    min-width: 80px;
                    color: #333333 !important;
                }
                
                .setup-guide-container .credential-item code {
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 11px;
                    flex: 1;
                    color: #000000 !important;
                    word-break: break-all;
                }
                
                .setup-guide-container .file-header h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #000000 !important;
                    margin-bottom: 4px;
                    margin-top: 0;
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                }
                
                .setup-guide-container .file-header p {
                    font-size: 12px;
                    color: #333333 !important;
                    margin: 0;
                }
                
                .setup-guide-container .file-content .code-block code {
                    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
                    font-size: 12px;
                    color: #000000 !important;
                    display: block;
                    white-space: pre-wrap;
                    word-break: break-all;
                    line-height: 1.4;
                }
                
                /* General layout styles for setup guide */
                .setup-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    width: 100%;
                }
                
                .setup-section {
                    width: 100%;
                }
                
                /* Prerequisites List */
                .prerequisites-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 20px;
                }
                
                .prerequisite-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                }
                
                .prerequisite-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                
                /* Project Structure */
                .project-structure {
                    margin-top: 20px;
                }
                
                /* Installation Steps */
                .installation-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-top: 20px;
                }
                
                .step-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }
                
                .step-number {
                    background: var(--authlete-blue);
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .code-block {
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius);
                    padding: 16px;
                    position: relative;
                }
                
                .code-block .copy-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .code-block .copy-btn:hover {
                    background: var(--authlete-blue-hover);
                }
                
                /* Next Steps List */
                .next-steps-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }
                
                .next-step-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                }
                
                .step-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                /* Setup Actions */
                .setup-actions {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 24px;
                    border-top: 1px solid var(--authlete-gray-200);
                }
                
                /* Credentials Display */
                .credentials-display {
                    margin-top: 20px;
                }
                
                .credentials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }
                
                .credential-group {
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    padding: 20px;
                }
                
                .credential-items {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .credential-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
                
                .credential-item .copy-btn {
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    flex-shrink: 0;
                }
                
                .credential-item .copy-btn:hover {
                    background: var(--authlete-blue-hover);
                }
                
                /* File Implementation Guide */
                .file-implementation-guide {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    margin-top: 20px;
                }
                
                .file-guide-item {
                    background: white;
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow);
                }
                
                .file-header {
                    background: var(--authlete-gray-50);
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--authlete-gray-200);
                }
                
                .file-content {
                    padding: 20px;
                }
                
                .file-content .code-block {
                    background: var(--authlete-gray-50);
                    border: 1px solid var(--authlete-gray-200);
                    border-radius: var(--border-radius);
                    padding: 16px;
                    position: relative;
                    margin: 0;
                }
                
                .file-content .code-block .copy-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: var(--authlete-blue);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .file-content .code-block .copy-btn:hover {
                    background: var(--authlete-blue-hover);
                }
            </style>
        </head>
        <body>
            <div class="layout">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-header">
                        <div class="logo">
                            <div class="logo-icon">A</div>
                            <div class="logo-text">Authlete</div>
                        </div>
                        <div class="sidebar-subtitle">OAuth Onboarding</div>
                    </div>
                    
                    <nav class="nav-menu">
                        ${onboardingSteps.map((step, index) => `
                            <button class="nav-item ${index === 0 ? 'active' : ''}" onclick="window.showStep && window.showStep(${step.id})" id="nav-${step.id}">
                                <div class="nav-icon">${step.icon}</div>
                                <div class="nav-content">
                                    <h3>${step.title}</h3>
                                    <p>${step.description}</p>
                                </div>
                            </button>
                            ${step.id === 5 ? `
                                <div class="nav-endpoints">
                                    <div class="nav-endpoint" onclick="showStepExplanation('authorization')">
                                        <div class="nav-icon">🔐</div>
                                        <div class="nav-content">
                                            <h3>Authorization</h3>
                                            <p>POST /auth/authorization</p>
                                        </div>
                                    </div>
                                    <div class="nav-endpoint" onclick="showStepExplanation('consent')">
                                        <div class="nav-icon">✅</div>
                                        <div class="nav-content">
                                            <h3>Grant Consent</h3>
                                            <p>POST /auth/authorization/issue</p>
                                        </div>
                                    </div>
                                    <div class="nav-endpoint" onclick="showStepExplanation('token')">
                                        <div class="nav-icon">🔑</div>
                                        <div class="nav-content">
                                            <h3>Exchange Token</h3>
                                            <p>POST /auth/token</p>
                                        </div>
                                    </div>
                                    <div class="nav-endpoint" onclick="showStepExplanation('introspection')">
                                        <div class="nav-icon">🔍</div>
                                        <div class="nav-content">
                                            <h3>Access API</h3>
                                            <p>POST /auth/introspection</p>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        `).join('')}
                    </nav>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <div class="main-header">
                        <h1 id="main-title"></h1>
                        <div class="subtitle" id="main-subtitle"></div>
                    </div>
                    
                    <div class="content-area" id="content-area">
                        <div class="docs-wrapper">
                            <div class="docs-grid" id="docs-grid">
                                <div class="docs-content">
                        ${onboardingSteps[0].content}
                </div>
                
                                <div class="code-column" id="code-column" style="display: none;">
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
                                                <pre class="code-block language-typescript" id="code-block"><code class="language-typescript">${onboardingSteps[0].code}</code></pre>
                                                <pre class="code-block language-bash" id="curl-block" style="display: none;"><code class="language-bash"># Step 1: Authorization Request
curl -X POST https://api.authlete.com/api/auth/authorization \\
  -H "Authorization: Bearer YOUR_SERVICE_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "parameters": "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fcallback&scope=read&state=demo123"
  }'</code></pre>
                                            </div>
                                        </div>
                                        
                    <div class="run-section">
                        <button class="run-btn" onclick="runCurrentDemo()" id="run-demo-btn" disabled>Run Sample</button>
                    </div>
                                        
                                        <!-- OUTPUT CONSOLE - MINIMAL AND CLEAN -->
                                        <div class="output-section">
                                            <div class="output-label">Output Console</div>
                        <div class="output-console" id="output-console">
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
                    </div>
                </div>
            </div>
            <button id="next-step-btn" onclick="goToNextDemoStep()" style="position: fixed; right: 32px; bottom: 32px; display: none; align-items: center; gap: 8px; background: #1a56db; color: white; border: none; padding: 12px 16px; border-radius: 9999px; box-shadow: 0 6px 16px rgba(26,86,219,0.25); cursor: pointer; z-index: 999; font-family: inherit; font-size: 14px; font-weight: 500;">
                Next →
            </button>
            <button id="back-step-btn" onclick="goToPreviousDemoStep()" style="position: fixed; left: 32px; bottom: 32px; display: none; align-items: center; gap: 8px; background: #6b7280; color: white; border: none; padding: 12px 16px; border-radius: 9999px; box-shadow: 0 6px 16px rgba(107,114,128,0.25); cursor: pointer; z-index: 999; font-family: inherit; font-size: 14px; font-weight: 500;">
                ← Back
            </button>
        
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Authlete Complete Onboarding Guide running on http://localhost:${PORT}`);
    console.log('✨ Users can now create services and clients directly from the interface');
    console.log('🎯 Complete OAuth flow with their actual credentials');
}); 