import { useState } from "react";
import { ActivationSection } from "@/components/ActivationSection";
import { VerificationModal } from "@/components/VerificationModal";
import type { VerificationService } from "@/types";

export function VerificationPage() {
  const [verifyService, setVerifyService] = useState<VerificationService | null>(null);

  return (
    <div className="w-full max-w-full overflow-hidden pt-16 sm:pt-20">
      <ActivationSection onBuy={setVerifyService} />
      <VerificationModal
        service={verifyService}
        isOpen={!!verifyService}
        onClose={() => setVerifyService(null)}
      />
    </div>
  );
}
