import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.edudecks.reading',
  appName: 'Reading Deck',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
