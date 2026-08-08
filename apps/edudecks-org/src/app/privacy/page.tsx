import { PrivacyPolicyView } from "@decks/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — EduDecks",
  description: "EduDecks privacy policy. 100% private, no tracking, and COPPA compliant.",
};

export default function PrivacyPage() {
  return <PrivacyPolicyView appName="EduDecks" />;
}
