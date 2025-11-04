# MindCare Backend API

Backend server for the MindCare landing page waitlist system.

## Features

- ✅ Email waitlist collection
- 📧 Automated welcome emails
- 📊 Waitlist statistics
- 🔒 Rate limiting & security
- 💾 MongoDB data storage
- ✉️ Email notifications

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mindcare
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MindCare <noreply@mindcare.com>
FRONTEND_URL=http://localhost:5173
```

### 3. Email Setup (Gmail Example)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Use the generated password in your `.env` file

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and add to `.env`

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Join Waitlist
```
POST /api/waitlist/join
Body: { "email": "user@example.com" }
```

### Get Statistics
```
GET /api/waitlist/stats
```

### Get All Entries (Admin)
```
GET /api/waitlist/all?page=1&limit=50
```

### Unsubscribe
```
POST /api/waitlist/unsubscribe
Body: { "email": "user@example.com" }
```

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (5 requests per 15 minutes)
- Email validation
- Input sanitization

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Join waitlist
curl -X POST http://localhost:5000/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get stats
curl http://localhost:5000/api/waitlist/stats
```

## Production Deployment

### Environment Variables
Make sure to set all production environment variables:
- Use strong passwords
- Use production MongoDB URI
- Set `NODE_ENV=production`
- Configure production CORS origins

### Recommended Hosting
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Database**: MongoDB Atlas
- **Email**: SendGrid, AWS SES, or Gmail

## Troubleshooting

**MongoDB Connection Failed**
- Check if MongoDB is running
- Verify connection string in `.env`

**Email Not Sending**
- Verify email credentials
- Check if less secure apps are allowed (Gmail)
- Use app-specific password

**CORS Errors**
- Update `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

## License

MIT
