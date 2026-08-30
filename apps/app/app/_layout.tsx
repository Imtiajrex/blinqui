import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import '../global.css'

export { ErrorBoundary } from 'expo-router'
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index.tsx',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.

export default (function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <Stack />
    </GestureHandlerRootView>
  )
})
