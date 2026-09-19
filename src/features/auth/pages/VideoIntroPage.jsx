import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = 'https://res.cloudinary.com/wowukaao/video/upload/v1784646221/Frame_need_exact_logo_animate_202607212031_yqnfjh.mp4';

const VideoIntroPage = ({ navigation }) => {
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.muted = true;
    player.play();
  });

  // Try to force play when it's ready, which helps on some web browsers
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay' && !player.playing) {
      player.play();
    }
  });

  useEventListener(player, 'playToEnd', () => {
    navigation.replace('Login');
  });

  // Fallback: If autoplay completely fails due to browser policies, 
  // tapping anywhere will just skip to the login screen.
  const skipIntro = () => {
    navigation.replace('Login');
  };

  return (
    <Pressable style={styles.container} onPress={skipIntro}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        showsPlaybackControls={false}
        nativeControls={false}
        contentFit="cover"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background to seamlessly blend if video edges are dark
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default VideoIntroPage;
