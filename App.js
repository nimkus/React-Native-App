import { StyleSheet } from 'react-native';
import { useState } from 'react';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Create the navigator
const Stack = createNativeStackNavigator();

// Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

const App = () => {
  const [text, setText] = useState('');

  // Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyBwyHTp2Cmk7hgSjA5cUJq12LIvnO54ddI',
    authDomain: 'chatter-d15b3.firebaseapp.com',
    projectId: 'chatter-d15b3',
    storageBucket: 'chatter-d15b3.firebasestorage.app',
    messagingSenderId: '469493975732',
    appId: '1:469493975732:web:875912b3183464626465e1',
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat" component={Chat}>
          {(props) => <Chat db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  textInput: {
    color: 'white',
    width: '88%',
    borderWidth: 1,
    height: 50,
    padding: 10,
  },
  box1: {
    flex: 1,
    backgroundColor: 'blue',
  },
  box2: {
    flex: 12,
    backgroundColor: 'red',
  },
  box3: {
    flex: 5,
    backgroundColor: 'green',
  },
});

export default App;
