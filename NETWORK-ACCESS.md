# Network Access Guide

## 🌐 Accessing from Other Devices

The server is now configured to accept connections from other devices on your network.

## 📱 How to Access

### From the Same Computer:
```
http://localhost:3000
```

### From Other Devices (Phone, Tablet, Another PC):
```
http://192.168.56.1:3000
```
(Replace with your actual network IP shown when server starts)

## 🔧 Setup Steps

### 1. Start the Server
```bash
npm start
```

Look for the network IP in the output:
```
Server running on:
  Local:    http://localhost:3000
  Network:  http://192.168.56.1:3000  ← Use this on other devices
```

### 2. Configure Firewall

#### Windows:
```powershell
# Allow port 3000 through firewall
netsh advfirewall firewall add rule name="Drone Defense System" dir=in action=allow protocol=TCP localport=3000
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter "3000" → Next
6. Allow the connection → Next
7. Name it "Drone Defense System" → Finish

#### Mac:
```bash
# Firewall usually allows by default
# If blocked, go to System Preferences → Security & Privacy → Firewall
```

#### Linux:
```bash
sudo ufw allow 3000
```

### 3. Connect from Other Device

On your phone/tablet/other PC:
1. Connect to the same WiFi network
2. Open browser
3. Go to: `http://192.168.56.1:3000` (use your network IP)
4. Click "Start Detection"
5. Allow camera access
6. Threats will be emailed automatically!

## 🔍 Find Your Network IP

### Windows:
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter

### Mac/Linux:
```bash
ifconfig
```
Look for "inet" address (not 127.0.0.1)

### From Server Output:
The server automatically displays your network IP when it starts!

## ✅ Verification

### Test Server Connection:
From another device, open:
```
http://YOUR_IP:3000/api/test
```

You should see:
```json
{
  "status": "Server is running",
  "timestamp": "2024-02-19T..."
}
```

## 🚨 Troubleshooting

### Can't Connect from Other Device?

**1. Check Same Network**
- Both devices must be on the same WiFi network
- Don't use mobile data on phone

**2. Check Firewall**
```powershell
# Windows - Check if port is open
netstat -an | findstr :3000
```

**3. Check Server is Running**
- Server must be running on main computer
- Look for "Server running on..." message

**4. Try Different Browser**
- Chrome (recommended)
- Firefox
- Safari

**5. Check IP Address**
- Use the exact IP shown in server output
- Don't use localhost on other devices

### Email Not Sending from Other Device?

**Check Console (F12):**
- Look for network errors
- Should see "Email sent successfully"

**Verify Server URL:**
The system now auto-detects the correct server URL based on where you access from.

### Camera Not Working on Mobile?

**HTTPS Required:**
Mobile browsers require HTTPS for camera access. Options:

1. **Use Desktop Browser** (recommended for testing)
2. **Set up HTTPS** (for production)
3. **Use ngrok** (for temporary public access)

## 🔐 Security Notes

### Local Network Only
- Server is accessible only on your local network
- Not accessible from internet (safe)
- Only devices on same WiFi can connect

### For Public Access (Advanced)
If you need internet access, use:
- **ngrok**: `ngrok http 3000`
- **Cloudflare Tunnel**
- **VPN**

⚠️ Not recommended for production without proper security!

## 📊 Network Architecture

```
Main Computer (Server)
├── http://localhost:3000 (local access)
└── http://192.168.x.x:3000 (network access)
    ├── Phone (same WiFi)
    ├── Tablet (same WiFi)
    └── Other PC (same WiFi)
```

## 🎯 Common Scenarios

### Scenario 1: Monitor from Phone
1. Start server on PC
2. Note network IP (e.g., 192.168.1.100:3000)
3. Open on phone browser
4. Use phone camera for detection
5. Emails sent to configured address

### Scenario 2: Multiple Cameras
1. Start server on main PC
2. Open on multiple devices
3. Each device uses its own camera
4. All send alerts to same email

### Scenario 3: Remote Monitoring
1. Set up on PC with webcam
2. Access from phone/tablet
3. Monitor camera feed remotely
4. Receive email alerts

## 💡 Tips

1. **Bookmark the URL** on your phone for quick access
2. **Keep server running** on main computer
3. **Use same WiFi** for all devices
4. **Check firewall** if connection fails
5. **Use Chrome** for best compatibility

## 📱 Mobile Browser Limitations

### Camera Access:
- ✅ Desktop browsers: Full camera access
- ⚠️ Mobile browsers: May require HTTPS
- ✅ Email alerts: Work on all devices

### Recommended:
- Use desktop browser for camera detection
- Use mobile browser for monitoring only
- Emails work from any device

---

**Your Network IP**: Check server output when starting
**Default Port**: 3000
**Firewall**: Must allow port 3000
