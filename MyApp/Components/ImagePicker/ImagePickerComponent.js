import * as ImagePicker from 'expo-image-picker';
import { View, Alert, StyleSheet } from 'react-native';
import CustomButton from '../CustomButton';

// https://docs.expo.dev/versions/latest/sdk/imagepicker/
// image picking function derived from https://www.youtube.com/watch?v=IGZCtwpnqC8&t=82s&ab_channel=Expo
export default function ImagePickerComponent({onImageSelect}) {
    const [camerastatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediastatus, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();

    const failAlert = () => {
        Alert.alert(
            "Error",
            `Could not load image. If camera image is not loading, try from gallery.`,
            [
              { text: "OK", onPress: () => {} }
            ]
          );
    };

    const onImageConfirm = (result) => {
        var uri = result.uri;
        var ext = uri.substr(result.uri.lastIndexOf('.') + 1);
        if (ext == 'jpg') { ext = 'jpeg' }

        onImageSelect(result.uri, result.type, ext);
    };

    const pickImage = async () => {
        try {
            if (Platform.OS === 'ios') {
                await requestMediaPermission();
                if (mediastatus.status !== 'granted') {
                    return
                }
            }
            // No permissions request is necessary for launching the image library
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                //aspect: [4, 3],
                quality: 1,
                presentationStyle: 0
            });
        
            if (!result.cancelled) {
                onImageConfirm(result);
            }
        }
        catch (error) {
            failAlert();
        }
      };

    const pickFromCamera = async () => {
        try {
            if (Platform.OS === 'ios') {
                //await Permissions.askAsync(Permissions.CAMERA_ROLL);
                await requestCameraPermission();
                if (camerastatus.status !== 'granted') {
                    return;
                }
            }
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                //aspect: [4, 4],
                quality: 1,
                presentationStyle: 0
            });
        
            if (!result.cancelled) {
                onImageConfirm(result);
            }
        }
        catch (error) {
            failAlert();
        }
    };

    return (
        <View style={styles.buttonContainer}>
            <CustomButton
                buttonStyle={[styles.button, {marginRight: 10}]}
                text="open photos"
                onPress={pickImage}
            />
            <CustomButton
                buttonStyle={styles.button}
                text="open camera"
                onPress={pickFromCamera}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row'
    },
    button: {
        flex: 1,
        padding: 10,
    }
  });