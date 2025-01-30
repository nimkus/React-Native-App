import { StyleSheet, View, Text } from 'react-native';
import { useEffect } from 'react';

// This chat screen allows users to ...

const Chat = ({ route, navigation }) => {
  const { name, chatBgColor } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  return <View style={[styles.container, { backgroundColor: chatBgColor }]}></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat;
