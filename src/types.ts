export type PhoneNumber = {
  id: string;
  number: string;
  country_code: string;
  country_name: string;
  country_flag: string;
  type: "free" | "paid";
  is_active: boolean;
  received_count: number;
  last_sms_at: string | null;
  created_at: string;
};

export type SmsMessage = {
  id: string;
  phone_number_id: string;
  sender: string;
  message: string;
  received_at: string;
  phone_numbers?: PhoneNumber;
};

export type Profile = {
  id: string;
  email: string;
  is_admin: boolean;
  credits: number;
  created_at: string;
};

export type Rental = {
  id: string;
  phone_number_id: string;
  user_id?: string | null;
  access_token?: string | null;
  guest_email?: string | null;
  status: "active" | "expired" | "cancelled";
  duration_hours: number;
  price: number;
  expires_at: string;
  created_at: string;
  phone_numbers?: PhoneNumber;
  user_email?: string;
};

export type Purchase = {
  id: string;
  user_id?: string | null;
  access_token?: string | null;
  guest_email?: string | null;
  type: "number_rental" | "credits";
  amount: number;
  credits_purchased: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  phone_number_id: string | null;
  user_email?: string;
};

export type VerificationService = {
  id: string;
  name: string;
  icon: string;
  color: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type VerificationPurchase = {
  id: string;
  service_id: string;
  phone_number_id: string | null;
  guest_email: string | null;
  access_token: string;
  status: "pending" | "waiting_sms" | "completed" | "expired" | "cancelled";
  price: number;
  verification_code: string | null;
  sms_sender: string | null;
  sms_message: string | null;
  sms_received_at: string | null;
  expires_at: string;
  created_at: string;
  service_name?: string;
  service_icon?: string;
  service_color?: string;
  phone_number?: string | null;
  country_code?: string | null;
  country_name?: string | null;
  country_flag?: string | null;
};

export type Lang = "es" | "en" | "fr" | "de" | "it";

export type RentalPlan = {
  id: string;
  hours: number;
  label: string;
  priceEur: number;
  credits: number;
  desc: string;
  popular?: boolean;
};

export const RENTAL_PLANS: RentalPlan[] = [
  { id: "24h", hours: 24, label: "24 Horas", priceEur: 1.49, credits: 5, desc: "Verificaciones rápidas e inmediatas" },
  { id: "7d", hours: 168, label: "7 Días", priceEur: 6.99, credits: 25, desc: "Recomendado para servicios semanales", popular: true },
  { id: "30d", hours: 720, label: "30 Días", priceEur: 18.99, credits: 80, desc: "Uso continuo y máxima privacidad" },
];
