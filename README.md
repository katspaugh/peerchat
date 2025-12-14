# P2P Chat - WebRTC Communication

A modern peer-to-peer chat and video calling application using WebRTC. Built with TypeScript, React, and Tailwind CSS following clean architecture principles.

## Features

- 🔒 **Direct P2P Connection** - No intermediary servers
- 💬 **Real-time Messaging** - Instant chat via WebRTC Data Channels
- 📹 **Video Calling** - HD video and audio streaming
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- 🔧 **Type-Safe** - Full TypeScript implementation
- 🌐 **STUN Server** - Uses Google's public STUN servers
- ⚡ **Fast** - Built with Vite

## How It Works

**Simple Code Exchange Flow:**

1. **User A** clicks "Start New Session" and gets a shareable link
2. **User A** shares the link with **User B**
3. **User B** opens the link and receives a code
4. **User B** sends the code back to **User A**
5. **User A** pastes the code and clicks "Connect"
6. ✅ **Connected!** - Start chatting
7. 📹 **Optional** - Click "Start Video Call" for video chat

**No signaling server required** - connection established through simple code exchange.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

## Testing Locally

1. **Window 1 (User A)**:
   - Open http://localhost:5173
   - Click "Start New Session"
   - Copy the link

2. **Window 2 (User B)**:
   - Paste and open the link in a new window/incognito
   - Copy the code that appears

3. **Window 1 (User A)**:
   - Paste the code from User B
   - Click "Connect"

4. **Both Windows**:
   - Chat is now active!
   - Click "Start Video Call" to enable video

## Technology Stack

- **React 19** - UI framework with hooks
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with CSS variables
- **shadcn/ui** - Component library
- **WebRTC** - P2P communication
- **Vite** - Build tool and dev server

## Architecture

### Clean Architecture Principles

- **Services Layer** - Pure business logic (WebRTC, signaling, messages, media)
- **Hooks Layer** - React state management
- **Components Layer** - Presentational UI components
- **Types Layer** - TypeScript definitions

### Project Structure

```
src/
├── services/          # Business logic (no React)
│   ├── webrtc.service.ts
│   ├── signaling.service.ts
│   ├── message.service.ts
│   └── media.service.ts
├── hooks/             # React state management
│   ├── usePeerConnection.ts
│   ├── useDataChannel.ts
│   └── useMediaStream.ts
├── components/        # UI components
│   ├── ui/           # shadcn/ui components
│   ├── ConnectionStatus.tsx
│   ├── ChatInterface.tsx
│   └── VideoCall.tsx
├── types/            # TypeScript definitions
│   └── index.ts
└── App.tsx           # Main application
```

## Key Features

- ✅ **Declarative Code** - Functional programming style
- ✅ **Separation of Concerns** - Logic separated from presentation
- ✅ **CSS Theme System** - Customizable via CSS variables
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Component Library** - Polished UI with shadcn/ui

## Limitations

- Two-peer connections only
- No TURN server (may not work behind symmetric NATs)
- No message persistence
- Requires browser windows to remain open
- Modern browser required (WebRTC support)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)

Requires WebRTC support (all modern browsers).
