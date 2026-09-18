import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw, Copy, Check, Inbox, Radio } from "lucide-react";
import { useLang } from "@/LanguageContext";
import { supabase } from "@/supabaseClient";
import type { PhoneNumber, SmsMessage } from "@/types";
import { timeAgo, formatTime } from "@/utils";
import { PhoneCountryFlag } from "./CountryFlag";

type SmsModalProps = {
  phone: PhoneNumber | null;
  onClose: () => void;
};

export function SmsModal({ phone, onClose }: SmsModalProps) {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!phone) return;
    const { data, error } = await supabase
      .from("sms_messages")
      .select("*")
      .eq("phone_number_id", phone.id)
      .order("received_at", { ascending: false });

    if (error) {
      console.error("Error fetching SMS:", error);
    }
    setMessages(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [phone]);

  useEffect(() => {
    if (phone) {
      setLoading(true);
      setMessages([]);
      fetchMessages();
    }
  }, [phone, fetchMessages]);

  useEffect(() => {
    if (!phone) return;
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [phone, fetchMessages]);

  useEffect(() => {
    if (phone) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phone]);

  if (!phone) return null;

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const handleCopyMessage = (e: React.MouseEvent, msg: SmsMessage) => {
    e.stopPropagation();
    navigator.clipboard.writeText(msg.message);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone.number);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 p-2">
              <PhoneCountryFlag phone={phone} className="h-8 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xl font-bold text-white">{phone.number}</h3>
                <button
                  onClick={handleCopyNumber}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{phone.country_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t.sms.autoRefresh}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {t.sms.refresh}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="h-4 w-24 rounded bg-zinc-800" />
                  <div className="mt-3 h-4 w-full rounded bg-zinc-800/60" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-zinc-800/40" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <Inbox className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="mt-4 font-medium text-zinc-300">{t.sms.noMessages}</p>
              <p className="mt-1 text-sm text-zinc-500">{t.sms.noMessagesDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">
                        {msg.sender.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{msg.sender}</div>
                        <div className="text-xs text-zinc-500">
                          {formatTime(msg.received_at)} · {timeAgo(msg.received_at, lang)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopyMessage(e, msg)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/40 text-zinc-400 opacity-0 transition-all hover:text-emerald-400 group-hover:opacity-100"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
