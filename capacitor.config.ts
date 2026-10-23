import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adityaclutchclip994.app',
  appName: 'ClutchClip',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'notes-translator-bfed5.firebaseapp.com',
      '*.google.com',
      '*.googleapis.com',
      '*.gstatic.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#080a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
