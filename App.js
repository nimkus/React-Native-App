import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { db, auth } from './firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { disableNetwork, enableNetwork } from 'firebase/firestore';

import { useNetInfo } from '@react-native-community/netinfo';

// Create the navigator
const Stack = createNativeStackNavigator();

// Screens
import Start from './components/Start';
import Chat from './components/Chat';

const App = () => {
  // Track the network connectivity
  const connectionStatus = useNetInfo();

  // Keep track of whether a user is signed in or not
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Create a ref to the navigation container so we can call .reset()
  const navigationRef = useRef();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user exists, they are signed in. Otherwise, not signed in.
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // function: sign-out user
  const signOutUser = async () => {
    try {
      await signOut(auth);

      // After sign-out, reset navigation to the Start screen
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [
            {
              name: 'Start',
              params: { reset: true },
            },
          ],
        });
      }

      Alert.alert('Signed out', 'You have signed out successfully.');
    } catch (error) {
      Alert.alert('Error', 'Error signing out: ' + error.message);
    }
  };

  // If network connection lost: Display alert + stop attempting to connect to Firestore
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('Connection Lost!');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen
          name="Start"
          component={Start}
          options={{
            title: 'Chatter',
            // Conditionally render the Sign Out button only if user is signed in
            headerRight: () =>
              isSignedIn ? (
                <TouchableOpacity onPress={signOutUser} style={{ marginRight: 15 }}>
                  <Text style={styles.signoutButton}>Sign Out</Text>
                </TouchableOpacity>
              ) : null,
          }}
        />
        <Stack.Screen name="Chat">
          {(props) => <Chat {...props} isConnected={connectionStatus.isConnected} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  signoutButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default App;
