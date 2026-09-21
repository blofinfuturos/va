import type { Lang } from "./types";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

type Dict = {
  nav: { home: string; freeNumbers: string; paidNumbers: string; verify: string; whyUs: string; faq: string };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    statsNumbers: string;
    statsCountries: string;
    statsMessages: string;
    statsOnline: string;
  };
  numbers: {
    freeTitle: string;
    freeSubtitle: string;
    paidTitle: string;
    paidSubtitle: string;
    country: string;
    received: string;
    viewSms: string;
    lastSms: string;
    ago: string;
    active: string;
    inactive: string;
    premium: string;
    noNumbers: string;
    filterAll: string;
    searchCountry: string;
    copies: string;
    copied: string;
  };
  sms: {
    title: string;
    subtitle: string;
    sender: string;
    message: string;
    received: string;
    refresh: string;
    noMessages: string;
    noMessagesDesc: string;
    autoRefresh: string;
    close: string;
    copy: string;
  };
  verify: {
    title: string;
    subtitle: string;
    badge: string;
    perService: string;
    buyBtn: string;
    selectService: string;
    instantCode: string;
    privateAccess: string;
    noRegistration: string;
    howItWorks: string;
    step1: string;
    step2: string;
    step3: string;
    modalTitle: string;
    modalSubtitle: string;
    yourEmail: string;
    emailOptional: string;
    payBtn: string;
    processing: string;
    successTitle: string;
    successSub: string;
    yourLink: string;
    copyLink: string;
    copied: string;
    goToVerify: string;
    saveLinkWarn: string;
    waitingTitle: string;
    waitingSub: string;
    codeReceived: string;
    codeLabel: string;
    copyCode: string;
    noCodeYet: string;
    noCodeDesc: string;
    expiresIn: string;
    expired: string;
    refresh: string;
    autoRefresh: string;
    backHome: string;
    invalidLink: string;
    invalidLinkDesc: string;
    service: string;
    price: string;
    status: string;
    statusWaiting: string;
    statusCompleted: string;
    statusExpired: string;
  };
  why: {
    title: string;
    subtitle: string;
    items: { icon: string; title: string; desc: string }[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: { q: string; a: string }[];
  };
  footer: {
    desc: string;
    product: string;
    links: { label: string; href: string }[];
    legal: string;
    legalLinks: { label: string; href: string }[];
    rights: string;
    disclaimer: string;
  };
};

export const translations: Record<Lang, Dict> = {
  es: {
    nav: { home: "Inicio", freeNumbers: "Números Gratis", paidNumbers: "Números Premium", verify: "Verificación SMS", whyUs: "Por Qué Elegirnos", faq: "FAQ" },
    hero: {
      badge: "Recibe SMS online al instante",
      title: "Tu número de teléfono virtual para",
      titleHighlight: "recibir SMS online",
      subtitle: "Usa nuestros números de teléfono temporales para recibir mensajes de verificación de WhatsApp, Telegram, Google, Facebook y más. Sin registro, sin coste, al instante.",
      searchPlaceholder: "Buscar país...",
      statsNumbers: "Números activos",
      statsCountries: "Países",
      statsMessages: "SMS recibidos",
      statsOnline: "En línea ahora",
    },
    numbers: {
      freeTitle: "Números Gratuitos",
      freeSubtitle: "Compartidos públicamente, ideales para verificaciones rápidas",
      paidTitle: "Números Premium",
      paidSubtitle: "Números privados exclusivos para ti, mayor privacidad y fiabilidad",
      country: "País",
      received: "SMS recibidos",
      viewSms: "Ver SMS",
      lastSms: "Último SMS",
      ago: "hace",
      active: "Activo",
      inactive: "Inactivo",
      premium: "PREMIUM",
      noNumbers: "No se encontraron números",
      filterAll: "Todos los países",
      searchCountry: "Buscar país...",
      copies: "Copiar número",
      copied: "¡Copiado!",
    },
    sms: {
      title: "Mensajes recibidos",
      subtitle: "SMS en tiempo real para este número",
      sender: "Remitente",
      message: "Mensaje",
      received: "Recibido",
      refresh: "Actualizar",
      noMessages: "Sin mensajes todavía",
      noMessagesDesc: "Los mensajes aparecerán aquí automáticamente cuando se reciban.",
      autoRefresh: "Auto-actualización activa",
      close: "Cerrar",
      copy: "Copiar",
    },
    verify: {
      title: "Verificación SMS por Servicio",
      subtitle: "¿Solo necesitas un código de un servicio concreto? Cómpralo por 0,50€ y recíbelo al instante",
      badge: "0,50€ por verificación",
      perService: "por verificación",
      buyBtn: "Comprar verificación",
      selectService: "Selecciona el servicio que necesitas verificar",
      instantCode: "Código instantáneo",
      privateAccess: "Acceso privado",
      noRegistration: "Sin registro",
      howItWorks: "¿Cómo funciona?",
      step1: "Elige el servicio (Telegram, WhatsApp, Google...) y paga 0,50€",
      step2: "Recibe tu enlace privado de acceso sin registrarte",
      step3: "Usa nuestro número en el servicio y recibe el código al instante",
      modalTitle: "Verificación SMS",
      modalSubtitle: "Recibe el código de un servicio concreto por solo 0,50€",
      yourEmail: "Tu correo (opcional, para recibir tu enlace)",
      emailOptional: "Opcional / Sin registro",
      payBtn: "Pagar 0,50€ con CoinPayments",
      processing: "Procesando pago...",
      successTitle: "¡Tu verificación está lista!",
      successSub: "Hemos creado tu enlace privado. Úsalo para ver tu código cuando llegue el SMS.",
      yourLink: "Tu enlace de acceso privado:",
      copyLink: "Copiar enlace",
      copied: "¡Copiado!",
      goToVerify: "Ver mi verificación ahora",
      saveLinkWarn: "Importante: Guarda este enlace. Sin él no podrás ver tu código. No se puede recuperar.",
      waitingTitle: "Esperando tu código SMS...",
      waitingSub: "Usa el número de abajo en el servicio que elegiste. El código aparecerá aquí automáticamente.",
      codeReceived: "¡Código recibido!",
      codeLabel: "Tu código de verificación:",
      copyCode: "Copiar código",
      noCodeYet: "Aún no se ha recibido el código",
      noCodeDesc: "Los mensajes aparecerán aquí automáticamente cuando se reciban.",
      expiresIn: "Expira en",
      expired: "Expirado",
      refresh: "Actualizar",
      autoRefresh: "Auto-actualización activa",
      backHome: "Volver al inicio",
      invalidLink: "Enlace no válido",
      invalidLinkDesc: "El enlace no corresponde a ninguna verificación activa. Comprueba que lo has copiado correctamente.",
      service: "Servicio",
      price: "Precio",
      status: "Estado",
      statusWaiting: "Esperando SMS",
      statusCompleted: "Completado",
      statusExpired: "Expirado",
    },
    why: {
      title: "Por Qué Elegirnos",
      subtitle: "La plataforma más fiable para recibir SMS online con números virtuales",
      items: [
        { icon: "zap", title: "Instantáneo", desc: "Recibe SMS en tiempo real sin esperas. Nuestros números procesan los mensajes en segundos." },
        { icon: "shield", title: "Privacidad Total", desc: "No necesitas registrar tu número personal. Protege tu identidad con números temporales." },
        { icon: "globe", title: "Cobertura Global", desc: "Números de más de 15 países: Estados Unidos, Reino Unido, Francia, Alemania, España y más." },
        { icon: "lock", title: "Sin Registro", desc: "Sin necesidad de crear cuenta. Selecciona un número y empieza a recibir SMS inmediatamente." },
        { icon: "clock", title: "Disponible 24/7", desc: "Nuestra plataforma funciona las 24 horas, todos los días del año, sin interrupciones." },
        { icon: "check", title: "Totalmente Gratuito", desc: "Los números gratuitos no tienen coste. Sin cargos ocultos, sin tarjetas, sin sorpresas." },
      ],
    },
    faq: {
      title: "Preguntas Frecuentes",
      subtitle: "Todo lo que necesitas saber sobre nuestro servicio de SMS temporales",
      items: [
        { q: "¿Cómo funciona el servicio?", a: "Simplemente selecciona un número de teléfono de nuestra lista, úsalo en el servicio que necesites verificar, y los SMS que reciba aparecerán automáticamente en nuestra página. No necesitas registrarte ni descargar nada." },
        { q: "¿Los números son gratuitos?", a: "Sí, ofrecemos números completamente gratuitos que son compartidos públicamente. También disponemos de números premium privados por una pequeña tarifa, ideales si necesitas exclusividad y mayor privacidad." },
        { q: "¿Es seguro usar estos números?", a: "Los números temporales son seguros para verificaciones de servicios no sensibles. No recomendamos usarlos para cuentas bancarias, servicios financieros o cualquier cuenta que contenga información personal sensible, ya que los mensajes son visibles públicamente en los números gratuitos." },
        { q: "¿Puedo recibir SMS de cualquier servicio?", a: "La mayoría de servicios populares funcionan con nuestros números: WhatsApp, Telegram, Google, Facebook, Instagram, TikTok, Discord, y muchos más. Algunos servicios pueden bloquear números virtuales, en cuyo caso te recomendamos probar con otro número." },
        { q: "¿Cuánto tardan en llegar los SMS?", a: "Normalmente los SMS aparecen en nuestra web entre 5 y 30 segundos después de ser enviados. Si no ves tu mensaje, espera unos segundos y pulsa el botón de actualizar." },
        { q: "¿Los mensajes se eliminan automáticamente?", a: "Sí, por privacidad y seguridad, los mensajes se eliminan automáticamente después de 24 horas. Nadie puede acceder a mensajes antiguos una vez eliminados." },
        { q: "¿Puedo enviar SMS desde estos números?", a: "No, nuestros números solo pueden recibir SMS. No es posible enviar mensajes ni realizar llamadas desde estos números virtuales." },
        { q: "¿Qué diferencia hay entre números gratis y premium?", a: "Los números gratuitos son compartidos: cualquier persona puede ver los SMS recibidos. Los números premium son privados y exclusivos para ti durante el periodo contratado, ofreciendo mayor privacidad y fiabilidad en la recepción." },
      ],
    },
    footer: {
      desc: "La forma más rápida y segura de recibir SMS online con números virtuales temporales. Sin registro, sin complicaciones.",
      product: "Producto",
      links: [
        { label: "Números Gratis", href: "/free" },
        { label: "Números Premium", href: "/paid" },
        { label: "Verificación SMS", href: "/verify" },
        { label: "Por Qué Elegirnos", href: "/#why" },
        { label: "Preguntas Frecuentes", href: "/#faq" },
      ],
      legal: "Legal",
      legalLinks: [
        { label: "Términos de Uso", href: "/terms" },
        { label: "Política de Privacidad", href: "/privacy" },
        { label: "Aviso Legal", href: "/disclaimer" },
      ],
      rights: "Todos los derechos reservados.",
      disclaimer: "Este servicio es solo para fines legítimos. No nos hacemos responsables del uso indebido de los números temporales.",
    },
  },
  en: {
    nav: { home: "Home", freeNumbers: "Free Numbers", paidNumbers: "Premium Numbers", verify: "SMS Verification", whyUs: "Why Choose Us", faq: "FAQ" },
    hero: {
      badge: "Receive SMS online instantly",
      title: "Your virtual phone number to",
      titleHighlight: "receive SMS online",
      subtitle: "Use our temporary phone numbers to receive verification messages from WhatsApp, Telegram, Google, Facebook and more. No registration, no cost, instant.",
      searchPlaceholder: "Search country...",
      statsNumbers: "Active numbers",
      statsCountries: "Countries",
      statsMessages: "SMS received",
      statsOnline: "Online now",
    },
    numbers: {
      freeTitle: "Free Numbers",
      freeSubtitle: "Publicly shared, ideal for quick verifications",
      paidTitle: "Premium Numbers",
      paidSubtitle: "Private numbers exclusive to you, more privacy and reliability",
      country: "Country",
      received: "SMS received",
      viewSms: "View SMS",
      lastSms: "Last SMS",
      ago: "ago",
      active: "Active",
      inactive: "Inactive",
      premium: "PREMIUM",
      noNumbers: "No numbers found",
      filterAll: "All countries",
      searchCountry: "Search country...",
      copies: "Copy number",
      copied: "Copied!",
    },
    sms: {
      title: "Received messages",
      subtitle: "Real-time SMS for this number",
      sender: "Sender",
      message: "Message",
      received: "Received",
      refresh: "Refresh",
      noMessages: "No messages yet",
      noMessagesDesc: "Messages will appear here automatically when received.",
      autoRefresh: "Auto-refresh active",
      close: "Close",
      copy: "Copy",
    },
    verify: {
      title: "SMS Verification by Service",
      subtitle: "Only need a code from one specific service? Get it for €0.50 instantly",
      badge: "€0.50 per verification",
      perService: "per verification",
      buyBtn: "Buy verification",
      selectService: "Select the service you need to verify",
      instantCode: "Instant code",
      privateAccess: "Private access",
      noRegistration: "No registration",
      howItWorks: "How it works",
      step1: "Choose the service (Telegram, WhatsApp, Google...) and pay €0.50",
      step2: "Get your private access link without registering",
      step3: "Use our number on the service and receive the code instantly",
      modalTitle: "SMS Verification",
      modalSubtitle: "Get a code from a specific service for just €0.50",
      yourEmail: "Your email (optional, to receive your link)",
      emailOptional: "Optional / No registration",
      payBtn: "Pay €0.50 with CoinPayments",
      processing: "Processing payment...",
      successTitle: "Your verification is ready!",
      successSub: "We've created your private link. Use it to see your code when the SMS arrives.",
      yourLink: "Your private access link:",
      copyLink: "Copy link",
      copied: "Copied!",
      goToVerify: "View my verification now",
      saveLinkWarn: "Important: Save this link. Without it you can't see your code. It cannot be recovered.",
      waitingTitle: "Waiting for your SMS code...",
      waitingSub: "Use the number below on the service you chose. The code will appear here automatically.",
      codeReceived: "Code received!",
      codeLabel: "Your verification code:",
      copyCode: "Copy code",
      noCodeYet: "No code received yet",
      noCodeDesc: "Messages will appear here automatically when received.",
      expiresIn: "Expires in",
      expired: "Expired",
      refresh: "Refresh",
      autoRefresh: "Auto-refresh active",
      backHome: "Back to home",
      invalidLink: "Invalid link",
      invalidLinkDesc: "This link doesn't match any active verification. Make sure you copied it correctly.",
      service: "Service",
      price: "Price",
      status: "Status",
      statusWaiting: "Waiting for SMS",
      statusCompleted: "Completed",
      statusExpired: "Expired",
    },
    why: {
      title: "Why Choose Us",
      subtitle: "The most reliable platform for receiving SMS online with virtual numbers",
      items: [
        { icon: "zap", title: "Instant", desc: "Receive SMS in real time without waiting. Our numbers process messages in seconds." },
        { icon: "shield", title: "Full Privacy", desc: "No need to register your personal number. Protect your identity with temporary numbers." },
        { icon: "globe", title: "Global Coverage", desc: "Numbers from over 15 countries: United States, United Kingdom, France, Germany, Spain and more." },
        { icon: "lock", title: "No Registration", desc: "No account needed. Pick a number and start receiving SMS immediately." },
        { icon: "clock", title: "Available 24/7", desc: "Our platform runs 24 hours a day, every day of the year, without interruptions." },
        { icon: "check", title: "Completely Free", desc: "Free numbers have no cost. No hidden charges, no cards, no surprises." },
      ],
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about our temporary SMS service",
      items: [
        { q: "How does the service work?", a: "Simply select a phone number from our list, use it on the service you need to verify, and the SMS it receives will appear automatically on our page. No registration or download needed." },
        { q: "Are the numbers free?", a: "Yes, we offer completely free numbers that are publicly shared. We also have private premium numbers for a small fee, ideal if you need exclusivity and greater privacy." },
        { q: "Is it safe to use these numbers?", a: "Temporary numbers are safe for non-sensitive service verifications. We do not recommend using them for bank accounts, financial services, or any account containing sensitive personal information, as messages are publicly visible on free numbers." },
        { q: "Can I receive SMS from any service?", a: "Most popular services work with our numbers: WhatsApp, Telegram, Google, Facebook, Instagram, TikTok, Discord, and many more. Some services may block virtual numbers, in which case we recommend trying another number." },
        { q: "How long do SMS take to arrive?", a: "SMS usually appears on our site within 5 to 30 seconds after being sent. If you don't see your message, wait a few seconds and press the refresh button." },
        { q: "Are messages automatically deleted?", a: "Yes, for privacy and security, messages are automatically deleted after 24 hours. No one can access old messages once deleted." },
        { q: "Can I send SMS from these numbers?", a: "No, our numbers can only receive SMS. It is not possible to send messages or make calls from these virtual numbers." },
        { q: "What is the difference between free and premium numbers?", a: "Free numbers are shared: anyone can see the received SMS. Premium numbers are private and exclusive to you during the contracted period, offering greater privacy and reliability in reception." },
      ],
    },
    footer: {
      desc: "The fastest and safest way to receive SMS online with temporary virtual numbers. No registration, no hassle.",
      product: "Product",
      links: [
        { label: "Free Numbers", href: "/free" },
        { label: "Premium Numbers", href: "/paid" },
        { label: "SMS Verification", href: "/verify" },
        { label: "Why Choose Us", href: "/#why" },
        { label: "FAQ", href: "/#faq" },
      ],
      legal: "Legal",
      legalLinks: [
        { label: "Terms of Use", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Disclaimer", href: "/disclaimer" },
      ],
      rights: "All rights reserved.",
      disclaimer: "This service is for legitimate purposes only. We are not responsible for misuse of temporary numbers.",
    },
  },
  fr: {
    nav: { home: "Accueil", freeNumbers: "Numéros Gratuits", paidNumbers: "Numéros Premium", verify: "Vérification SMS", whyUs: "Pourquoi Nous", faq: "FAQ" },
    hero: {
      badge: "Recevez des SMS en ligne instantanément",
      title: "Votre numéro de téléphone virtuel pour",
      titleHighlight: "recevoir des SMS en ligne",
      subtitle: "Utilisez nos numéros de téléphone temporaires pour recevoir des messages de vérification de WhatsApp, Telegram, Google, Facebook et plus. Sans inscription, sans coût, instantanément.",
      searchPlaceholder: "Rechercher un pays...",
      statsNumbers: "Numéros actifs",
      statsCountries: "Pays",
      statsMessages: "SMS reçus",
      statsOnline: "En ligne maintenant",
    },
    numbers: {
      freeTitle: "Numéros Gratuits",
      freeSubtitle: "Partagés publiquement, idéaux pour les vérifications rapides",
      paidTitle: "Numéros Premium",
      paidSubtitle: "Numéros privés exclusifs pour vous, plus de confidentialité et de fiabilité",
      country: "Pays",
      received: "SMS reçus",
      viewSms: "Voir les SMS",
      lastSms: "Dernier SMS",
      ago: "il y a",
      active: "Actif",
      inactive: "Inactif",
      premium: "PREMIUM",
      noNumbers: "Aucun numéro trouvé",
      filterAll: "Tous les pays",
      searchCountry: "Rechercher un pays...",
      copies: "Copier le numéro",
      copied: "Copié !",
    },
    sms: {
      title: "Messages reçus",
      subtitle: "SMS en temps réel pour ce numéro",
      sender: "Expéditeur",
      message: "Message",
      received: "Reçu",
      refresh: "Actualiser",
      noMessages: "Aucun message pour le moment",
      noMessagesDesc: "Les messages apparaîtront ici automatiquement dès réception.",
      autoRefresh: "Auto-actualisation active",
      close: "Fermer",
      copy: "Copier",
    },
    verify: {
      title: "Vérification SMS par Service",
      subtitle: "Besoin d'un code d'un service spécifique ? Obtenez-le pour 0,50€ instantanément",
      badge: "0,50€ par vérification",
      perService: "par vérification",
      buyBtn: "Acheter la vérification",
      selectService: "Sélectionnez le service à vérifier",
      instantCode: "Code instantané",
      privateAccess: "Accès privé",
      noRegistration: "Sans inscription",
      howItWorks: "Comment ça marche",
      step1: "Choisissez le service (Telegram, WhatsApp, Google...) et payez 0,50€",
      step2: "Recevez votre lien d'accès privé sans inscription",
      step3: "Utilisez notre numéro sur le service et recevez le code instantanément",
      modalTitle: "Vérification SMS",
      modalSubtitle: "Recevez le code d'un service spécifique pour seulement 0,50€",
      yourEmail: "Votre email (optionnel, pour recevoir votre lien)",
      emailOptional: "Optionnel / Sans inscription",
      payBtn: "Payer 0,50€ avec CoinPayments",
      processing: "Traitement du paiement...",
      successTitle: "Votre vérification est prête !",
      successSub: "Nous avons créé votre lien privé. Utilisez-le pour voir votre code quand le SMS arrive.",
      yourLink: "Votre lien d'accès privé :",
      copyLink: "Copier le lien",
      copied: "Copié !",
      goToVerify: "Voir ma vérification maintenant",
      saveLinkWarn: "Important : Sauvegardez ce lien. Sans lui, vous ne pouvez pas voir votre code. Il ne peut pas être récupéré.",
      waitingTitle: "En attente de votre code SMS...",
      waitingSub: "Utilisez le numéro ci-dessous sur le service choisi. Le code apparaîtra ici automatiquement.",
      codeReceived: "Code reçu !",
      codeLabel: "Votre code de vérification :",
      copyCode: "Copier le code",
      noCodeYet: "Aucun code reçu pour le moment",
      noCodeDesc: "Les messages apparaîtront ici automatiquement dès réception.",
      expiresIn: "Expire dans",
      expired: "Expiré",
      refresh: "Actualiser",
      autoRefresh: "Auto-actualisation active",
      backHome: "Retour à l'accueil",
      invalidLink: "Lien non valide",
      invalidLinkDesc: "Ce lien ne correspond à aucune vérification active. Vérifiez que vous l'avez bien copié.",
      service: "Service",
      price: "Prix",
      status: "Statut",
      statusWaiting: "En attente SMS",
      statusCompleted: "Complété",
      statusExpired: "Expiré",
    },
    why: {
      title: "Pourquoi Nous Choisir",
      subtitle: "La plateforme la plus fiable pour recevoir des SMS en ligne avec des numéros virtuels",
      items: [
        { icon: "zap", title: "Instantané", desc: "Recevez des SMS en temps réel sans attendre. Nos numéros traitent les messages en quelques secondes." },
        { icon: "shield", title: "Confidentialité Totale", desc: "Pas besoin d'enregistrer votre numéro personnel. Protégez votre identité avec des numéros temporaires." },
        { icon: "globe", title: "Couverture Mondiale", desc: "Numéros de plus de 15 pays : États-Unis, Royaume-Uni, France, Allemagne, Espagne et plus." },
        { icon: "lock", title: "Sans Inscription", desc: "Aucun compte nécessaire. Choisissez un numéro et commencez à recevoir des SMS immédiatement." },
        { icon: "clock", title: "Disponible 24/7", desc: "Notre plateforme fonctionne 24h/24, tous les jours de l'année, sans interruption." },
        { icon: "check", title: "Entièrement Gratuit", desc: "Les numéros gratuits n'ont aucun coût. Pas de frais cachés, pas de cartes, pas de surprises." },
      ],
    },
    faq: {
      title: "Questions Fréquentes",
      subtitle: "Tout ce que vous devez savoir sur notre service de SMS temporaires",
      items: [
        { q: "Comment fonctionne le service ?", a: "Sélectionnez simplement un numéro de téléphone dans notre liste, utilisez-le sur le service que vous devez vérifier, et les SMS reçus apparaîtront automatiquement sur notre page. Aucune inscription ni téléchargement nécessaire." },
        { q: "Les numéros sont-ils gratuits ?", a: "Oui, nous proposons des numéros entièrement gratuits partagés publiquement. Nous avons également des numéros premium privés pour une petite somme, idéaux si vous avez besoin d'exclusivité et de plus de confidentialité." },
        { q: "Est-il sûr d'utiliser ces numéros ?", a: "Les numéros temporaires sont sûrs pour les vérifications de services non sensibles. Nous déconseillons de les utiliser pour des comptes bancaires, des services financiers ou tout compte contenant des informations personnelles sensibles, car les messages sont visibles publiquement sur les numéros gratuits." },
        { q: "Puis-je recevoir des SMS de n'importe quel service ?", a: "La plupart des services populaires fonctionnent avec nos numéros : WhatsApp, Telegram, Google, Facebook, Instagram, TikTok, Discord, et bien d'autres. Certains services peuvent bloquer les numéros virtuels, auquel cas nous vous recommandons d'essayer un autre numéro." },
        { q: "Combien de temps mettent les SMS pour arriver ?", a: "Les SMS apparaissent généralement sur notre site dans les 5 à 30 secondes après l'envoi. Si vous ne voyez pas votre message, attendez quelques secondes et appuyez sur le bouton d'actualisation." },
        { q: "Les messages sont-ils automatiquement supprimés ?", a: "Oui, pour des raisons de confidentialité et de sécurité, les messages sont automatiquement supprimés après 24 heures. Personne ne peut accéder aux anciens messages une fois supprimés." },
        { q: "Puis-je envoyer des SMS depuis ces numéros ?", a: "Non, nos numéros peuvent uniquement recevoir des SMS. Il n'est pas possible d'envoyer des messages ou de passer des appels depuis ces numéros virtuels." },
        { q: "Quelle est la différence entre les numéros gratuits et premium ?", a: "Les numéros gratuits sont partagés : n'importe qui peut voir les SMS reçus. Les numéros premium sont privés et exclusifs pour vous pendant la période souscrite, offrant plus de confidentialité et de fiabilité dans la réception." },
      ],
    },
    footer: {
      desc: "Le moyen le plus rapide et le plus sûr de recevoir des SMS en ligne avec des numéros virtuels temporaires. Sans inscription, sans tracas.",
      product: "Produit",
      links: [
        { label: "Numéros Gratuits", href: "/free" },
        { label: "Numéros Premium", href: "/paid" },
        { label: "Vérification SMS", href: "/verify" },
        { label: "Pourquoi Nous", href: "/#why" },
        { label: "FAQ", href: "/#faq" },
      ],
      legal: "Légal",
      legalLinks: [
        { label: "Conditions d'Utilisation", href: "/terms" },
        { label: "Politique de Confidentialité", href: "/privacy" },
        { label: "Avis Légal", href: "/disclaimer" },
      ],
      rights: "Tous droits réservés.",
      disclaimer: "Ce service est destiné à un usage légitime uniquement. Nous ne sommes pas responsables de l'utilisation abusive des numéros temporaires.",
    },
  },
  de: {
    nav: { home: "Startseite", freeNumbers: "Kostenlose Nummern", paidNumbers: "Premium Nummern", verify: "SMS-Verifizierung", whyUs: "Warum Wir", faq: "FAQ" },
    hero: {
      badge: "SMS online sofort empfangen",
      title: "Deine virtuelle Telefonnummer zum",
      titleHighlight: "Online-SMS-Empfang",
      subtitle: "Nutze unsere temporären Telefonnummern, um Verifizierungs-SMS von WhatsApp, Telegram, Google, Facebook und mehr zu empfangen. Keine Registrierung, keine Kosten, sofort.",
      searchPlaceholder: "Land suchen...",
      statsNumbers: "Aktive Nummern",
      statsCountries: "Länder",
      statsMessages: "Empfangene SMS",
      statsOnline: "Jetzt online",
    },
    numbers: {
      freeTitle: "Kostenlose Nummern",
      freeSubtitle: "Öffentlich geteilt, ideal für schnelle Verifizierungen",
      paidTitle: "Premium Nummern",
      paidSubtitle: "Private Nummern exklusiv für dich, mehr Privatsphäre und Zuverlässigkeit",
      country: "Land",
      received: "Empfangene SMS",
      viewSms: "SMS ansehen",
      lastSms: "Letzte SMS",
      ago: "vor",
      active: "Aktiv",
      inactive: "Inaktiv",
      premium: "PREMIUM",
      noNumbers: "Keine Nummern gefunden",
      filterAll: "Alle Länder",
      searchCountry: "Land suchen...",
      copies: "Nummer kopieren",
      copied: "Kopiert!",
    },
    sms: {
      title: "Empfangene Nachrichten",
      subtitle: "Echtzeit-SMS für diese Nummer",
      sender: "Absender",
      message: "Nachricht",
      received: "Empfangen",
      refresh: "Aktualisieren",
      noMessages: "Noch keine Nachrichten",
      noMessagesDesc: "Nachrichten erscheinen hier automatisch beim Empfang.",
      autoRefresh: "Auto-Aktualisierung aktiv",
      close: "Schließen",
      copy: "Kopieren",
    },
    why: {
      title: "Warum Wir Wählen",
      subtitle: "Die zuverlässigste Plattform für den Online-SMS-Empfang mit virtuellen Nummern",
      items: [
        { icon: "zap", title: "Sofortig", desc: "Empfange SMS in Echtzeit ohne Wartezeit. Unsere Nummern verarbeiten Nachrichten in Sekunden." },
        { icon: "shield", title: "Volle Privatsphäre", desc: "Keine Notwendigkeit, deine persönliche Nummer zu registrieren. Schütze deine Identität mit temporären Nummern." },
        { icon: "globe", title: "Globale Abdeckung", desc: "Nummern aus über 15 Ländern: USA, Großbritannien, Frankreich, Deutschland, Spanien und mehr." },
        { icon: "lock", title: "Ohne Registrierung", desc: "Kein Konto erforderlich. Wähle eine Nummer und beginne sofort, SMS zu empfangen." },
        { icon: "clock", title: "24/7 Verfügbar", desc: "Unsere Plattform läuft rund um die Uhr, jeden Tag des Jahres, ohne Unterbrechungen." },
        { icon: "check", title: "Komplett Kostenlos", desc: "Kostenlose Nummern haben keinen Preis. Keine versteckten Gebühren, keine Karten, keine Überraschungen." },
      ],
    },
    faq: {
      title: "Häufig Gestellte Fragen",
      subtitle: "Alles, was du über unseren temporären SMS-Service wissen musst",
      items: [
        { q: "Wie funktioniert der Service?", a: "Wähle einfach eine Telefonnummer aus unserer Liste, verwende sie für den Service, den du verifizieren möchtest, und die empfangenen SMS erscheinen automatisch auf unserer Seite. Keine Registrierung oder Download erforderlich." },
        { q: "Sind die Nummern kostenlos?", a: "Ja, wir bieten vollständig kostenlose Nummern an, die öffentlich geteilt werden. Wir haben auch private Premium-Nummern für eine kleine Gebühr, ideal wenn du Exklusivität und mehr Privatsphäre benötigst." },
        { q: "Ist es sicher, diese Nummern zu verwenden?", a: "Temporäre Nummern sind sicher für Verifizierungen nicht sensibler Services. Wir raten davon ab, sie für Bankkonten, Finanzdienstleistungen oder Konten mit sensiblen persönlichen Informationen zu verwenden, da Nachrichten bei kostenlosen Nummern öffentlich sichtbar sind." },
        { q: "Kann ich SMS von jedem Service empfangen?", a: "Die meisten beliebten Services funktionieren mit unseren Nummern: WhatsApp, Telegram, Google, Facebook, Instagram, TikTok, Discord und viele mehr. Einige Services blockieren möglicherweise virtuelle Nummern, in diesem Fall empfehlen wir, eine andere Nummer zu versuchen." },
        { q: "Wie lange dauert es, bis SMS ankommen?", a: "SMS erscheinen normalerweise innerhalb von 5 bis 30 Sekunden nach dem Senden auf unserer Website. Wenn du deine Nachricht nicht siehst, warte einige Sekunden und drücke die Aktualisierungstaste." },
        { q: "Werden Nachrichten automatisch gelöscht?", a: "Ja, aus Gründen der Privatsphäre und Sicherheit werden Nachrichten nach 24 Stunden automatisch gelöscht. Niemand kann auf alte Nachrichten zugreifen, nachdem sie gelöscht wurden." },
        { q: "Kann ich SMS von diesen Nummern senden?", a: "Nein, unsere Nummern können nur SMS empfangen. Es ist nicht möglich, Nachrichten zu senden oder Anrufe von diesen virtuellen Nummern zu tätigen." },
        { q: "Was ist der Unterschied zwischen kostenlosen und Premium-Nummern?", a: "Kostenlose Nummern werden geteilt: Jeder kann die empfangenen SMS sehen. Premium-Nummern sind privat und exklusiv für dich während der gebuchten Laufzeit und bieten mehr Privatsphäre und Zuverlässigkeit beim Empfang." },
      ],
    },
    footer: {
      desc: "Der schnellste und sicherste Weg, SMS online mit temporären virtuellen Nummern zu empfangen. Keine Registrierung, kein Aufwand.",
      product: "Produkt",
      links: [
        { label: "Kostenlose Nummern", href: "/free" },
        { label: "Premium Nummern", href: "/paid" },
        { label: "SMS-Verifizierung", href: "/verify" },
        { label: "Warum Wir", href: "/#why" },
        { label: "FAQ", href: "/#faq" },
      ],
      legal: "Rechtliches",
      legalLinks: [
        { label: "Nutzungsbedingungen", href: "/terms" },
        { label: "Datenschutzrichtlinie", href: "/privacy" },
        { label: "Haftungsausschluss", href: "/disclaimer" },
      ],
      rights: "Alle Rechte vorbehalten.",
      disclaimer: "Dieser Service ist nur für legitime Zwecke bestimmt. Wir sind nicht verantwortlich für missbräuchliche Verwendung temporärer Nummern.",
    },
  },
  it: {
    nav: { home: "Home", freeNumbers: "Numeri Gratis", paidNumbers: "Numeri Premium", verify: "Verifica SMS", whyUs: "Perché Noi", faq: "FAQ" },
    hero: {
      badge: "Ricevi SMS online istantaneamente",
      title: "Il tuo numero di telefono virtuale per",
      titleHighlight: "ricevere SMS online",
      subtitle: "Usa i nostri numeri di telefono temporanei per ricevere messaggi di verifica da WhatsApp, Telegram, Google, Facebook e altro. Senza registrazione, senza costi, istantaneo.",
      searchPlaceholder: "Cerca paese...",
      statsNumbers: "Numeri attivi",
      statsCountries: "Paesi",
      statsMessages: "SMS ricevuti",
      statsOnline: "Online ora",
    },
    numbers: {
      freeTitle: "Numeri Gratuiti",
      freeSubtitle: "Condivisi pubblicamente, ideali per verifiche rapide",
      paidTitle: "Numeri Premium",
      paidSubtitle: "Numeri privati esclusivi per te, maggiore privacy e affidabilità",
      country: "Paese",
      received: "SMS ricevuti",
      viewSms: "Vedi SMS",
      lastSms: "Ultimo SMS",
      ago: "fa",
      active: "Attivo",
      inactive: "Inattivo",
      premium: "PREMIUM",
      noNumbers: "Nessun numero trovato",
      filterAll: "Tutti i paesi",
      searchCountry: "Cerca paese...",
      copies: "Copia numero",
      copied: "Copiato!",
    },
    sms: {
      title: "Messaggi ricevuti",
      subtitle: "SMS in tempo reale per questo numero",
      sender: "Mittente",
      message: "Messaggio",
      received: "Ricevuto",
      refresh: "Aggiorna",
      noMessages: "Nessun messaggio ancora",
      noMessagesDesc: "I messaggi appariranno qui automaticamente quando ricevuti.",
      autoRefresh: "Auto-aggiornamento attivo",
      close: "Chiudi",
      copy: "Copia",
    },
    verify: {
      title: "Verifica SMS per Servizio",
      subtitle: "Hai bisogno solo del codice di un servizio specifico? Ottienilo per 0,50€ istantaneamente",
      badge: "0,50€ per verifica",
      perService: "per verifica",
      buyBtn: "Acquista verifica",
      selectService: "Seleziona il servizio da verificare",
      instantCode: "Codice istantaneo",
      privateAccess: "Accesso privato",
      noRegistration: "Senza registrazione",
      howItWorks: "Come funziona",
      step1: "Scegli il servizio (Telegram, WhatsApp, Google...) e paga 0,50€",
      step2: "Ricevi il tuo link di accesso privato senza registrazione",
      step3: "Usa il nostro numero sul servizio e ricevi il codice istantaneamente",
      modalTitle: "Verifica SMS",
      modalSubtitle: "Ricevi il codice di un servizio specifico per solo 0,50€",
      yourEmail: "La tua email (opzionale, per ricevere il link)",
      emailOptional: "Opzionale / Senza registrazione",
      payBtn: "Paga 0,50€ con CoinPayments",
      processing: "Elaborazione pagamento...",
      successTitle: "La tua verifica è pronta!",
      successSub: "Abbiamo creato il tuo link privato. Usalo per vedere il tuo codice quando arriva l'SMS.",
      yourLink: "Il tuo link di accesso privato:",
      copyLink: "Copia link",
      copied: "Copiato!",
      goToVerify: "Vedi la mia verifica ora",
      saveLinkWarn: "Importante: Salva questo link. Senza di esso non puoi vedere il tuo codice. Non può essere recuperato.",
      waitingTitle: "In attesa del tuo codice SMS...",
      waitingSub: "Usa il numero qui sotto sul servizio scelto. Il codice apparirà qui automaticamente.",
      codeReceived: "Codice ricevuto!",
      codeLabel: "Il tuo codice di verifica:",
      copyCode: "Copia codice",
      noCodeYet: "Nessun codice ricevuto ancora",
      noCodeDesc: "I messaggi appariranno qui automaticamente quando ricevuti.",
      expiresIn: "Scade tra",
      expired: "Scaduto",
      refresh: "Aggiorna",
      autoRefresh: "Auto-aggiornamento attivo",
      backHome: "Torna alla home",
      invalidLink: "Link non valido",
      invalidLinkDesc: "Questo link non corrisponde a nessuna verifica attiva. Verifica di averlo copiato correttamente.",
      service: "Servizio",
      price: "Prezzo",
      status: "Stato",
      statusWaiting: "In attesa SMS",
      statusCompleted: "Completato",
      statusExpired: "Scaduto",
    },
    why: {
      title: "Perché Sceglierci",
      subtitle: "La piattaforma più affidabile per ricevere SMS online con numeri virtuali",
      items: [
        { icon: "zap", title: "Istantaneo", desc: "Ricevi SMS in tempo reale senza attese. I nostri numeri elaborano i messaggi in pochi secondi." },
        { icon: "shield", title: "Privacy Totale", desc: "Non devi registrare il tuo numero personale. Proteggi la tua identità con numeri temporanei." },
        { icon: "globe", title: "Copertura Globale", desc: "Numeri da oltre 15 paesi: Stati Uniti, Regno Unito, Francia, Germania, Spagna e altro." },
        { icon: "lock", title: "Senza Registrazione", desc: "Nessun account necessario. Scegli un numero e inizia a ricevere SMS immediatamente." },
        { icon: "clock", title: "Disponibile 24/7", desc: "La nostra piattaforma funziona 24 ore su 24, ogni giorno dell'anno, senza interruzioni." },
        { icon: "check", title: "Completamente Gratuito", desc: "I numeri gratuiti non hanno costi. Nessun costo nascosto, nessuna carta, nessuna sorpresa." },
      ],
    },
    faq: {
      title: "Domande Frequenti",
      subtitle: "Tutto ciò che devi sapere sul nostro servizio di SMS temporanei",
      items: [
        { q: "Come funziona il servizio?", a: "Seleziona semplicemente un numero di telefono dalla nostra lista, usalo sul servizio che devi verificare, e gli SMS ricevuti appariranno automaticamente sulla nostra pagina. Nessuna registrazione o download necessario." },
        { q: "I numeri sono gratuiti?", a: "Sì, offriamo numeri completamente gratuiti condivisi pubblicamente. Abbiamo anche numeri premium privati per una piccola tariffa, ideali se hai bisogno di esclusività e maggiore privacy." },
        { q: "È sicuro usare questi numeri?", a: "I numeri temporanei sono sicuri per verifiche di servizi non sensibili. Sconsigliamo di usarli per conti bancari, servizi finanziari o qualsiasi conto contenente informazioni personali sensibili, poiché i messaggi sono visibili pubblicamente sui numeri gratuiti." },
        { q: "Posso ricevere SMS da qualsiasi servizio?", a: "La maggior parte dei servizi popolari funziona con i nostri numeri: WhatsApp, Telegram, Google, Facebook, Instagram, TikTok, Discord e molti altri. Alcuni servizi potrebbero bloccare i numeri virtuali, in tal caso ti consigliamo di provare un altro numero." },
        { q: "Quanto tempo impiegano gli SMS ad arrivare?", a: "Gli SMS di solito appaiono sul nostro sito entro 5-30 secondi dall'invio. Se non vedi il tuo messaggio, attendi qualche secondo e premi il pulsante di aggiornamento." },
        { q: "I messaggi vengono eliminati automaticamente?", a: "Sì, per privacy e sicurezza, i messaggi vengono eliminati automaticamente dopo 24 ore. Nessuno può accedere ai vecchi messaggi una volta eliminati." },
        { q: "Posso inviare SMS da questi numeri?", a: "No, i nostri numeri possono solo ricevere SMS. Non è possibile inviare messaggi o effettuare chiamate da questi numeri virtuali." },
        { q: "Qual è la differenza tra numeri gratuiti e premium?", a: "I numeri gratuiti sono condivisi: chiunque può vedere gli SMS ricevuti. I numeri premium sono privati ed esclusivi per te durante il periodo contrattato, offrendo maggiore privacy e affidabilità nella ricezione." },
      ],
    },
    footer: {
      desc: "Il modo più veloce e sicuro per ricevere SMS online con numeri virtuali temporanei. Senza registrazione, senza complicazioni.",
      product: "Prodotto",
      links: [
        { label: "Numeri Gratis", href: "/free" },
        { label: "Numeri Premium", href: "/paid" },
        { label: "Verifica SMS", href: "/verify" },
        { label: "Perché Noi", href: "/#why" },
        { label: "FAQ", href: "/#faq" },
      ],
      legal: "Legale",
      legalLinks: [
        { label: "Termini di Uso", href: "/terms" },
        { label: "Informativa sulla Privacy", href: "/privacy" },
        { label: "Disclaimer", href: "/disclaimer" },
      ],
      rights: "Tutti i diritti riservati.",
      disclaimer: "Questo servizio è solo per scopi legittimi. Non siamo responsabili per l'uso improprio dei numeri temporanei.",
    },
  },
};

export function getLangFromPath(pathname: string): Lang {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === "es" || first === "en" || first === "fr" || first === "de" || first === "it") {
    return first;
  }
  return "es";
}

export function stripLang(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && ["es", "en", "fr", "de", "it"].includes(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

export function localizedPath(lang: Lang, path: string): string {
  const stripped = stripLang(path);
  if (stripped === "/" || stripped === "") {
    return `/${lang}`;
  }
  return `/${lang}${stripped}`;
}
