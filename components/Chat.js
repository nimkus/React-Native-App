import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import Gifted Chat library
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
// Expo AV for handling audio
import { Audio } from 'expo-av';

const Chat = ({ route, navigation }) => {
  // Getting username and bg-color entered in the start screen
  const { name, chatBgColor } = route.params;
  // state for setting the colors of the ui depending on the chosen bg-color
  const [colorRightBubble, setColorRightBubble] = useState('#F6E71D');
  const [systemText, setSystemText] = useState();

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

  // color theme: set the color of the speech bubbles according to chatBgColor
  useEffect(() => {
    // Find the index of the selected background color
    const index = backgroundColors.indexOf(chatBgColor);

    // Set the corresponding speech bubble color or default to orange
    setColorRightBubble(index !== -1 ? speechBubbleColors[index] : 'F6E71D');
  }, []);

  // state for messages of the chat
  const [messages, setMessages] = useState([]);
  // state for the message input
  const [text, setText] = useState('');
  // state for recording audio messages
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
        },
      },
      {
        _id: 2,
        text: 'This is a system message',
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  };

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
      user: { _id: 1 },
      audio: uri,
    };

    onSend([audioMessage]);
  };

  const playAudio = async (audioUrl) => {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    await sound.playAsync();
  };

  const renderMessageAudio = (props) => {
    const { currentMessage } = props;

    if (currentMessage.audio) {
      return (
        <TouchableOpacity style={styles.audioBubble} onPress={() => playAudio(currentMessage.audio)}>
          <Text style={styles.audioText}>▶ Play Audio</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;

    if (currentMessage.audio) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: { backgroundColor: colorRightBubble },
            left: { backgroundColor: '#EAEAEA' },
          }}
          renderMessage={() => (
            <TouchableOpacity style={styles.audioBubble} onPress={() => playAudio(currentMessage.audio)}>
              <Text style={styles.audioText}>▶ Play Audio</Text>
            </TouchableOpacity>
          )}
        />
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: colorRightBubble },
          left: { backgroundColor: '#EAEAEA' },
        }}
        hh
      />
    );
  };

  // Custom Input Toolbar with Audio Button
  const renderInputToolbar = (props) => {
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={[styles.audioButton, { backgroundColor: colorRightBubble }]}
        >
          <Text style={styles.audioButtonText}>{recording ? '■ Stop' : '🎤'}</Text>
        </TouchableOpacity>

        {/* Custom TextInput for typing messages */}
        <TextInput
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
                user: { _id: 1 },
              };
              onSend([newMessage]);
              setText(''); // Reset text input after sending
            }
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: chatBgColor }]}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderMessageAudio={renderMessageAudio} // Handles audio messages
        renderInputToolbar={renderInputToolbar} // Custom input with audio button
        alwaysShowSend
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
    borderRadius: 20,
    fontSize: 16,
  },
  inputToolbar: {
    backgroundColor: 'transparent',
  },
});

export default Chat;
