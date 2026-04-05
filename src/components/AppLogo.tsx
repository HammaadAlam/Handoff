/**
 * Official Handoff mark — PNG asset (H + swoosh). Size down with width/height.
 */
import { Image, StyleSheet, View } from 'react-native';

const LOGO = require('../../assets/logo-handoff.png');

type Props = {
  width?: number;
  height?: number;
};

export function AppLogo({ width = 140, height = 52 }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={LOGO}
        style={[styles.img, { width, height }]}
        resizeMode="contain"
        accessibilityLabel="Handoff logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  img: {
    alignSelf: 'center',
  },
});
