import type { PhoneNumber } from "@/types";

type CountryFlagProps = {
  countryCode?: string;
  countryName: string;
  className?: string;
};

export function CountryFlag({ countryCode, countryName, className = "h-5 w-5" }: CountryFlagProps) {
  const code = countryCode?.toLowerCase();

  if (!code) {
    return <span className={className} role="img" aria-label={countryName}>🏳️</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={countryName}
      className={`${className} rounded-sm object-contain`}
      loading="lazy"
    />
  );
}

export function PhoneCountryFlag({ phone, className }: { phone: PhoneNumber; className?: string }) {
  return (
    <CountryFlag
      countryCode={phone.country_code}
      countryName={phone.country_name}
      className={className}
    />
  );
}
