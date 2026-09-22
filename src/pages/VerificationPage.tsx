import { useState } from "react";
import { ActivationSection } from "@/components/ActivationSection";
import { VerificationModal } from "@/components/VerificationModal";
import type { VerificationService } from "@/types";

export function VerificationPage() {
  const [verifyService, setVerifyService] = useState<VerificationService | null>(null);
  const [verifyCountry, setVerifyCountry] = useState<string | undefined>(undefined);
  const [verifyPrice, setVerifyPrice] = useState<number | undefined>(undefined);

  return (
    <div className="w-full max-w-full overflow-hidden pt-16 sm:pt-20">
      <ActivationSection
        onBuy={(svc, cc, price) => {
          setVerifyService(svc);
          setVerifyCountry(cc);
          setVerifyPrice(price);
        }}
      />
      <VerificationModal
        service={verifyService}
        isOpen={!!verifyService}
        onClose={() => setVerifyService(null)}
        countryCode={verifyCountry}
        countryPrice={verifyPrice}
      />
    </div>
  );
}
