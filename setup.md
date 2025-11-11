# Authlete OAuth Demo - Setup Guide

## Quick Start

### 1. Install the Package
```bash
npm install authlete-oauth-demo
```

### 2. Get Authlete Credentials
1. Sign up at [Authlete Management Console](https://console.authlete.com/)
2. Create a new service
3. Create a new client application
4. Copy your credentials

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual Authlete credentials
```

### 4. Run the Demos

**OAuth 2.0 Flow Demo:**
```bash
npm start
# Visit http://localhost:3004
```

**PAR (Pushed Authorization Request) Demo:**
```bash
npm run start:par
# Visit http://localhost:3006
```

**Run Both Demos:**
```bash
npm run start:both
```

## What's Included

### 1. OAuth 2.0 Authorization Code Flow
- Complete OAuth 2.0 implementation
- Interactive web interface
- Step-by-step tutorial
- Live API execution
- Real-time response display

### 2. PAR (Pushed Authorization Request) Implementation
- RFC 9126 compliant PAR implementation
- Interactive tutorial with live execution
- Step-by-step flow demonstration
- Complete OAuth flow with PAR

## Features

✅ **Interactive Web Interface** - Beautiful, modern UI with real-time execution
✅ **Live API Calls** - Execute actual Authlete API calls in real-time
✅ **Step-by-Step Tutorials** - Learn OAuth and PAR implementation
✅ **Complete OAuth Flow** - Authorization, consent, token exchange, introspection
✅ **PAR Implementation** - Pushed Authorization Request (RFC 9126)
✅ **Error Handling** - Comprehensive error handling and debugging
✅ **Documentation** - Detailed explanations and code examples

## Ports Used

- **3004**: OAuth 2.0 Flow Demo
- **3006**: PAR Tutorial Demo

## Requirements

- Node.js 16+
- Authlete account and credentials
- Modern web browser

## Support

- [Authlete Documentation](https://docs.authlete.com/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PAR RFC 9126](https://tools.ietf.org/html/rfc9126) 