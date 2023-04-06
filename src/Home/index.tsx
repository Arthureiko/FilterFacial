import React, { useEffect, useState } from "react";
import { styles } from "./styles";
import { View, ImageSourcePropType } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

import neutralImg from "../assets/neutral.png";
import winkingImg from "../assets/winking.png";
import grinningImg from "../assets/grinning.png";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [front, setFront] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  function handleFaceDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;
    if (face) {
      const { size, origin } = face.bounds;
      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };
      setFaceDetected(true);
      if (face.smilingProbability > 0.5) {
        setEmoji(grinningImg);
      } else if (
        face.leftEyeOpenProbability < 0.5 &&
        face.rightEyeOpenProbability > 0.5
      ) {
        setEmoji(winkingImg);
      } else {
        setEmoji(neutralImg);
      }
    } else {
      setFaceDetected(false);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return;
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera
        style={styles.camera}
        type={!front ? CameraType.front : CameraType.back}
        onFacesDetected={handleFaceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
