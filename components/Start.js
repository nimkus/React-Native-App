import { useState } from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, View, Text, ImageBackground, TouchableOpacity, TextInput } from 'react-native';

const Start = ({ navigation }) => {
  // State for setting the username to be displayed in the chat
  const [name, setName] = useState('');
  // State for changing background color of the chat
  const [chatBgColor, setChatBgColor] = useState('');
  // State to handle showing the warning message
  const [showWarning, setShowWarning] = useState(false);

  // Loading fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Render nothing until fonts are loaded
  }

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

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/app-screens/background-image.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <Text style={styles.appTitle}>App Title</Text>

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
              {['#f69284', '#f0b892', '#587a8f', '#3f2b44'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircles,
                    { backgroundColor: color },
                    chatBgColor === color && styles.selectedCircle, // Apply selected style
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
            <Text style={[styles.text, { color: 'white', fontWeight: 'bold' }]}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
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
    fontSize: 42,
    lineHeight: 84,
    textAlign: 'center',
    marginTop: '20%',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
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
    height: '20%',
    padding: 15,
    borderWidth: 1,
  },
  chatButton: {
    height: '20%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#665a72',
  },
  colorContainer: {
    flexDirection: 'row',
  },
  colorCircles: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: 'blue',
    marginRight: 10,
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: 'black', // You can change this to a color of your choice
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
