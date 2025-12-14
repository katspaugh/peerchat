# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P2P Chat is a peer-to-peer chat and video calling application using WebRTC. The app uses a simple code-exchange flow for connection establishment.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Vite

## Architecture Principles

This codebase follows these key principles:

1. **Declarative/Functional Style**: Pure functions, no imperative mutations
2. **Separation of Concerns**: Business logic in services, state management in hooks, UI in components
3. **CSS Variables**: Theme system using Tailwind v4's @theme directive
4. **Component Library**: shadcn/ui for UI components

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm preview
```

## Connection Flow

Simple two-step process:

1. **User A**: Creates session → Gets shareable link
2. **User B**: Opens link → Gets code → Sends code to User A
3. **User A**: Pastes code → Connection established
4. **Both users**: Can now chat and start video calls

## Code Organization

### Services (`src/services/`)

Pure business logic, no React dependencies:

- `webrtc.service.ts` - RTCPeerConnection management, offer/answer creation, ICE gathering
- `signaling.service.ts` - Encode/decode offers and answers, URL generation
- `message.service.ts` - Message formatting, serialization, timestamp formatting
- `media.service.ts` - MediaStream management (camera/microphone access)

### Hooks (`src/hooks/`)

React state management using services:

- `usePeerConnection.ts` - Manages RTCPeerConnection lifecycle and state
- `useDataChannel.ts` - Handles data channel creation and messaging
- `useMediaStream.ts` - Manages local and remote media streams

### Components (`src/components/`)

Presentational components, minimal logic:

- `ui/` - shadcn/ui components (Button, Card, Input, Badge)
- `ConnectionStatus.tsx` - Status badge component
- `ChatInterface.tsx` - Chat UI with messages and input
- `VideoCall.tsx` - Video feed display with refs

### Types (`src/types/`)

TypeScript definitions for the entire application.

## Key Implementation Details

**Connection State Flow:**
```
disconnected → creating-offer → waiting-for-code → connecting → connected
```

**Service Layer Pattern:**
- Services are classes with static and instance methods
- No React dependencies - can be unit tested easily
- Separation allows reuse across different UI frameworks

**Hook Pattern:**
- Hooks use services for business logic
- Manage React state and side effects
- Return values and callbacks to components

**Declarative Event Handling:**
- Event handlers are passed as callbacks via hooks
- No direct DOM manipulation or imperative event listeners in components
- Cleanup is automatic via useEffect

**CSS Theme System:**
- Tailwind v4 uses `@import "tailwindcss"` directive
- Custom theme defined in `@theme` block with CSS variables
- Color names map to semantic meanings (primary, destructive, etc.)

## WebRTC Details

**STUN Server:** `stun:stun.l.google.com:19302`

**ICE Gathering:**
- Waits for complete ICE gathering before encoding offer/answer
- Uses Promise-based pattern with event listener cleanup

**Data Channel:**
- Initiator creates channel with label "chat"
- Joiner receives channel via `ondatachannel` event
- Messages are JSON-serialized MessageData objects

**Media Tracks:**
- Tracks added to existing peer connection when video call starts
- Remote tracks received via `ontrack` event
- Video elements use `srcObject` assignment in useEffect

## Common Tasks

**Adding a new service method:**
1. Add static or instance method to appropriate service class
2. Update types if needed
3. Use in hook layer

**Adding a new UI component:**
1. Create presentational component in `src/components/`
2. Use shadcn/ui components for consistency
3. Receive all data as props (no hooks in presentational components)

**Modifying connection flow:**
1. Update state types in `src/types/index.ts`
2. Modify hook logic in `usePeerConnection.ts`
3. Update App.tsx orchestration

## Limitations

- Two-peer only (no multi-party support)
- No TURN server (won't work behind symmetric NATs)
- No message persistence
- Connection requires both browser windows to remain open
