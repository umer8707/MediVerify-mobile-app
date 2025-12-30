# MediVerify - Blockchain Medicine Verification App

A high-fidelity mobile application prototype for blockchain-based pharmaceutical product authenticity verification. This is a frontend-only React Native (Expo) prototype designed for Final Year Project demonstration.

## Features

- **QR Code Scanning Simulation**: Mock QR code scanning for medicine verification
- **Blockchain Verification**: Simulated blockchain-based authenticity checks
- **Product Traceability**: View product journey from manufacturer to consumer
- **Scan History**: Track all verified medicines
- **In-App Chatbot**: Get assistance with verification questions
- **Status Indicators**: Clear visual feedback for genuine, duplicate, or counterfeit products

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI Components**: Custom components with Expo Vector Icons

## Project Structure

```
authenticate_app/
├── App.tsx                 # Main entry point
├── src/
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # All 8 screens
│   ├── components/        # Reusable UI components
│   ├── data/             # Mock data
│   └── types/            # TypeScript type definitions
└── assets/               # Images and assets
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

3. Run on device/simulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Screens

1. **Splash Screen** - App loading screen with branding
2. **Login Screen** - Simple email/phone login
3. **Home Screen** - Main dashboard with scan button and recent scans
4. **Scan Result Screen** - Detailed verification results
5. **Traceability Screen** - Product journey timeline
6. **History Screen** - All scanned medicines
7. **Chatbot Screen** - AI assistant for help
8. **Profile Screen** - User settings and app info

## Mock Data

All data is simulated locally. The app includes:
- Predefined medicine records
- Mock QR code generation
- Simulated verification statuses (genuine/duplicate/counterfeit)
- Traceability timeline data

## Notes

- **Frontend Only**: No backend integration
- **No Real Blockchain**: All verification is simulated
- **No Real AI**: Chatbot uses predefined responses
- **Mock QR Scanning**: Tap button to simulate scan

## Design Philosophy

- Clean, modern healthcare UI
- High trust & safety feel
- Clear status indicators
- Accessible and user-friendly

## License

This is a prototype for educational purposes (Final Year Project).

