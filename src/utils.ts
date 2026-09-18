export function timeAgo(dateStr: string | null, lang: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units: { value: number; singular: Record<string, string>; plural: Record<string, string> }[] = [
    { value: 31536000, singular: { es: "año", en: "year", fr: "an", de: "Jahr", it: "anno" }, plural: { es: "años", en: "years", fr: "ans", de: "Jahre", it: "anni" } },
    { value: 2592000, singular: { es: "mes", en: "month", fr: "mois", de: "Monat", it: "mese" }, plural: { es: "meses", en: "months", fr: "mois", de: "Monate", it: "mesi" } },
    { value: 604800, singular: { es: "semana", en: "week", fr: "semaine", de: "Woche", it: "settimana" }, plural: { es: "semanas", en: "weeks", fr: "semaines", de: "Wochen", it: "settimane" } },
    { value: 86400, singular: { es: "día", en: "day", fr: "jour", de: "Tag", it: "giorno" }, plural: { es: "días", en: "days", fr: "jours", de: "Tage", it: "giorni" } },
    { value: 3600, singular: { es: "hora", en: "hour", fr: "heure", de: "Stunde", it: "ora" }, plural: { es: "horas", en: "hours", fr: "heures", de: "Stunden", it: "ore" } },
    { value: 60, singular: { es: "minuto", en: "minute", fr: "minute", de: "Minute", it: "minuto" }, plural: { es: "minutos", en: "minutes", fr: "minutes", de: "Minuten", it: "minuti" } },
    { value: 1, singular: { es: "segundo", en: "second", fr: "seconde", de: "Sekunde", it: "secondo" }, plural: { es: "segundos", en: "seconds", fr: "secondes", de: "Sekunden", it: "secondi" } },
  ];

  const agoWord: Record<string, string> = { es: "hace", en: "", fr: "il y a", de: "vor", it: "" };
  const agoSuffix: Record<string, string> = { es: "", en: "ago", fr: "", de: "", it: "fa" };

  for (const unit of units) {
    const interval = Math.floor(seconds / unit.value);
    if (interval >= 1) {
      const word = interval === 1 ? unit.singular[lang] : unit.plural[lang];
      const ago = agoWord[lang];
      const suffix = agoSuffix[lang];
      if (lang === "en") return `${interval} ${word} ${suffix}`.trim();
      if (lang === "it") return `${interval} ${word} ${suffix}`.trim();
      if (lang === "fr" || lang === "de") return `${ago} ${interval} ${word}`.trim();
      return `${ago} ${interval} ${word}`.trim();
    }
  }
  return agoWord[lang] + " 1 " + units[units.length - 1].singular[lang];
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}
