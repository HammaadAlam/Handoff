/**
 * Remote (or file://) images via expo-image — caching, fade-in, stable layout.
 */
import { Image, type ImageProps } from 'expo-image';
import { colors } from '@/styles/theme';

type Props = Omit<ImageProps, 'source'> & {
  uri: string;
};

export function RemoteImage({ uri, style, contentFit = 'cover', ...rest }: Props) {
  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.chipBg }, style]}
      contentFit={contentFit}
      transition={200}
      {...rest}
    />
  );
}
