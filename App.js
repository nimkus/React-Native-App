import { StyleSheet, View, TextInput, Text } from 'react-native';
import { useState } from 'react';

// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

// Create the navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const [text, setText] = useState('');
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat" component={Chat} />
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
