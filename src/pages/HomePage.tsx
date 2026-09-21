import { useState } from "react";
import { Hero } from "@/components/Hero";
import { NumberList } from "@/components/NumberList";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { FAQ } from "@/components/FAQ";
import { SmsModal } from "@/components/SmsModal";
import { ActivationSection } from "@/components/ActivationSection";
import { VerificationModal } from "@/components/VerificationModal";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import type { PhoneNumber, VerificationService } from "@/types";

export function HomePage() {
  const { numbers, loading } = usePhoneNumbers();
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [verifyService, setVerifyService] = useState<VerificationService | null>(null);

  const freeNumbers = numbers.filter((n) => n.type === "free");
  const paidNumbers = numbers.filter((n) => n.type === "paid");

  return (
    <>
      <Hero />
      <NumberList
        numbers={freeNumbers}
        type="free"
        loading={loading}
        onViewSms={setSelectedPhone}
      />
      <NumberList
        numbers={paidNumbers}
        type="paid"
        loading={loading}
        onViewSms={setSelectedPhone}
      />
      <ActivationSection onBuy={setVerifyService} />
      <WhyChooseUs />
      <FAQ />
      <SmsModal phone={selectedPhone} onClose={() => setSelectedPhone(null)} />
      <VerificationModal
        service={verifyService}
        isOpen={!!verifyService}
        onClose={() => setVerifyService(null)}
      />
    </>
  );
}

export function FreeNumbersPage() {
  const { numbers, loading } = usePhoneNumbers();
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const freeNumbers = numbers.filter((n) => n.type === "free");

  return (
    <div className="w-full max-w-full overflow-hidden pt-16 sm:pt-20">
      <NumberList
        numbers={freeNumbers}
        type="free"
        loading={loading}
        onViewSms={setSelectedPhone}
      />
      <SmsModal phone={selectedPhone} onClose={() => setSelectedPhone(null)} />
    </div>
  );
}

export function PaidNumbersPage() {
  const { numbers, loading } = usePhoneNumbers();
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [verifyService, setVerifyService] = useState<VerificationService | null>(null);
  const paidNumbers = numbers.filter((n) => n.type === "paid");

  return (
    <div className="w-full max-w-full overflow-hidden pt-16 sm:pt-20">
      <NumberList
        numbers={paidNumbers}
        type="paid"
        loading={loading}
        onViewSms={setSelectedPhone}
      />
      <ActivationSection onBuy={setVerifyService} />
      <SmsModal phone={selectedPhone} onClose={() => setSelectedPhone(null)} />
      <VerificationModal
        service={verifyService}
        isOpen={!!verifyService}
        onClose={() => setVerifyService(null)}
      />
    </div>
  );
}
