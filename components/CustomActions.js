import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

// Making images on phone avaible for the app
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

// Make geolocation of phone availabe for the app
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

const CustomActions = ({ wrapperStyle, iconTextStyle, startRecording, stopRecording, recording, onSend }) => {
  const actionSheet = useActionSheet();

  // state to represent URI source of image from phone gallery or camera
  const [image, setImage] = useState(null);
  // state to represent phone's location data
  const [location, setLocation] = useState(null);

  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) setImage(result.assets[0]);
      else setImage(null);
    }
  };

  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();

    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();

      if (!result.canceled) {
        let mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();

        if (mediaLibraryPermissions?.granted) {
          await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
        }

        setImage(result.assets[0]);
      } else setImage(null);
    }
  };

  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend([
          {
            _id: Math.random().toString(36).substring(7),
            text: '', // Often helpful to add at least an empty string
            createdAt: new Date(),
            user: {
              _id: 'your-user-id',
              name: 'Your username',
              // optionally an avatar
            },
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          },
        ]);
      } else {
        Alert.alert('Error occurred while fetching location');
      }
    } else {
      Alert.alert("Permissions haven't been granted.");
    }
  };

  const onActionPress = () => {
    const options = [
      'Choose From Library',
      'Take Picture',
      'Send Location',
      recording ? 'Stop Recording' : 'Record Audio',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
            return;
          case 3:
            // Toggle Recording
            if (recording) stopRecording();
            else startRecording();
            return;
          default:
        }
      }
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 15,
  },
});

export default CustomActions;
