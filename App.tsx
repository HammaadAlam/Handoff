/**
 * App root — gesture handler → safe area → root stack (tabs + transaction flows).
 */
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MarketplaceProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </MarketplaceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
