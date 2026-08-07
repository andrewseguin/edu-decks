import { PrivacyPolicyView } from '@decks/core';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Reading Deck',
  description: 'Privacy policy and COPPA compliance information for Reading Deck.',
};

export default function PrivacyPage() {
  return <PrivacyPolicyView appName="Reading Deck" />;
}
