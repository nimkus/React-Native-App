import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';

// The start screen allows users to enter their name and choose the bg-color of the chat screen
const Start = ({ navigation }) => {
  // State for setting the username to be displayed in the chat
  const [name, setName] = useState('');
  // Chat Colors: State for changing bg-color and speech bubble color
  const [chatBgColor, setChatBgColor] = useState('#8A95A5');
  const [colorRightBubble, setColorRightBubble] = useState('');
  // State to handle showing the warning message
  const [showWarning, setShowWarning] = useState(false);

  // Loading fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  // color theme for the chat
  const backgroundColors = [
    '#B9C6AE', // Light Green
    '#8A95A5', // Grayish Blue
    '#474056', // Dark Purple
    '#181818', // Black
  ];

  const speechBubbleColors = [
    '#2E5E2E', // Deep Forest Green
    '#2C455F', // Dark Grey-Blue
    '#AE8FCD', // Soft Lavender
    '#E1A21D', // Gold Yellow
  ];

  // Function to handle circle selection
  const handleCirclePress = (color) => {
    setChatBgColor(color);
  };

  // Handle the Start Chatting button press
  const handleStartChat = () => {
    if (name.trim() === '') {
      setShowWarning(true); // Show warning if name is empty
    } else {
      setShowWarning(false); // Hide warning
      navigation.navigate('Chat', { name: name, chatBgColor: chatBgColor });
    }
  };

  // Update the name and hide the warning if text is entered
  const handleNameChange = (text) => {
    setName(text);
    if (text.trim() !== '') {
      setShowWarning(false); // Hide the warning when something is typed
    }
  };

  // color theme: set the color of the speech bubbles according to chatBgColor
  useEffect(() => {
    // Find the index of the selected background color
    const index = backgroundColors.indexOf(chatBgColor);

    // Set the corresponding speech bubble color or default to orange
    setColorRightBubble(index !== -1 ? speechBubbleColors[index] : '#2C455F');
  }, [chatBgColor]);

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/app-screens/background-image.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <Text style={styles.appTitle}>Chatter</Text>

        <View style={styles.InputField}>
          <TextInput
            style={[styles.nameInput, styles.text]}
            value={name}
            onChangeText={handleNameChange} // Use the new handler
            placeholder="Your name"
          />

          {/* Show warning if name is empty */}
          {showWarning && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>Please enter your name to start chatting.</Text>
            </View>
          )}

          <View>
            <Text style={[styles.text, { marginBottom: 10 }]}>Choose Background Color:</Text>
            <View style={styles.colorContainer}>
              {backgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircles,
                    { backgroundColor: color },
                    chatBgColor === color && { borderWidth: 16, backgroundColor: colorRightBubble, borderColor: color }, // Apply selected style
                  ]}
                  onPress={() => handleCirclePress(color)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleStartChat} // Call the new handler
            style={styles.chatButton}
          >
            <Text style={[styles.text, { color: '#fff', fontFamily: 'Poppins-Bold' }]}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontFamily: 'Poppins-Bold',
    color: 'white',
    fontSize: 45,
    lineHeight: 84,
    textAlign: 'center',
    marginTop: '20%',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#757083',
  },
  InputField: {
    width: '88%',
    height: '44%',
    padding: '4%',
    marginBottom: '10%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  nameInput: {
    height: 55,
    paddingLeft: 10,
    borderWidth: 1,
  },
  chatButton: {
    height: '20%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757083',
  },
  colorContainer: {
    flexDirection: 'row',
  },
  colorCircles: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
  },

  warningContainer: {
    backgroundColor: '#ffcccb', // Light red background for warning
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningText: {
    color: '#a94442', // Dark red color for warning text
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Start;
