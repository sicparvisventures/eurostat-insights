"use client";

import { EU_AGGREGATE, EU_COUNTRIES } from "@/lib/eurostat/constants";
import { ChipBar } from "@/components/ui/chip-bar";

const OPTIONS = [EU_AGGREGATE, ...EU_COUNTRIES].map((c) => ({
  value: c.code,
  label: c.displayCode,
  title: c.name,
  ariaLabel: c.name,
}));

export function CountryChips({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  return (
    <ChipBar
      options={OPTIONS}
      value={value}
      onChange={onChange}
      ariaLabel="Country or region"
      mono
      className={className}
    />
  );
}
