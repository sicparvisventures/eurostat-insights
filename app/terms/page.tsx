import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/landing/legal-page";
import { BRAND_NAME, BRAND_CREATOR } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${BRAND_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="June 2026">
      <LegalSection title="Purpose">
        <p>
          {BRAND_NAME} is an educational and entertainment project. It is provided
          &quot;as is&quot;, without warranties of any kind, and may change or be
          unavailable at any time.
        </p>
      </LegalSection>

      <LegalSection title="Forecasts are estimates">
        <p>
          Business Mode forecasts are model estimates derived from the
          configuration you enter and public data. They are not financial,
          accounting or operational advice. Always validate against your own
          records before making decisions; {BRAND_CREATOR} accepts no liability
          for outcomes based on the app.
        </p>
      </LegalSection>

      <LegalSection title="Data sources">
        <p>
          Statistics are © European Union, sourced from Eurostat, and weather data
          is provided by Open-Meteo. Their respective terms and licences apply to
          the underlying data.
        </p>
      </LegalSection>

      <LegalSection title="Ownership">
        <p>
          The {BRAND_NAME} name, design and application code are © {BRAND_CREATOR}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
