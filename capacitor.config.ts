import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.furkan.koctakip',
  appName: 'Koc Takip',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    url: 'http://10.0.2.2:8080',
    cleartext: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '685687712244-s3m0aqa91masb83f72mid4audujqsm99.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;