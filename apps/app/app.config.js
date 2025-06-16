const config = {
  expo: {
    name: 'ShopXing',
    slug: 'shopxing',
    version: '1.0.0',
    scheme: 'shopxing',
    orientation: 'default',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#16295A',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      userInterfaceStyle: 'automatic',
      requireFullScreen: true,
      bundleIdentifier: 'com.shopxing.app',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
      },
    },
    android: {
      userInterfaceStyle: 'automatic',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#16295A',
      },
      package: 'com.shopxing.app',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash.png',
          resizeMode: 'cover',
          backgroundColor: '#16295A',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            extraProguardRules:
              '-keep class com.google.android.gms.internal.consent_sdk.** { *; }',
          },
          ios: {
            extraInfoPlist: {
              NSUserTrackingUsageDescription:
                'This identifier will be used to deliver personalized ads to you.',
            },
            useFrameworks: 'static',
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-2231421763932805~3382991634',
          iosAppId: 'ca-app-pub-2231421763932805~3382991634',
        },
      ],
      "@react-native-firebase/app",
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'd3b5c9b0-92ad-4ef4-bb55-bb8dea9e9e68',
      },
    },
    owner: 'shopxing',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/d3b5c9b0-92ad-4ef4-bb55-bb8dea9e9e68',
    },
  },
  'react-native-google-mobile-ads': {
    android_app_id: 'ca-app-pub-2231421763932805~3382991634',
    ios_app_id: 'ca-app-pub-2231421763932805~3382991634',
  },
}
export default config
