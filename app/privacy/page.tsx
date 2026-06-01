import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/landing/legal-page";
import { BRAND_NAME, BRAND_CREATOR } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${BRAND_NAME} handles your data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="June 2026">
      <LegalSection title="The short version">
        <p>
          {BRAND_NAME} is an educational project by {BRAND_CREATOR}. There are no
          accounts, no advertising, no analytics trackers and no cookies used to
          profile you. We do not collect or sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="What stays on your device">
        <p>
          Your preferences — chosen country, theme, favourites and your Business
          Mode setup (locations and slider settings) — are saved only in your
          browser&apos;s local storage. They never leave your device and are not
          transmitted to us.
        </p>
      </LegalSection>

      <LegalSection title="Third-party data we fetch">
        <p>
          To show live figures the app calls public services directly: the
          Eurostat dissemination API for statistics and Open-Meteo for weather in
          the city you enter. Those providers necessarily receive standard request
          information (such as your IP address and the query). We do not store or
          link that information to you.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy can be directed to {BRAND_CREATOR}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
