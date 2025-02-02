import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import Gifted Chat library
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
// Expo AV for handling audio
import { Audio } from 'expo-av';
// Firestore
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// AsyncStorage: users sees messages even when offline
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({ route, navigation, isConnected }) => {
  // Getting username and bg-color entered in the start screen
  const { name, chatBgColor, userId } = route.params;

  // state for messages of the chat
  const [messages, setMessages] = useState([]);
  // state for the message input
  const [text, setText] = useState('');
  // state for recording audio messages
  const [recording, setRecording] = useState(null);

  // state for setting the colors of the ui depending on the chosen bg-color
  const [colorRightBubble, setColorRightBubble] = useState('#F6E71D');
  //const [systemTextColor, setSystemTextColor] = useState();

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

  const colorLeftBubble = '#EAEAEA'; // Off-white

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('Permission to access the microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingInstance.startAsync();
      setRecording(recordingInstance);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    const audioMessage = {
      _id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      user: {
        _id: userId,
        name: name,
        avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
      },
      audio: uri,
    };

    onSend([audioMessage]);
  };

  const playAudio = async (audioUrl) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Render audio messages
  const renderMessageAudio = (props) => {
    const { currentMessage } = props;

    if (currentMessage.audio) {
      return (
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Play audio message"
          accessibilityHint="Tap to listen to the recorded audio message."
          accessibilityRole="button"
          style={styles.audioBubble}
          onPress={() => playAudio(currentMessage.audio)}
        >
          <Text style={styles.audioText}>▶ Play Audio</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Render system messages
  const renderMessageSystem = (props) => {
    const { currentMessage } = props;

    if (currentMessage.system) {
      return (
        <View style={styles.systemMessageContainer} accessibilityLiveRegion="assertive">
          <Text style={styles.systemMessageText}>{currentMessage.text}</Text>
          <Text style={styles.systemMessageDate}>{currentMessage.createdAt.toLocaleString()}</Text>
        </View>
      );
    }
    return null;
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: colorRightBubble },
          left: { backgroundColor: colorLeftBubble },
        }}
      />
    );
  };

  // Custom Input Toolbar with button to record audio message
  const renderInputToolbar = (props) => {
    if (isConnected === true) {
      return (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
            accessibilityHint={
              recording ? 'Tap to stop recording your audio message' : 'Tap to start recording an audio message'
            }
            accessibilityRole="button"
            onPress={recording ? stopRecording : startRecording}
            style={[styles.audioButton, { backgroundColor: colorRightBubble }]}
          >
            <Text style={styles.audioButtonText}>{recording ? '■ Stop' : '🎤'}</Text>
          </TouchableOpacity>

          {/* Custom TextInput for typing messages */}
          <TextInput
            accessible={true}
            accessibilityLabel="Type a message"
            accessibilityHint="You can type your message here."
            style={styles.textInput}
            value={text} // Bind text state to the TextInput value
            onChangeText={setText} // Update text state on change
            placeholder="Type a message..."
            placeholderTextColor="#888"
            returnKeyType="send"
            onSubmitEditing={() => {
              if (text.trim()) {
                const newMessage = {
                  _id: Math.random().toString(36).substring(7),
                  text,
                  createdAt: new Date(),
                  user: {
                    _id: userId,
                    name: name,
                    avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
                  },
                };
                onSend([newMessage]);
                setText(''); // Reset text input after sending
              }
            }}
          />
        </View>
      );
    }
  };

  const onSend = (newMessages) => {
    addDoc(collection(db, 'messages'), newMessages[0]);
  };

  // Setting the Messages shown in the chat
  let unsubMessages;

  //Alert.alert('Network Connection', `isConnected is: ${String(isConnected)}`);

  useEffect(() => {
    navigation.setOptions({ title: name });

    if (isConnected === true) {
      // unregister current onSnapshot() listener to avoid registering multiple listeners when useEffect code is re-executed.
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      unsubMessages = onSnapshot(
        q,
        (documentsSnapshot) => {
          let newMessages = [];
          documentsSnapshot.forEach((doc) => {
            newMessages.push({
              id: doc.id,
              ...doc.data(),
              createdAt: new Date(doc.data().createdAt.toMillis()),
            });
          });
          cacheMesssages(newMessages);
          setMessages(newMessages);
        },
        (error) => {
          console.error('Error with onSnapshot:', error);
        }
      );
    } else {
      loadCachedMessages();
    }

    // ----> Send system message when new user enters  <----
    (async () => {
      try {
        await addDoc(collection(db, 'messages'), {
          _id: `system-${Date.now()}`, // Unique ID
          text: `Welcome to the chat, ${name}!`,
          createdAt: new Date(),
          system: true,
        });
      } catch (error) {
        console.log('Error sending system message: ', error);
      }
    })();

    // Clean up code
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  // color theme: set the color of the speech bubbles according to chatBgColor
  useEffect(() => {
    // Find the index of the selected background color
    const index = backgroundColors.indexOf(chatBgColor);

    // Set the corresponding speech bubble color or default to orange
    setColorRightBubble(index !== -1 ? speechBubbleColors[index] : 'F6E71D');
  }, []);

  // Function to cache messages for offline use
  const cacheMesssages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('message_store', JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to load cached messages when offline
  const loadCachedMessages = async () => {
    const cachedLists = (await AsyncStorage.getItem('message_store')) || [];
    setMessages(JSON.parse(cachedLists));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: chatBgColor }]}
      accessibilityLabel="Chat screen"
      accessibilityHint="This is the main chat screen where you can send and receive messages."
    >
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userId,
          name: name,
          avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
        }}
        renderBubble={renderBubble}
        renderMessageAudio={renderMessageAudio} // Handles audio messages
        renderInputToolbar={renderInputToolbar} // Custom input with audio button
        renderMessageSystem={renderMessageSystem} // Custom system messages
        alwaysShowSend
        accessibilityLabel="Chat interface"
        accessibilityHint="Displays and sends chat messages. You can type or send audio messages."
      />

      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  audioBubble: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  audioText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderRadius: 25,
    margin: 10,
  },
  audioButton: {
    padding: 12,
    borderRadius: 50,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontSize: 16,
  },
  inputToolbar: {
    backgroundColor: 'transparent',
  },
  // System message styles
  systemMessageContainer: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  systemMessageText: {
    color: 'blue',
  },
  systemMessageDate: {
    color: 'blue',
  },
});

export default Chat;
