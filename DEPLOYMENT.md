# MindCare Backend - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Create `.env` file with production values
- [ ] Use strong `JWT_SECRET` (32+ characters, random)
- [ ] Use secure `ADMIN_PASSWORD`
- [ ] Configure production MongoDB URI (MongoDB Atlas recommended)
- [ ] Set up email service (Gmail App Password or SendGrid)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to your production domain

### 2. Security Hardening
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Whitelist IP addresses in MongoDB Atlas
- [ ] Review and update CORS settings
- [ ] Implement rate limiting (already configured)
- [ ] Consider implementing bcrypt for password hashing
- [ ] Review all exposed endpoints

### 3. Code Quality
- [ ] Remove all test files (`test-*.js`, `test-*.ps1`)
- [ ] Remove debug `console.log` statements
- [ ] Verify all dependencies are production-ready
- [ ] Run `npm audit` and fix vulnerabilities

## Deployment Options

### Option 1: PM2 (Recommended for VPS/EC2)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Application
```bash
# Production mode
pm2 start server.js --name mindcare-api -i max

# Save PM2 configuration
pm2 save

# Setup PM2 to restart on system reboot
pm2 startup
```

#### Monitor Application
```bash
pm2 status
pm2 logs mindcare-api
pm2 monit
```

#### Update Application
```bash
git pull
npm install
pm2 restart mindcare-api
```

### Option 2: Docker

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Build and Run
```bash
docker build -t mindcare-backend .
docker run -d -p 5000:5000 --env-file .env mindcare-backend
```

### Option 3: Serverless (Vercel/Railway/Render)

#### For Vercel
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Deploy:
```bash
vercel --prod
```

## Environment Variables (Production)

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mindcare?retryWrites=true&w=majority

# Security
JWT_SECRET=your_very_long_and_random_secret_key_here_minimum_32_characters

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=Very$ecureP@ssw0rd!2024

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=MindCare <notifications@yourdomain.com>
```

## Nginx Configuration (if using reverse proxy)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Logging

### Health Checks
- Endpoint: `GET /api/health`
- Expected response: `200 OK`

### Recommended Monitoring Tools
- **PM2 Plus** - Application monitoring
- **New Relic** - Performance monitoring
- **Sentry** - Error tracking
- **Datadog** - Infrastructure monitoring

### Log Management
```bash
# PM2 logs
pm2 logs mindcare-api --lines 100

# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Database Backups (MongoDB Atlas)

1. Enable automated backups in MongoDB Atlas
2. Set retention period (7-30 days recommended)
3. Test restore procedure
4. Download backups for local storage (optional)

## Performance Optimization

### 1. Enable Compression
Add to `server.js`:
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Database Indexing
Already configured in `models/Waitlist.js`

### 3. Caching (Optional)
Consider Redis for frequently accessed data

## Security Best Practices

### 1. Environment Variables
Never commit `.env` to version control

### 2. Rate Limiting
Already configured (5 requests per 15 minutes)

### 3. HTTPS Only
Use SSL/TLS certificates (Let's Encrypt recommended)

### 4. Update Dependencies
```bash
npm audit fix
npm update
```

### 5. Implement Password Hashing
For production, implement bcrypt for admin password:
```javascript
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

## Backup Strategy

1. **Database**: Automated daily backups via MongoDB Atlas
2. **Code**: Git repository (GitHub/GitLab)
3. **Environment**: Secure backup of `.env` file
4. **Documentation**: Keep deployment notes updated

## Rollback Procedure

```bash
# Using PM2
pm2 stop mindcare-api
git checkout <previous-commit>
npm install
pm2 start mindcare-api

# Using Docker
docker pull mindcare-backend:<previous-tag>
docker stop <container-id>
docker run -d -p 5000:5000 mindcare-backend:<previous-tag>
```

## Testing Production Build

Before deploying:
```bash
# Run in production mode locally
NODE_ENV=production node server.js

# Test all endpoints
curl http://localhost:5000/api/health
```

## Support & Maintenance

- Monitor error logs daily
- Review MongoDB performance weekly
- Update dependencies monthly
- Test backups quarterly
- Security audit annually

## Common Issues & Solutions

### Issue: Server won't start
- Check `.env` file exists
- Verify MongoDB connection string
- Check port 5000 is not in use

### Issue: 401 Unauthorized
- Verify JWT_SECRET matches across deployments
- Check token expiration (24 hours)

### Issue: Email not sending
- Verify SMTP credentials
- Check Gmail "Less secure app access" or use App Password
- Review firewall settings for port 587

### Issue: High memory usage
- Implement connection pooling
- Add response caching
- Review MongoDB queries

## Post-Deployment

1. Test all API endpoints
2. Verify email delivery
3. Check admin dashboard login
4. Monitor error logs for 24 hours
5. Set up uptime monitoring
6. Document any configuration changes

---

**Last Updated:** 2025
**Version:** 1.0.0
