# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository connected
- MongoDB Atlas account (for database)
- Environment variables ready

## Quick Deploy

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select your repository: `Reedddeb-12/iot-drone-defense-system`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `./`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # Email (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Twilio SMS
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   
   # AWS S3 (optional)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your_bucket_name
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live!

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd iot-based-drone-defence-system-main
   vercel
   ```

4. **Follow prompts**
   - Set up and deploy? Yes
   - Which scope? Your account
   - Link to existing project? No
   - Project name? iot-drone-defense-system
   - Directory? ./
   - Override settings? No

5. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add TWILIO_PHONE_NUMBER
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Username: `dronedefense`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

4. **Whitelist IP Address**
   - Go to Network Access
   - Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0`
   - (For production, use specific IPs)

5. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Use this as `MONGODB_URI` environment variable

## Environment Variables Explained

### Required Variables
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Random secret key (generate with: `openssl rand -base64 32`)
- `EMAIL_USER`: Gmail address for sending alerts
- `EMAIL_PASS`: Gmail App Password (not regular password)

### Optional Variables
- `TWILIO_ACCOUNT_SID`: For SMS alerts
- `TWILIO_AUTH_TOKEN`: For SMS alerts
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `AWS_ACCESS_KEY_ID`: For S3 file storage
- `AWS_SECRET_ACCESS_KEY`: For S3 file storage
- `AWS_BUCKET_NAME`: S3 bucket name

## Gmail App Password Setup

1. Go to Google Account Settings
2. Security → 2-Step Verification (enable it)
3. App Passwords
4. Select app: Mail
5. Select device: Other (Custom name)
6. Name it: "Drone Defense System"
7. Copy the 16-character password
8. Use this as `EMAIL_PASS`

## Vercel Domain

After deployment, your site will be available at:
- `https://iot-drone-defense-system.vercel.app`
- Or your custom domain

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your domain
4. Follow DNS configuration instructions

## Testing Deployment

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for errors
4. Test camera access
5. Test AI detection
6. Test mobile alerts

## Troubleshooting

### Camera Not Working
- Vercel requires HTTPS (camera access works)
- Check browser permissions

### Backend API Errors
- Verify environment variables are set
- Check MongoDB connection string
- Review Vercel function logs

### Build Errors
- Check `vercel.json` configuration
- Ensure all dependencies in `package.json`
- Review build logs in Vercel dashboard

## Monitoring

- **Vercel Dashboard**: View deployment logs
- **Analytics**: Monitor traffic and performance
- **Function Logs**: Debug backend issues

## Updating Deployment

Push changes to GitHub:
```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel will automatically redeploy!

## Cost

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Gmail**: Free
- **Twilio**: Pay-as-you-go (SMS costs apply)

## Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- Issues: GitHub repository issues

---

**Your site will be live at:**
`https://iot-drone-defense-system-[random].vercel.app`

**Good luck with deployment!** 🚀
