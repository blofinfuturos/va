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
  user_id: string;
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
  user_id: string;
  type: "number_rental" | "credits";
  amount: number;
  credits_purchased: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  phone_number_id: string | null;
  user_email?: string;
};

export type Lang = "es" | "en" | "fr" | "de" | "it";
