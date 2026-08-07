import { PrivacyPolicyView } from '@decks/core';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Arithmetic Deck',
  description: 'Privacy policy and COPPA compliance information for Arithmetic Deck.',
};

export default function PrivacyPage() {
  return <PrivacyPolicyView appName="Arithmetic Deck" />;
}
