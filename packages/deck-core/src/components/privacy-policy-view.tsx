import React from 'react';

export interface PrivacyPolicyViewProps {
  appName: string;
}

export function PrivacyPolicyView({ appName }: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-sm border border-border p-8 sm:p-12">
        <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {appName} • Effective Date: August 7, 2026
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Back to App
          </a>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Overview</h2>
            <p>
              {appName} is an educational application designed for learners of all ages. We believe in complete transparency and respect your privacy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Information Collection and Storage</h2>
            <p>
              <strong>We do not collect, transmit, store, or sell any personally identifiable information (PII).</strong> All app settings, deck preferences, session progress, and history remain strictly on your local device via browser local storage.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Children's Privacy (COPPA & Family Policy Compliance)</h2>
            <p>
              Our apps are safe and appropriate for all ages, including children under the age of 13.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>No user registration, accounts, or logins are required.</li>
              <li>No personal information is collected or requested.</li>
              <li>No behavioral tracking, ad-targeting, or invasive analytics are embedded.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Third-Party Services & Advertising</h2>
            <p>
              {appName} does not include third-party advertising networks, analytics tracking suites, or data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any revisions will be reflected on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Contact</h2>
            <p>
              If you have any questions regarding this Privacy Policy, you can open an issue on our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
