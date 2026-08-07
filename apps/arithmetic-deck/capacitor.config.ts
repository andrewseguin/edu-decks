import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.edudecks.arithmetic',
  appName: 'Arithmetic Deck',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
