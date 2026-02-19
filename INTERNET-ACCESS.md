# Internet Access Setup (Different Networks)

## 🌍 Access from Anywhere (Different WiFi/Mobile Data)

If your devices are on different networks, you need to expose your server to the internet using **ngrok**.

## 🚀 Quick Setup with ngrok

### Step 1: Install ngrok

#### Download:
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract the zip file
4. Move `ngrok.exe` to your project folder

#### Or use Chocolatey (Windows):
```powershell
choco install ngrok
```

### Step 2: Sign Up (Free)
1. Go to: https://dashboard.ngrok.com/signup
2. Create free account
3. Copy your authtoken

### Step 3: Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Start Your Server
```bash
npm start
```

Server should be running on port 3000.

### Step 5: Start ngrok
Open a NEW terminal/command prompt:
```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       your-email@gmail.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

### Step 6: Use the ngrok URL
Copy the `https://abc123.ngrok-free.app` URL and use it on ANY device, ANYWHERE!

## 📱 Access from Any Device

### On Your Phone (Mobile Data):
```
https://abc123.ngrok-free.app
```

### On Another Computer (Different WiFi):
```
https://abc123.ngrok-free.app
```

### On Tablet (Anywhere):
```
https://abc123.ngrok-free.app
```

## ✅ Complete Example

### Terminal 1 (Server):
```bash
cd iot-based-drone-defence-system-main
npm start
```

Output:
```
Server running on:
  Local:    http://localhost:3000
  Network:  http://192.168.56.1:3000
```

### Terminal 2 (ngrok):
```bash
ngrok http 3000
```

Output:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

### On Any Device:
Open browser → `https://abc123.ngrok-free.app` → Start Detection → Email alerts work! ✉️

## 🔧 Update Config for ngrok

The system will automatically work with ngrok because it uses `window.location.origin`.

No code changes needed! 🎉

## 📊 How It Works

```
Your Computer (Server)
    ↓
http://localhost:3000
    ↓
ngrok Tunnel
    ↓
https://abc123.ngrok-free.app (Public URL)
    ↓
Internet
    ↓
Any Device Anywhere
```

## 🎯 Benefits of ngrok

✅ **Works from anywhere** - Different WiFi, mobile data, anywhere
✅ **HTTPS included** - Secure connection, camera works on mobile
✅ **No firewall config** - No port forwarding needed
✅ **Free tier available** - Good for testing
✅ **Easy setup** - Just one command

## ⚠️ Important Notes

### Free Tier Limitations:
- URL changes each time you restart ngrok
- 40 connections/minute limit
- Session timeout after 2 hours

### For Permanent URL:
Upgrade to ngrok paid plan ($8/month) for:
- Custom domain
- No timeout
- More connections

## 🔐 Security Considerations

### ngrok is Safe For:
✅ Testing and development
✅ Temporary access
✅ Personal use

### For Production:
Consider:
- VPS (DigitalOcean, AWS, etc.)
- Cloudflare Tunnel
- Your own domain with SSL

## 📱 Mobile Camera Access

With ngrok's HTTPS URL, mobile browsers can access the camera!

### Before (localhost):
❌ Mobile camera blocked (no HTTPS)

### After (ngrok):
✅ Mobile camera works (HTTPS enabled)

## 🧪 Testing

### Test Server Access:
```
https://your-ngrok-url.ngrok-free.app/api/test
```

Should return:
```json
{
  "status": "Server is running",
  "timestamp": "..."
}
```

### Test Email:
1. Open ngrok URL on any device
2. Click "Test Email Alert"
3. Check your inbox

## 🔄 Alternative Solutions

### 1. Cloudflare Tunnel (Free, Permanent)
```bash
# Install cloudflared
# Run: cloudflared tunnel --url http://localhost:3000
```

### 2. localtunnel (Free, Simple)
```bash
npm install -g localtunnel
lt --port 3000
```

### 3. serveo (Free, No Install)
```bash
ssh -R 80:localhost:3000 serveo.net
```

### 4. VPS Hosting (Paid, Professional)
- DigitalOcean: $5/month
- AWS EC2: Free tier available
- Heroku: Free tier available

## 💡 Recommended Setup

### For Testing (Free):
```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000
```

### For Production:
1. Get a VPS (DigitalOcean, AWS)
2. Deploy your code
3. Use your own domain
4. Set up SSL certificate

## 📋 Step-by-Step Guide

### 1. Download ngrok
```
https://ngrok.com/download
```

### 2. Extract to Project Folder
```
iot-based-drone-defence-system-main/
├── ngrok.exe  ← Put here
├── server.js
└── ...
```

### 3. Get Auth Token
```
https://dashboard.ngrok.com/get-started/your-authtoken
```

### 4. Configure
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### 5. Start Server
```bash
npm start
```

### 6. Start ngrok (New Terminal)
```bash
ngrok http 3000
```

### 7. Copy URL
```
https://abc123.ngrok-free.app
```

### 8. Share URL
Send this URL to any device, anywhere!

## 🎉 You're Done!

Now you can:
- ✅ Access from any device
- ✅ Use mobile data or different WiFi
- ✅ Share with others
- ✅ Email alerts work everywhere
- ✅ Mobile camera works (HTTPS)

## 🆘 Troubleshooting

### ngrok Not Found?
```bash
# Add to PATH or use full path
./ngrok http 3000
```

### URL Changes Every Time?
- Free tier = new URL each restart
- Paid tier = custom domain

### Connection Timeout?
- Free tier = 2 hour limit
- Restart ngrok to get new session

### Too Many Connections?
- Free tier = 40/minute
- Upgrade for more

## 📞 Support

### ngrok Help:
- Docs: https://ngrok.com/docs
- Dashboard: https://dashboard.ngrok.com

### Alternative Tools:
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- localtunnel: https://localtunnel.github.io/www/

---

**Quick Command:**
```bash
ngrok http 3000
```

**Then use the HTTPS URL on any device!** 🌍
