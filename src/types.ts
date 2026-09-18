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
};

export type Lang = "es" | "en" | "fr" | "de" | "it";
