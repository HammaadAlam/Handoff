import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '@/components/RemoteImage';
import { fonts, colors, radii, typography } from '@/styles/theme';
import type { SuggestedCategory } from '@/data/mockData';

type Props = {
  category: SuggestedCategory;
  onPress?: () => void;
};

export function CategoryTile({ category, onPress }: Props) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={styles.imageBox}>
        <RemoteImage uri={category.imageUrl} style={styles.image} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '31%',
    marginBottom: 14,
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    ...typography.caption,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    marginTop: 6,
    color: colors.textPrimary,
  },
});
