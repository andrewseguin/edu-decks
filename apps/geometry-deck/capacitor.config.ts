import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.edudecks.geometry',
  appName: 'Geometry Deck',
  webDir: '.next-mobile',
  server: {
    androidScheme: 'https',
  },
};

export default config;
