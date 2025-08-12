# Troubleshooting Guide

## "TypeError: Failed to fetch" Error

This error typically occurs due to network connectivity issues or CORS (Cross-Origin Resource Sharing) problems. Here are the solutions implemented:

### Fixes Applied:

1. **Enhanced Error Handling**: Added specific error messages for different types of network failures
2. **Retry Mechanism**: Automatic retry with exponential backoff (3 attempts)
3. **Timeout Handling**: 30-second timeout for requests to prevent hanging
4. **CORS Configuration**: Added proper CORS headers in Next.js configuration
5. **Fallback URLs**: Support for multiple API endpoints if primary fails
6. **Better User Feedback**: Clear error messages explaining the issue

### Manual Troubleshooting Steps:

1. **Check Internet Connection**: Ensure you have a stable internet connection
2. **Disable Browser Extensions**: Some ad blockers or security extensions may block requests
3. **Clear Browser Cache**: Clear browser cache and cookies
4. **Try Different Browser**: Test in an incognito/private window or different browser
5. **Check Firewall**: Ensure your firewall isn't blocking the requests
6. **VPN Issues**: If using a VPN, try disabling it temporarily

### Development Issues:

1. **Restart Development Server**: Stop and restart `npm run dev`
2. **Clear Next.js Cache**: Delete `.next` folder and restart
3. **Check Console**: Look for additional error messages in browser console
4. **Network Tab**: Check browser's Network tab for failed requests

### API Endpoint Status:

The application uses: `https://sheria-kiganjani-assistant-production.up.railway.app`

You can test the API directly:
```bash
curl -X POST "https://sheria-kiganjani-assistant-production.up.railway.app/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test@example.com&grant_type=password"
```

### Error Messages Explained:

- **"Network connection failed"**: Internet connectivity issue
- **"Request timed out"**: Server is slow or unresponsive
- **"Unable to connect after multiple attempts"**: Persistent network issues
- **"Invalid credentials"**: Wrong username/email combination
- **"Cross-origin request blocked"**: CORS policy issue

If the issue persists after trying these solutions, please check the browser console for additional error details. 