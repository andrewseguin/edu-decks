import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PrivacyPolicyViewProps {
  appName: string;
  logoSrc?: string;
  backHref?: string;
  backLabel?: string;
}

export function PrivacyPolicyView({
  appName,
  logoSrc = '/logo.png',
  backHref = '/',
  backLabel = 'Back to App',
}: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Matching Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <a
            href={backHref}
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1 px-1.5 -ml-1.5 transition-opacity hover:opacity-80"
            aria-label={`${appName} home`}
          >
            <img
              src={logoSrc}
              alt={appName}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain select-none shrink-0"
            />
            <span className="font-headline font-bold text-base sm:text-xl tracking-tight text-foreground">
              {appName}
            </span>
          </a>

          <a
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-card/80 hover:bg-accent text-foreground transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{backLabel}</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-xs border border-border p-6 sm:p-10">
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {appName} • Effective Date: August 7, 2026
            </p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground font-body">
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
                If you have any questions regarding this Privacy Policy, you can open an issue on our GitHub repository or visit{' '}
                <a
                  href="https://edudecks.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  edudecks.org
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
            <a
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to {appName}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

