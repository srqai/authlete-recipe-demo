# Authlete OAuth Demo

Complete OAuth 2.0 and PAR (Pushed Authorization Request) implementation demos using Authlete SDK.

## 🚀 Quick Start

```bash
# Install the package
npm install authlete-oauth-demo

# Configure your Authlete credentials
cp .env.example .env
# Edit .env with your actual Authlete credentials

# Run the OAuth 2.0 demo
npm start
# Visit http://localhost:3004

# Run the PAR demo
npm run start:par
# Visit http://localhost:3006
```

## 📖 What's Included

### 1. OAuth 2.0 Authorization Code Flow Demo
- **Interactive Web Interface** - Beautiful, modern UI with real-time execution
- **Complete OAuth Flow** - Authorization, consent, token exchange, introspection
- **Live API Calls** - Execute actual Authlete API calls in real-time
- **Step-by-Step Tutorial** - Learn OAuth implementation
- **Real-time Response Display** - See API responses instantly

### 2. PAR (Pushed Authorization Request) Demo
- **RFC 9126 Compliant** - Full PAR implementation
- **Interactive Tutorial** - Step-by-step PAR flow demonstration
- **Live Execution** - Execute PAR requests in real-time
- **Complete Flow** - From request URI creation to token exchange

## 🎯 Features

✅ **Interactive Web Interface** - Modern, responsive UI
✅ **Live API Execution** - Real Authlete API calls
✅ **Step-by-Step Tutorials** - Educational content
✅ **Complete OAuth Flow** - All OAuth 2.0 steps
✅ **PAR Implementation** - RFC 9126 compliant
✅ **Error Handling** - Comprehensive debugging
✅ **Documentation** - Detailed explanations

## 🔧 Setup

### Prerequisites
- Node.js 16+
- Authlete account ([Sign up here](https://console.authlete.com/))

### Installation
1. **Install the package:**
   ```bash
   npm install authlete-oauth-demo
   ```

2. **Get Authlete credentials:**
   - Sign up at [Authlete Management Console](https://console.authlete.com/)
   - Create a new service
   - Create a new client application
   - Copy your credentials

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual Authlete credentials
   ```

4. **Run the demos:**
   ```bash
   # OAuth 2.0 Flow Demo
   npm start
   # Visit http://localhost:3004

   # PAR Tutorial Demo
   npm run start:par
   # Visit http://localhost:3006

   # Run both demos
   npm run start:both
   ```

## 📋 Available Scripts

- `npm start` - Run OAuth 2.0 Flow Demo (port 3004)
- `npm run start:par` - Run PAR Tutorial Demo (port 3006)
- `npm run start:both` - Run both demos concurrently
- `npm run dev` - Run OAuth demo with auto-reload
- `npm run dev:par` - Run PAR demo with auto-reload

## 🌐 Ports Used

- **3004**: OAuth 2.0 Flow Demo
- **3006**: PAR Tutorial Demo

## 📚 Documentation

### OAuth 2.0 Flow
The OAuth 2.0 demo includes:
- Authorization endpoint (`/oauth/authorize`)
- Consent endpoint (`/oauth/consent`)
- Token endpoint (`/oauth/token`)
- Introspection endpoint (`/oauth/introspect`)

### PAR Implementation
The PAR demo includes:
- Push Authorization Request (`/pushed_auth_req`)
- Authorization with request URI
- Token exchange with authorization code
- Complete PAR flow demonstration

## 🔗 Resources

- [Authlete Documentation](https://docs.authlete.com/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PAR RFC 9126](https://tools.ietf.org/html/rfc9126)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- [Authlete Support](https://www.authlete.com/support/)
- [GitHub Issues](https://github.com/authlete/authlete-oauth-demo/issues) 