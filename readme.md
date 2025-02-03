# Chatter

**Chatter** is a React Native mobile application that allows users to chat in real-time, even when offline. Users can send text, images, their geolocation, and audio messages. The app uses Firebase Firestore and Firebase Authentication to handle data storage and user management, along with the Gifted Chat library for a customizable chat interface.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Project Structure](#project-structure)
6. [Usage & Workflow](#usage--workflow)
7. [Accessibility](#accessibility)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

1. **User Authentication**: Users can sign in anonymously via Firebase Authentication.
2. **Real-time Messaging**: Messages are sent and received instantly using Firebase Firestore.
3. **Offline Support**: Messages are cached with AsyncStorage. Users can still see the chat history without an internet connection.
4. **Media Attachments**:
   - **Images**: Pick images from the device’s library or take a new photo with the camera.
   - **Audio Messages**: Record short audio clips within the app and send them directly in the chat.
5. **Location Sharing**: Easily share the user’s current location (latitude & longitude) within a message, which is displayed as a small map preview.
6. **Customizable Chat UI**:
   - Select from multiple background colors for the chat screen.
   - Corresponding, uniquely themed speech bubble colors.
7. **Accessibility**: Screen reader friendly with labeled buttons, descriptive messages, and recommended accessibility best practices.

---

## Tech Stack & Dependencies

- **React Native**: Front-end framework for building native mobile apps.
- **Expo**: Development platform that provides a set of tools and services built around React Native.
- **Firebase**:
  - **Firestore** for real-time database and offline persistence.
  - **Firebase Auth** for anonymous authentication.
- **Gifted Chat**: For the chat UI components (bubbles, input toolbar, etc.).
- **@react-native-community/netinfo**: Detects internet connectivity changes.
- **expo-image-picker** & **expo-media-library**: Handling media selection and saving.
- **expo-location**: Requesting and providing device location.
- **expo-av**: Playing and recording audio.
- **AsyncStorage**: Local storage solution for caching messages.

---

## Prerequisites

1. **Node.js** (version 14+) and **npm** or **Yarn**: Ensure you have a stable version installed.
2. **Expo CLI** (optional, but recommended): `npm install -g expo-cli`.
3. **Firebase Project**:
   - You need your own Firebase project set up at [Firebase Console](https://console.firebase.google.com/).
   - Create a **web app** in your Firebase project to get the necessary config for `firebaseConfig.js`.
4. **Android/iOS Simulator or Physical Device**:
   - If using a device, install the [Expo Go App](https://expo.dev/client).

---

## Installation & Setup

1. **Clone the repository:**:

   ```
   git clone https://github.com/YourUsername/Chatter.git
   cd Chatter
   ```

2. **Install dependencies:**:

   ```
   npm install
    # or
   yarn install
   ```

3. **Configure Firebase:**:

- Locate or create firebaseConfig.js in your project folder (the sample code here shows it being in the root of the project or at ./firebaseConfig.js).
- Paste your project-specific configuration from your Firebase console.

  ```
  // Example (Do not use these exact values):
  import { initializeApp } from 'firebase/app';
  import { getFirestore } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';

  const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'YOUR_APP.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'XXXXXXXXXXXX',
  appId: 'X:XXXXXXXXXX:web:XXXXXX',
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);
  ```

4. **Start the development server:**:

   ```
   npx expo start
   # or
   npm start
   # or
   yarn start
   ```

5. **Test on your device or simulator:**:

- Use Expo Go on your physical device (scan the QR code) or run an emulator from Android Studio/Xcode.

---

## Project Structure

.
├── App.js // Main application component & Navigator
├── firebaseConfig.js // Firebase configuration (customize with your keys)
├── components
│ ├── Start.js // Start screen (username input, color selection)
│ ├── Chat.js // Primary chat UI
│ └── CustomActions.js // Custom action sheet for images, location, audio
├── assets
│ ├── fonts // Custom fonts (Poppins used in this project)
│ └── app-screens // Background images or other media
└── ...

- Start.js: Where the user enters their name, chooses a background color, and initiates an anonymous sign-in.
- Chat.js: The main chat component powered by Gifted Chat. Handles rendering messages, audio recording, and location sharing.
- CustomActions.js: An action sheet providing options to pick images, take photos, send location, or record audio.

---

## Usage & Workflow

1. Open the App:

- The Start screen (Start.js) appears.
- Enter your name in the text input field.
- Optionally, tap on a color circle to change the chat background color.
  Lock or Edit Name:

2. Lock or Edit Name:

- If you leave the input field with a non-empty name, it becomes “locked” until you tap Edit.

3. Start Chatting:

- Tap Start Chatting to move to the Chat screen.
- Your conversation is now linked to a unique anonymous Firebase user.
  Sending Messages:

4. Sending Messages:

- Enter text using the chat input at the bottom.
- Tap the + button to open additional options:
  - Choose From Library: Select an image from the phone’s gallery.
  - Take Picture: Use the device’s camera to snap a new photo.
  - Send Location: Attach your current geographical coordinates.
  - Record Audio / Stop Recording: Capture and send audio messages.

5. Offline Usage:

- If the device loses internet connection, you can still see your cached messages.
- When the app detects a reconnection, it automatically syncs new messages with Firestore.

6. Signing Out:

- On the Start screen’s top-right corner, a Sign Out button appears if you’re authenticated.
- Tapping Sign Out resets the app to the Start screen.

---

## Accessibility

- Screen Reader Labels: Most interactive elements have accessibilityLabel or accessibilityHint to describe their function to visually impaired users.
- Touchable Elements: Buttons and images use React Native’s TouchableOpacity, facilitating recognition by screen readers.
- KeyboardAvoidingView: On iOS, the chat input area remains visible when the virtual keyboard is open.

---

## Troubleshooting

1. Firebase Permission Errors:

- Double-check the rules in Firestore’s console or ensure you have properly set up your credentials (firebaseConfig.js).

2. Network Connection:

- If your device is offline, you’ll see an alert. Check if you have the correct network or that the Firestore database is enabled.

3. Audio Recording:

- Ensure you’ve allowed microphone permissions on your device or simulator.

4. Location:

- Make sure the device’s location services are enabled and you’ve given permission to the app.

---

## Contributing

1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear, descriptive messages.
4. Push to your branch.
5. Open a Pull Request detailing your changes.

We encourage you to contribute fixes, improvements, or translations!

---

## License

This project is licensed under the MIT License. You’re free to use, modify, and distribute this software as allowed by the license.

---

**Thank you for using Chatter!** If you encounter any issues or have suggestions for improvements, please create an issue or open a pull request. Enjoy chatting!
