# Authlete OAuth Flow - Setup Instructions

## 🚨 Issue Identified

**Root Cause**: The Service Access Token is missing and cannot be obtained programmatically.

**Problem**: 
- Authlete OAuth endpoints require Bearer token authentication using a Service Access Token
- There is no public API endpoint to obtain Service Access Tokens using client credentials  
- This creates a chicken-and-egg problem where you need a token to call endpoints that would get you a token

## ✅ Solution

### Step 1: Get Service Access Token from Management Console

1. **Log into Authlete Management Console**: https://console.authlete.com
2. **Navigate to your service**: Look for service ID `YOUR_SERVICE_ID`
3. **Find Service Access Token section**: Look for "Service Access Token", "API Token", or "Bearer Token"
4. **Generate/Copy the token**: It will be a long JWT-style token starting with `ey...`

### Step 2: Update Your Application

Replace the placeholder in `authlete-onboarding-guide.js`:

```javascript
// Find this line around line 34:
const SERVICE_ACCESS_TOKEN = "YOUR_SERVICE_ACCESS_TOKEN";

// Replace with your actual token:
const SERVICE_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6..."; // Your actual token
```

### Step 3: Test the Fixed Flow

```bash
# Restart your server
cd /path/to/authlete-recipe-demo
node src/authlete-onboarding-guide.js
```

## 🧪 Test with cURL (After Getting Token)

Once you have the Service Access Token, test the flow:

```bash
# Set your token
export SAT="your_service_access_token_here"

# Test 1: Authorization Request
curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization" \
  -H "Authorization: Bearer $SAT" \
  -H "Content-Type: application/json" \
  -d '{"parameters": "response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=read&state=demo123"}'

# Test 2: Issue Authorization Code (if step 1 returns a ticket)
curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/authorization/issue" \
  -H "Authorization: Bearer $SAT" \
  -H "Content-Type: application/json" \
  -d '{"ticket": "TICKET_FROM_STEP_1", "subject": "user-123"}'

# Test 3: Exchange for Access Token
curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/token" \
  -H "Authorization: Bearer $SAT" \
  -H "Content-Type: application/json" \
  -d '{"clientId": "YOUR_CLIENT_ID", "clientSecret": "YOUR_CLIENT_SECRET", "parameters": "grant_type=authorization_code&code=CODE_FROM_STEP_2&redirect_uri=http://localhost:3000/callback"}'

# Test 4: Introspect Token
curl -X POST "https://us.authlete.com/api/YOUR_SERVICE_ID/auth/introspection" \
  -H "Authorization: Bearer $SAT" \
  -H "Content-Type: application/json" \
  -d '{"token": "ACCESS_TOKEN_FROM_STEP_3"}'
```

## 📋 Current Configuration

**Service Details:**
- Service ID: `YOUR_SERVICE_ID`
- Service Secret: `YOUR_SERVICE_SECRET`
- Client ID: `YOUR_CLIENT_ID`
- Client Secret: `YOUR_CLIENT_SECRET`

**API Endpoints:**
- Base URL: `https://us.authlete.com`
- Authorization: `/api/{serviceId}/auth/authorization`
- Issue Code: `/api/{serviceId}/auth/authorization/issue`
- Token: `/api/{serviceId}/auth/token`
- Introspection: `/api/{serviceId}/auth/introspection`

## 🎯 Next Steps

1. Get the Service Access Token from the Management Console
2. Update the `SERVICE_ACCESS_TOKEN` constant in your code
3. Restart the server
4. Test the OAuth flow in the web interface
5. The flow should now work end-to-end!

## 🔍 Architecture Notes

**Authlete's Design:**
- Service Access Tokens are administrative tokens for calling Authlete APIs
- They are NOT the same as OAuth access tokens issued to client applications
- They must be obtained through the Management Console (manually)
- They authenticate your authorization server when calling Authlete APIs

**This is why you were seeing:**
- `client_id=null` - The SDK wasn't getting proper service authentication
- `"No client has the client ID"` - The requests weren't properly authenticated to access client data
- 404/authentication errors - No valid Service Access Token was provided 