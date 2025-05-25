# Production Deployment Guide for bdGenAI

## 🚨 Critical Issues Fixed

The following issues have been identified and resolved that were causing API failures in production:

### 1. **CORS Configuration Issues**
- **Problem**: Hardcoded localhost origins in middleware
- **Fix**: Updated `middleware.ts` with flexible origin handling
- **Impact**: API calls from production domain were being blocked

### 2. **Server Actions Configuration**
- **Problem**: Limited `allowedOrigins` in `next.config.js`
- **Fix**: Added production domains and wildcard support
- **Impact**: Server actions were failing in production

### 3. **Missing Runtime Configuration**
- **Problem**: Some API routes running on Edge Runtime instead of Node.js
- **Fix**: Added `export const runtime = 'nodejs'` to critical routes
- **Impact**: bcrypt and database operations were failing

### 4. **Insufficient Error Handling**
- **Problem**: Generic error responses made debugging difficult
- **Fix**: Enhanced error handling with specific error types
- **Impact**: Better error diagnosis and user experience

## 🔧 Environment Variables Checklist

Ensure these environment variables are set in your production environment:

### Required Variables
```env
# Database
DATABASE_URL="your-production-database-url"

# Authentication
NEXTAUTH_SECRET="your-secure-random-secret-32-chars-minimum"
NEXTAUTH_URL="https://bdgenai.com"  # or your production domain

# App Configuration
NEXT_PUBLIC_APP_URL="https://bdgenai.com"
NODE_ENV="production"
```

### Optional but Recommended
```env
# API Keys (if used)
ANTHROPIC_API_KEY="your-anthropic-key"
DEEPSEEK_API_KEY="your-deepseek-key"
RESEND_API_KEY="your-resend-key"

# OAuth Providers (if used)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## 🧪 Testing Your Production Deployment

### 1. Use the Production Test Endpoint
After deployment, visit: `https://your-domain.com/api/production-test`

This will test:
- Environment variables
- Database connection
- Authentication system
- Database write operations
- Request headers and CORS

### 2. Manual API Testing
Test critical endpoints:
```bash
# Test authentication
curl -X GET "https://your-domain.com/api/production-test"

# Test course creation (requires authentication)
curl -X POST "https://your-domain.com/api/courses" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"title":"Test Course"}'

# Test chapter creation (requires authentication)
curl -X POST "https://your-domain.com/api/courses/COURSE_ID/chapters" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"title":"Test Chapter"}'
```

## 🚀 Deployment Steps

### 1. Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Build completes without errors (`npm run build`)
- [ ] No critical TypeScript errors

### 2. Post-deployment Verification
- [ ] Visit `/api/production-test` and verify all tests pass
- [ ] Test user authentication flow
- [ ] Test course creation
- [ ] Test chapter creation/editing
- [ ] Check server logs for errors

### 3. Common Deployment Platforms

#### Vercel
```bash
# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy
vercel --prod
```

#### Netlify
```bash
# Set environment variables in Netlify dashboard
# Deploy
netlify deploy --prod
```

#### Docker/VPS
```bash
# Create .env.production file
# Build and run
docker build -t bdgenai .
docker run -p 3000:3000 --env-file .env.production bdgenai
```

## 🐛 Troubleshooting Common Issues

### Issue: "Unauthorized" errors on API calls
**Cause**: Authentication not working in production
**Solutions**:
1. Check `NEXTAUTH_URL` matches your production domain
2. Verify `NEXTAUTH_SECRET` is set and secure
3. Check cookie settings for HTTPS

### Issue: "Database connection error"
**Cause**: Database not accessible from production
**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check database firewall settings
3. Ensure database accepts connections from your hosting provider

### Issue: "Internal Error" on API calls
**Cause**: Runtime or dependency issues
**Solutions**:
1. Check if API routes have `export const runtime = 'nodejs'`
2. Verify all dependencies are installed
3. Check server logs for specific errors

### Issue: CORS errors in browser
**Cause**: Cross-origin request blocking
**Solutions**:
1. Verify middleware CORS configuration
2. Check `next.config.js` headers configuration
3. Ensure production domain is in allowed origins

## 📊 Monitoring and Logging

### Enable Detailed Logging
The API routes now include comprehensive logging. Monitor these in your deployment platform:

```bash
# Look for these log patterns:
[CHAPTERS_CREATE] Starting chapter creation process
[CHAPTER_ID_DELETE] Chapter deleted successfully
[PRODUCTION_TEST] All tests passed
```

### Set Up Alerts
Configure alerts for:
- 500 Internal Server Errors
- Database connection failures
- Authentication failures
- High response times

## 🔒 Security Considerations

### Production Security Checklist
- [ ] `NEXTAUTH_SECRET` is cryptographically secure (32+ characters)
- [ ] Database credentials are secure and rotated regularly
- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enforced
- [ ] CORS is properly configured (not using `*` for credentials)

### Environment Variable Security
- Never commit `.env` files to version control
- Use your platform's secure environment variable storage
- Rotate secrets regularly
- Use different secrets for different environments

## 📞 Getting Help

If you're still experiencing issues after following this guide:

1. **Check the production test endpoint**: `/api/production-test`
2. **Review server logs** for specific error messages
3. **Verify environment variables** are correctly set
4. **Test API endpoints manually** using curl or Postman
5. **Check database connectivity** from your hosting environment

## 🎯 Quick Fix Summary

The main fixes applied:

1. **Updated `middleware.ts`**: Better CORS handling for production domains
2. **Updated `next.config.js`**: Added production domains to server actions
3. **Added runtime exports**: Ensured Node.js runtime for database operations
4. **Enhanced error handling**: Better error messages for debugging
5. **Created test endpoint**: `/api/production-test` for easy diagnosis

Your API should now work correctly in production! 🎉 