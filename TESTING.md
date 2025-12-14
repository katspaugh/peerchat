# Testing P2P Chat

## Quick Test Guide

### Method 1: Two Browser Windows (Easiest)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Window 1 (User A):**
   - Navigate to http://localhost:5173
   - Click "Start New Session"
   - Copy the link that appears

3. **Window 2 (User B):**
   - Open a new browser window or incognito mode
   - Paste and open the link from Window 1
   - Copy the code that appears

4. **Back to Window 1 (User A):**
   - Paste the code from Window 2
   - Click "Connect"

5. **Connected!**
   - Both windows should show "Connected" status
   - Start chatting!
   - Click "Start Video Call" to enable video

### Method 2: Two Different Devices

1. **Start server with network access:**
   ```bash
   npm run dev -- --host
   ```

2. **Get your local IP:**
   - Look for the "Network" URL in the terminal
   - Example: http://192.168.1.10:5173

3. **Follow Method 1 steps** but use the network URL instead of localhost

### Expected Behavior

**Connection Status:**
- Disconnected (red)
- Creating Offer
- Waiting for Code
- Connecting
- Connected (green)

**User A Flow:**
1. Click "Start New Session"
2. Copy and share the link
3. Wait for code from User B
4. Paste code and click "Connect"
5. ✅ Connected!

**User B Flow:**
1. Open link from User A
2. Copy the code that appears
3. Send code to User A
4. Wait for connection
5. ✅ Connected!

**Chat Features:**
- Real-time messaging
- Timestamps on all messages
- Clean, modern UI
- Message differentiation (you vs. remote)

**Video Features:**
- Click "Start Video Call" button
- Camera and microphone access requested
- Local and remote video feeds
- Video streams in separate cards

### Troubleshooting

**Connection not establishing:**
- Check browser console for errors (F12)
- Ensure both users completed their steps
- Try refreshing and starting over
- Verify WebRTC support in browser

**"Invalid code" error:**
- Make sure code was copied correctly
- Ensure no extra spaces before/after code
- Verify User B sent the code, not the link

**Messages not sending:**
- Verify connection status is "Connected"
- Check browser console for data channel errors
- Ensure you're not behind a symmetric NAT

**Video call not working:**
- Grant camera/microphone permissions
- Check device privacy settings
- Verify devices are available (not in use elsewhere)
- Try in a different browser

**Code not appearing for User B:**
- Ensure the link was opened correctly
- Check browser console for errors
- Verify the link includes the # fragment
- Try generating a new session

### Browser Compatibility

**Fully Tested:**
- ✅ Chrome/Edge (Chromium 90+)
- ✅ Firefox (88+)
- ✅ Safari (macOS/iOS 14+)

**Requirements:**
- WebRTC support
- Modern JavaScript (ES2020)
- Media devices for video calling

### Network Requirements

**Will work:**
- Direct connections
- Most home networks
- Public WiFi (most cases)

**May not work:**
- Corporate networks with strict firewalls
- Symmetric NATs
- VPNs with restrictive settings

**Note:** This app uses STUN only (no TURN server). Some network configurations may prevent connections.

### Testing Checklist

- [ ] Create session (User A)
- [ ] Copy link
- [ ] Open link (User B)
- [ ] Copy code
- [ ] Paste code (User A)
- [ ] Connection establishes
- [ ] Send message (User A)
- [ ] Receive message (User B)
- [ ] Send message (User B)
- [ ] Receive message (User A)
- [ ] Start video call
- [ ] Camera permissions granted
- [ ] Local video visible
- [ ] Remote video visible
- [ ] Messages work during video

### Performance Tips

**For best experience:**
- Use wired internet connection
- Close unnecessary browser tabs
- Grant permissions when prompted
- Use modern browser versions
- Test on same network first

### Debug Mode

**Enable verbose logging:**
1. Open browser console (F12)
2. Look for WebRTC messages
3. Check for errors in red
4. Monitor connection state changes

**Common console messages:**
- "Data channel opened" - Chat ready
- "Received remote track" - Video incoming
- "ICE gathering complete" - Ready to connect
