import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

// Making images on phone available for the app
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

// Make geolocation of phone available for the app
import * as Location from 'expo-location';

const CustomActions = ({
  wrapperStyle,
  iconTextStyle,
  startRecording,
  stopRecording,
  recording,
  onSend,
  // these come from Chat.js
  name,
  userId,
}) => {
  const actionSheet = useActionSheet();

  // Pick an image from the photo library:
  const pickImage = async () => {
    const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert('Permission to access the library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      onSend([
        {
          _id: `image-${Date.now()}`,
          text: '',
          createdAt: new Date(),
          user: {
            _id: userId,
            name: name,
            avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
          },
          image: uri, // This is the key that Gifted Chat looks for
        },
      ]);
    }
  };

  // Take a photo with the camera:
  const takePhoto = async () => {
    const permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert('Permission to access the camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      // Optionally save to the user’s media library:
      const { uri } = result.assets[0];
      const mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
      if (mediaLibraryPermissions.granted) {
        await MediaLibrary.saveToLibraryAsync(uri);
      }

      // Send as a Gifted Chat message:
      onSend([
        {
          _id: `photo-${Date.now()}`,
          text: '',
          createdAt: new Date(),
          user: {
            _id: userId,
            name: name,
            avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
          },
          image: uri, // Gifted Chat uses this to display the image
        },
      ]);
    }
  };

  // Get user’s current location:
  const getLocation = async () => {
    const permissions = await Location.requestForegroundPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert("Permissions haven't been granted.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    if (loc) {
      onSend([
        {
          _id: `location-${Date.now()}`,
          text: '',
          createdAt: new Date(),
          user: {
            _id: userId,
            name: name,
            avatar: 'https://gravatar.com/avatar/f6e096c0b9f684e13fd60dc5ad29be81?s=400&d=robohash&r=x',
          },
          location: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
        },
      ]);
    } else {
      Alert.alert('Error occurred while fetching location');
    }
  };

  // Show action sheet with the 4 main actions:
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
            if (recording) {
              stopRecording();
            } else {
              startRecording();
            }
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

export default CustomActions;

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
