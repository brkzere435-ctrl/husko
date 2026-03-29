import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { WC } from '@/constants/westCoastTheme';

type Props = ViewProps & { children: React.ReactNode };

export function WestCoastBackground({ children, style, ...rest }: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={[WC.brickDeep, '#3f0d12', '#0f172a', WC.brickDeep]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(34,211,238,0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WC.brickDeep,
  },
});
