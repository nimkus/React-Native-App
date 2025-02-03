import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  ImageBackground,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';

// Authentication
import { auth } from '../firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

// The start screen allows users to enter their name and choose the bg-color of the chat screen
const Start = ({ route, navigation }) => {
  // State for setting the username to be displayed in the chat
  const [name, setName] = useState('');
  const [isNameLocked, setIsNameLocked] = useState(false);

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

  // Anonymously sign in user
  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate('Chat', {
          userId: result.user.uid,
          name: name,
          chatBgColor: chatBgColor,
        });
      })
      .catch(() => {
        Alert.alert('Unable to sign in, try later again.');
      });
  };

  // Handle the Start Chatting button press
  const handleStartChat = () => {
    if (name.trim() === '') {
      setShowWarning(true); // Show warning if name is empty
    } else {
      setShowWarning(false); // Hide warning
      signInUser();
    }
  };

  // Update the name
  const handleNameChange = (text) => {
    setName(text);
    if (text.trim() !== '') {
      setShowWarning(false);
    }
  };

  // If user leaves the TextInput (onBlur) and there's a name, lock it
  const handleBlur = () => {
    if (name.trim() !== '') {
      setIsNameLocked(true);
    }
  };

  // color theme: set the color of the speech bubbles according to chatBgColor
  useEffect(() => {
    // Find the index of the selected background color
    const index = backgroundColors.indexOf(chatBgColor);
    setColorRightBubble(index !== -1 ? speechBubbleColors[index] : '#2C455F');
  }, [chatBgColor]);

  // On user signout, clear user name
  useEffect(() => {
    if (route.params?.reset) {
      setName('');
      setIsNameLocked(false);
    }
  }, [route.params?.reset]);

  // Render nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/app-screens/background-image.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>Chatter</Text>
          <Text style={styles.appSubtitle}>Your favorite chat app</Text>
        </View>

        <View style={styles.InputField}>
          {/* NAME SECTION */}
          {isNameLocked ? (
            /* If name is locked, show a "permanent" style with Edit button */
            <View style={[styles.lockedNameContainer, styles.text]}>
              <Text style={styles.lockedNameText}>{name}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setIsNameLocked(false)}>
                <Text style={[styles.text, styles.editButtonText]}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Otherwise, show the TextInput */
            <TextInput
              accessible
              accessibilityLabel="Enter your name"
              accessibilityHint="Please enter your name to start chatting."
              style={[styles.nameInput, styles.text]}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Your name"
              onBlur={handleBlur}
            />
          )}

          {/* Show warning if name is empty */}
          {showWarning && (
            <View style={styles.warningContainer} accessibilityLiveRegion="assertive">
              <Text style={styles.warningText}>Please enter your name to start chatting.</Text>
            </View>
          )}

          {/* COLOR SELECTION */}
          <View>
            <Text style={[styles.text, { marginBottom: 10 }]}>Choose your chat colors:</Text>
            <View style={styles.colorContainer}>
              {backgroundColors.map((color) => (
                <TouchableOpacity
                  accessible
                  accessibilityLabel={`Select color ${colorRightBubble} on ${color}`}
                  accessibilityHint="Lets you choose the color of the chat background and speech bubbles."
                  accessibilityRole="button"
                  key={color}
                  style={[
                    styles.colorCircles,
                    { backgroundColor: color },
                    chatBgColor === color && {
                      borderWidth: 16,
                      backgroundColor: colorRightBubble,
                      borderColor: color,
                    },
                  ]}
                  onPress={() => handleCirclePress(color)}
                />
              ))}
            </View>
          </View>

          {/* START CHATTING BUTTON */}
          <TouchableOpacity
            accessible
            accessibilityHint="Moves you to the chat interface."
            accessibilityRole="button"
            onPress={handleStartChat}
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

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginTop: '30%',
  },
  appTitle: {
    fontSize: 55,
    lineHeight: 70,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: 'white',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#757083',
  },
  /* INPUT FIELD CONTAINER */
  InputField: {
    width: '88%',
    height: '44%',
    padding: '4%',
    marginBottom: '10%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },

  /* EDITABLE TEXTINPUT */
  nameInput: {
    height: 55,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  /* LOCKED NAME DISPLAY */
  lockedNameContainer: {
    height: 55,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
  },
  lockedNameText: {
    fontFamily: 'Poppins-Bold',
    maxWidth: '88%',
    fontSize: 30,
    color: '#181818',
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  editButtonText: {
    color: '#007AFF',
    fontFamily: 'Poppins-Bold',
  },

  /* COLOR CIRCLES */
  colorContainer: {
    flexDirection: 'row',
  },
  colorCircles: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
  },

  /* WARNING */
  warningContainer: {
    backgroundColor: '#fff5cb',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    color: '#a98542', // Dark yellow color for warning text
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
  },

  /* START CHATTING BUTTON */
  chatButton: {
    height: '20%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757083',
  },
});

export default Start;
