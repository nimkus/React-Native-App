import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import Gifted Chat library
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
// Expo AV for handling audio
import { Audio } from 'expo-av';
// Firestore
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// AsyncStorage: users sees messages even when offline
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const Chat = ({ route, navigation, isConnected }) => {
  // Getting username and bg-color entered in the start screen
  const { name, userId, chatBgColor } = route.params;

  // state for messages of the chat
  const [messages, setMessages] = useState([]);
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

  // ----> AUDIO RECORDING FUNCTIONS <----
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
      _id: `audio-${Date.now()}`, // Unique ID
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

  // Gifted Chat's onSend
  const onSend = (newMessages = []) => {
    // Insert only the first message object into Firestore
    addDoc(collection(db, 'messages'), newMessages[0]);
  };

  // Listen to messages from Firestore
  let unsubMessages;

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
              _id: doc.id,
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
          user: {
            _id: userId,
            name: name,
            avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
          },
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

  const renderInputToolbar = (props) => {
    if (isConnected === true) return <InputToolbar {...props} />;
    else return null;
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

  const renderCustomActions = (props) => {
    return (
      <CustomActions
        onSend={onSend}
        {...props}
        userId={userId}
        name={name}
        startRecording={startRecording}
        stopRecording={stopRecording}
        recording={recording}
      />
    );
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: chatBgColor }]}
      accessibilityLabel="Chat screen"
      accessibilityHint="This is the main chat screen where you can send and receive messages."
    >
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        alwaysShowSend
        renderInputToolbar={renderInputToolbar}
        renderBubble={renderBubble}
        renderMessageAudio={renderMessageAudio} // Handles audio messages
        renderActions={renderCustomActions} // The "plus" button actions
        renderCustomView={renderCustomView}
        user={{
          _id: userId,
          name: name,
          avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
        }}
        accessibilityLabel="Chat interface"
        accessibilityHint="Displays and sends chat messages. You can type or send audio messages."
      />

      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
    </SafeAreaView>
  );
};

// ----> STYLES (Mostly unchanged; we removed the now-unused inputContainer/audioButton, etc.) <----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});

export default Chat;
