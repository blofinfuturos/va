import type { Lang } from "./types";

export type AuthDict = {
  nav: { dashboard: string; admin: string; login: string; register: string; signOut: string };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    signingUp: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    errorRequired: string;
    errorEmail: string;
    errorPasswordLength: string;
    errorPasswordMatch: string;
    backHome: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    credits: string;
    creditsBalance: string;
    myRentals: string;
    myPurchases: string;
    accountInfo: string;
    noRentals: string;
    noRentalsDesc: string;
    noPurchases: string;
    noPurchasesDesc: string;
    rentalActive: string;
    rentalExpired: string;
    rentalCancelled: string;
    expiresAt: string;
    duration: string;
    price: string;
    status: string;
    date: string;
    type: string;
    amount: string;
    buyCredits: string;
    browseNumbers: string;
    memberSince: string;
    viewSms: string;
  };
  purchase: {
    title: string;
    subtitle: string;
    choosePlan: string;
    plan24h: string;
    plan7d: string;
    plan30d: string;
    plan24hDesc: string;
    plan7dDesc: string;
    plan30dDesc: string;
    buyNow: string;
    confirmPurchase: string;
    confirmDesc: string;
    payWithCredits: string;
    insufficientCredits: string;
    creditsNeeded: string;
    yourCredits: string;
    cancel: string;
    confirm: string;
    purchaseSuccess: string;
    purchaseSuccessDesc: string;
    purchaseError: string;
    hours: string;
    days: string;
    popular: string;
  };
  credits: {
    title: string;
    subtitle: string;
    pack10: string;
    pack25: string;
    pack50: string;
    pack100: string;
    pack10Desc: string;
    pack25Desc: string;
    pack50Desc: string;
    pack100Desc: string;
    credits: string;
    buy: string;
  };
  admin: {
    title: string;
    subtitle: string;
    overview: string;
    manageNumbers: string;
    manageUsers: string;
    managePurchases: string;
    manageRentals: string;
    smsInbox: string;
    assignedTo: string;
    available: string;
    rented: string;
    all: string;
    expiringSoon: string;
    extend: string;
    endRental: string;
    addCredits: string;
    smsReceived: string;
    expiration: string;
    totalUsers: string;
    totalRevenue: string;
    activeRentals: string;
    totalNumbers: string;
    addNumber: string;
    editNumber: string;
    deleteNumber: string;
    confirmDelete: string;
    number: string;
    country: string;
    type: string;
    status: string;
    actions: string;
    free: string;
    paid: string;
    active: string;
    inactive: string;
    save: string;
    cancel: string;
    email: string;
    role: string;
    admin: string;
    user: string;
    makeAdmin: string;
    removeAdmin: string;
    date: string;
    amount: string;
    userName: string;
    noUsers: string;
    noPurchases: string;
    revenueThisMonth: string;
    accessDenied: string;
    accessDeniedDesc: string;
  };
  coinpayments: {
    modalTitle: string;
    exclusiveBadge: string;
    modalSubtitle: string;
    price: string;
    newAndPrivate: string;
    selectDuration: string;
    plan24h: string;
    plan7d: string;
    plan30d: string;
    orCredits: string;
    paymentMethodTitle: string;
    cryptoMethod: string;
    cryptoSub: string;
    balanceMethod: string;
    selectCryptoTitle: string;
    lowFee: string;
    yourEmailGuest: string;
    payWithCryptoBtn: string;
    payWithCreditsBtn: string;
    secureBadge: string;
    instantBadge: string;
    orderIdLabel: string;
    scanWallet: string;
    exactAmount: string;
    network: string;
    copy: string;
    copied: string;
    copiedAddress: string;
    copiedAmount: string;
    depositAddress: string;
    cryptoWarning: string;
    iHavePaidBtn: string;
    backBtn: string;
    verifyingTitle: string;
    verifyingSub: string;
    pendingTitle: string;
    pendingSub: string;
    pendingOrderLabel: string;
    pendingHelpText: string;
    successTitle: string;
    successSub: string;
    activeNumber: string;
    duration: string;
    expires: string;
    goToDashboard: string;
    rentalPrices: string;
    noPriorHistory: string;
    topBadge: string;
    insufficientCredits: string;
    pleaseEnterEmail: string;
  };
};

export const authTranslations: Record<Lang, AuthDict> = {
  es: {
    nav: { dashboard: "Mi Panel", admin: "Administración", login: "Iniciar Sesión", register: "Registrarse", signOut: "Cerrar Sesión" },
    auth: {
      loginTitle: "Iniciar Sesión",
      loginSubtitle: "Accede a tu panel para gestionar tus números premium",
      registerTitle: "Crear Cuenta",
      registerSubtitle: "Regístrate para comprar y gestionar números premium",
      email: "Correo electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      signingIn: "Iniciando sesión...",
      signingUp: "Registrando...",
      alreadyHaveAccount: "¿Ya tienes cuenta? Inicia sesión",
      dontHaveAccount: "¿No tienes cuenta? Regístrate",
      errorRequired: "Este campo es obligatorio",
      errorEmail: "Introduce un correo válido",
      errorPasswordLength: "La contraseña debe tener al menos 6 caracteres",
      errorPasswordMatch: "Las contraseñas no coinciden",
      backHome: "Volver al inicio",
    },
    dashboard: {
      title: "Mi Panel",
      welcome: "Bienvenido",
      credits: "Créditos",
      creditsBalance: "Saldo de créditos",
      myRentals: "Mis alquileres",
      myPurchases: "Historial de compras",
      accountInfo: "Información de la cuenta",
      noRentals: "Sin alquileres activos",
      noRentalsDesc: "Aún no has alquilado ningún número premium. Explora nuestros números disponibles.",
      noPurchases: "Sin compras",
      noPurchasesDesc: "Aún no has realizado ninguna compra.",
      rentalActive: "Activo",
      rentalExpired: "Expirado",
      rentalCancelled: "Cancelado",
      expiresAt: "Expira",
      duration: "Duración",
      price: "Precio",
      status: "Estado",
      date: "Fecha",
      type: "Tipo",
      amount: "Importe",
      buyCredits: "Comprar créditos",
      browseNumbers: "Explorar números",
      memberSince: "Miembro desde",
      viewSms: "Ver SMS",
    },
    purchase: {
      title: "Alquilar número premium",
      subtitle: "Elige el plan que mejor se adapte a tus necesidades",
      choosePlan: "Elige un plan",
      plan24h: "24 horas",
      plan7d: "7 días",
      plan30d: "30 días",
      plan24hDesc: "Ideal para verificaciones rápidas",
      plan7dDesc: "Perfecto para uso prolongado",
      plan30dDesc: "Mejor relación calidad-precio",
      buyNow: "Comprar ahora",
      confirmPurchase: "Confirmar compra",
      confirmDesc: "Estás a punto de alquilar este número premium",
      payWithCredits: "Pagar con créditos",
      insufficientCredits: "Créditos insuficientes",
      creditsNeeded: "Créditos necesarios",
      yourCredits: "Tus créditos",
      cancel: "Cancelar",
      confirm: "Confirmar y pagar",
      purchaseSuccess: "¡Compra realizada!",
      purchaseSuccessDesc: "Tu número premium ya está disponible en tu panel",
      purchaseError: "Error al procesar la compra",
      hours: "horas",
      days: "días",
      popular: "Más popular",
    },
    credits: {
      title: "Comprar créditos",
      subtitle: "Usa créditos para alquilar números premium",
      pack10: "10 créditos",
      pack25: "25 créditos",
      pack50: "50 créditos",
      pack100: "100 créditos",
      pack10Desc: "Suficiente para 1-2 números",
      pack25Desc: "Ahorra un 10%",
      pack50Desc: "Ahorra un 20%",
      pack100Desc: "Mejor precio por crédito",
      credits: "créditos",
      buy: "Comprar",
    },
    admin: {
      title: "Panel de Administración",
      subtitle: "Gestiona números, usuarios y compras",
      overview: "Resumen",
      manageNumbers: "Gestionar números",
      manageUsers: "Gestionar usuarios",
      managePurchases: "Gestionar compras",
      manageRentals: "Alquileres de clientes",
      smsInbox: "Bandeja SMS Global",
      assignedTo: "Asignado a",
      available: "Disponible",
      rented: "Alquilado",
      all: "Todos",
      expiringSoon: "Por expirar (<24h)",
      extend: "Extender",
      endRental: "Finalizar alquiler",
      addCredits: "Añadir créditos",
      smsReceived: "SMS recibidos",
      expiration: "Vencimiento",
      totalUsers: "Usuarios totales",
      totalRevenue: "Ingresos totales",
      activeRentals: "Alquileres activos",
      totalNumbers: "Números totales",
      addNumber: "Añadir número",
      editNumber: "Editar número",
      deleteNumber: "Eliminar número",
      confirmDelete: "¿Seguro que quieres eliminar este número?",
      number: "Número",
      country: "País",
      type: "Tipo",
      status: "Estado",
      actions: "Acciones",
      free: "Gratis",
      paid: "Premium",
      active: "Activo",
      inactive: "Inactivo",
      save: "Guardar",
      cancel: "Cancelar",
      email: "Correo",
      role: "Rol",
      admin: "Admin",
      user: "Usuario",
      makeAdmin: "Hacer admin",
      removeAdmin: "Quitar admin",
      date: "Fecha",
      amount: "Importe",
      userName: "Usuario",
      noUsers: "No hay usuarios",
      noPurchases: "No hay compras",
      revenueThisMonth: "Ingresos este mes",
      accessDenied: "Acceso denegado",
      accessDeniedDesc: "No tienes permisos de administrador",
    },
    coinpayments: {
      modalTitle: "Comprar Número Premium",
      exclusiveBadge: "Exclusivo",
      modalSubtitle: "Pago seguro mediante CoinPayments Gateway",
      price: "Precio",
      newAndPrivate: "Número Nuevo & 100% Privado",
      selectDuration: "1. Selecciona la duración del alquiler",
      plan24h: "24 Horas",
      plan7d: "7 Días",
      plan30d: "30 Días",
      orCredits: "o {n} créditos",
      paymentMethodTitle: "2. Método de pago",
      cryptoMethod: "CoinPayments",
      cryptoSub: "Criptomonedas (USDT/BTC/LTC)",
      balanceMethod: "Saldo de Cuenta",
      selectCryptoTitle: "3. Selecciona tu Criptomoneda",
      lowFee: "Baja comisión",
      yourEmailGuest: "Tu correo electrónico (para recibir tu número y ver tus SMS):",
      payWithCryptoBtn: "Pagar {amount} € con CoinPayments ({crypto})",
      payWithCreditsBtn: "Pagar {credits} Créditos de mi Saldo",
      secureBadge: "CoinPayments Seguro",
      instantBadge: "Activación Inmediata",
      orderIdLabel: "Orden CoinPayments:",
      scanWallet: "Escanear con tu Wallet",
      exactAmount: "Monto exacto a enviar:",
      network: "Red:",
      copy: "Copiar",
      copied: "Copiado",
      copiedAddress: "Dirección copiada",
      copiedAmount: "Monto copiado",
      depositAddress: "Dirección de depósito CoinPayments:",
      cryptoWarning: "Envía únicamente {crypto} mediante la red {network}. La activación del número es automática tras la confirmación de la red.",
      iHavePaidBtn: "Ya he enviado el pago (Verificar en Red)",
      backBtn: "← Volver y cambiar criptomoneda o duración",
      verifyingTitle: "Verificando transacción en CoinPayments...",
      verifyingSub: "Escaneando la red blockchain y confirmando el depósito de {amount} {crypto}...",
      pendingTitle: "Pago pendiente de verificación",
      pendingSub: "Hemos registrado tu pedido. Tu pago está siendo verificado en la red blockchain.",
      pendingOrderLabel: "Pedido:",
      pendingHelpText: "En cuanto se confirme tu pago en la red, tu número será activado automáticamente. No es necesario que hagas nada más. Este proceso puede tardar unos minutos.",
      successTitle: "¡Pago Verificado con Éxito!",
      successSub: "Tu número exclusivo ha sido asignado y reservado para tu uso personal.",
      activeNumber: "Número Premium Activo:",
      duration: "Duración:",
      expires: "Vence:",
      goToDashboard: "Ir a Mi Panel de Control",
      rentalPrices: "Precios de alquiler:",
      noPriorHistory: "Sin historial previo",
      topBadge: "Top",
      insufficientCredits: "Saldo insuficiente. Necesitas {needed} créditos y tienes {have}.",
      pleaseEnterEmail: "Por favor, introduce un correo electrónico válido.",
    },
  },
  en: {
    nav: { dashboard: "My Dashboard", admin: "Admin", login: "Sign In", register: "Sign Up", signOut: "Sign Out" },
    auth: {
      loginTitle: "Sign In",
      loginSubtitle: "Access your dashboard to manage your premium numbers",
      registerTitle: "Create Account",
      registerSubtitle: "Sign up to buy and manage premium numbers",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      signIn: "Sign In",
      signUp: "Sign Up",
      signingIn: "Signing in...",
      signingUp: "Signing up...",
      alreadyHaveAccount: "Already have an account? Sign in",
      dontHaveAccount: "Don't have an account? Sign up",
      errorRequired: "This field is required",
      errorEmail: "Enter a valid email",
      errorPasswordLength: "Password must be at least 6 characters",
      errorPasswordMatch: "Passwords do not match",
      backHome: "Back to home",
    },
    dashboard: {
      title: "My Dashboard",
      welcome: "Welcome",
      credits: "Credits",
      creditsBalance: "Credits balance",
      myRentals: "My rentals",
      myPurchases: "Purchase history",
      accountInfo: "Account info",
      noRentals: "No active rentals",
      noRentalsDesc: "You haven't rented any premium number yet. Explore our available numbers.",
      noPurchases: "No purchases",
      noPurchasesDesc: "You haven't made any purchase yet.",
      rentalActive: "Active",
      rentalExpired: "Expired",
      rentalCancelled: "Cancelled",
      expiresAt: "Expires",
      duration: "Duration",
      price: "Price",
      status: "Status",
      date: "Date",
      type: "Type",
      amount: "Amount",
      buyCredits: "Buy credits",
      browseNumbers: "Browse numbers",
      memberSince: "Member since",
      viewSms: "View SMS",
    },
    purchase: {
      title: "Rent premium number",
      subtitle: "Choose the plan that best fits your needs",
      choosePlan: "Choose a plan",
      plan24h: "24 hours",
      plan7d: "7 days",
      plan30d: "30 days",
      plan24hDesc: "Ideal for quick verifications",
      plan7dDesc: "Perfect for extended use",
      plan30dDesc: "Best value for money",
      buyNow: "Get Number",
      confirmPurchase: "Confirm purchase",
      confirmDesc: "You are about to rent this premium number",
      payWithCredits: "Pay with credits",
      insufficientCredits: "Insufficient credits",
      creditsNeeded: "Credits needed",
      yourCredits: "Your credits",
      cancel: "Cancel",
      confirm: "Confirm and pay",
      purchaseSuccess: "Purchase complete!",
      purchaseSuccessDesc: "Your premium number is now available in your dashboard",
      purchaseError: "Error processing purchase",
      hours: "hours",
      days: "days",
      popular: "Most popular",
    },
    credits: {
      title: "Buy credits",
      subtitle: "Use credits to rent premium numbers",
      pack10: "10 credits",
      pack25: "25 credits",
      pack50: "50 credits",
      pack100: "100 credits",
      pack10Desc: "Enough for 1-2 numbers",
      pack25Desc: "Save 10%",
      pack50Desc: "Save 20%",
      pack100Desc: "Best price per credit",
      credits: "credits",
      buy: "Buy",
    },
    admin: {
      title: "Admin Panel",
      subtitle: "Manage numbers, users and purchases",
      overview: "Overview",
      manageNumbers: "Manage numbers",
      manageUsers: "Manage users",
      managePurchases: "Manage purchases",
      manageRentals: "Customer rentals",
      smsInbox: "Global SMS Inbox",
      assignedTo: "Assigned to",
      available: "Available",
      rented: "Rented",
      all: "All",
      expiringSoon: "Expiring soon (<24h)",
      extend: "Extend",
      endRental: "End rental",
      addCredits: "Add credits",
      smsReceived: "SMS received",
      expiration: "Expiration",
      totalUsers: "Total users",
      totalRevenue: "Total revenue",
      activeRentals: "Active rentals",
      totalNumbers: "Total numbers",
      addNumber: "Add number",
      editNumber: "Edit number",
      deleteNumber: "Delete number",
      confirmDelete: "Are you sure you want to delete this number?",
      number: "Number",
      country: "Country",
      type: "Type",
      status: "Status",
      actions: "Actions",
      free: "Free",
      paid: "Premium",
      active: "Active",
      inactive: "Inactive",
      save: "Save",
      cancel: "Cancel",
      email: "Email",
      role: "Role",
      admin: "Admin",
      user: "User",
      makeAdmin: "Make admin",
      removeAdmin: "Remove admin",
      date: "Date",
      amount: "Amount",
      userName: "User",
      noUsers: "No users",
      noPurchases: "No purchases",
      revenueThisMonth: "Revenue this month",
      accessDenied: "Access denied",
      accessDeniedDesc: "You don't have admin permissions",
    },
    coinpayments: {
      modalTitle: "Buy Premium Number",
      exclusiveBadge: "Exclusive",
      modalSubtitle: "Secure payment via CoinPayments Gateway",
      price: "Price",
      newAndPrivate: "100% Brand New & Private Number",
      selectDuration: "1. Select rental duration",
      plan24h: "24 Hours",
      plan7d: "7 Days",
      plan30d: "30 Days",
      orCredits: "or {n} credits",
      paymentMethodTitle: "2. Payment method",
      cryptoMethod: "CoinPayments",
      cryptoSub: "Cryptocurrency (USDT/BTC/LTC)",
      balanceMethod: "Account Balance",
      selectCryptoTitle: "3. Select your Cryptocurrency",
      lowFee: "Low network fee",
      yourEmailGuest: "Your email address (to receive your number and SMS access):",
      payWithCryptoBtn: "Pay {amount} € with CoinPayments ({crypto})",
      payWithCreditsBtn: "Pay {credits} Credits from my Balance",
      secureBadge: "Secure CoinPayments",
      instantBadge: "Instant Activation",
      orderIdLabel: "CoinPayments Order:",
      scanWallet: "Scan with your Wallet",
      exactAmount: "Exact amount to send:",
      network: "Network:",
      copy: "Copy",
      copied: "Copied",
      copiedAddress: "Address copied",
      copiedAmount: "Amount copied",
      depositAddress: "CoinPayments deposit address:",
      cryptoWarning: "Send only {crypto} using the {network} network. Your number is activated automatically once confirmed on blockchain.",
      iHavePaidBtn: "I have sent the payment (Verify Network)",
      backBtn: "← Go back and change crypto or duration",
      verifyingTitle: "Verifying transaction on CoinPayments...",
      verifyingSub: "Scanning blockchain and verifying deposit of {amount} {crypto}...",
      pendingTitle: "Payment pending verification",
      pendingSub: "We have registered your order. Your payment is being verified on the blockchain network.",
      pendingOrderLabel: "Order:",
      pendingHelpText: "Once your payment is confirmed on the network, your number will be activated automatically. You don't need to do anything else. This process may take a few minutes.",
      successTitle: "Payment Verified Successfully!",
      successSub: "Your exclusive number has been allocated and reserved for your personal use.",
      activeNumber: "Active Premium Number:",
      duration: "Duration:",
      expires: "Expires:",
      goToDashboard: "Go to My Dashboard",
      rentalPrices: "Rental prices:",
      noPriorHistory: "No prior history",
      topBadge: "Top",
      insufficientCredits: "Insufficient balance. You need {needed} credits and have {have}.",
      pleaseEnterEmail: "Please enter a valid email address.",
    },
  },
  fr: {
    nav: { dashboard: "Mon Tableau", admin: "Administration", login: "Connexion", register: "Inscription", signOut: "Déconnexion" },
    auth: {
      loginTitle: "Connexion",
      loginSubtitle: "Accédez à votre tableau de bord pour gérer vos numéros premium",
      registerTitle: "Créer un compte",
      registerSubtitle: "Inscrivez-vous pour acheter et gérer des numéros premium",
      email: "Adresse e-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      signIn: "Se connecter",
      signUp: "S'inscrire",
      signingIn: "Connexion...",
      signingUp: "Inscription...",
      alreadyHaveAccount: "Vous avez déjà un compte ? Connectez-vous",
      dontHaveAccount: "Pas de compte ? Inscrivez-vous",
      errorRequired: "Ce champ est obligatoire",
      errorEmail: "Entrez un e-mail valide",
      errorPasswordLength: "Le mot de passe doit avoir au moins 6 caractères",
      errorPasswordMatch: "Les mots de passe ne correspondent pas",
      backHome: "Retour à l'accueil",
    },
    dashboard: {
      title: "Mon Tableau",
      welcome: "Bienvenue",
      credits: "Crédits",
      creditsBalance: "Solde de crédits",
      myRentals: "Mes locations",
      myPurchases: "Historique d'achats",
      accountInfo: "Informations du compte",
      noRentals: "Aucune location active",
      noRentalsDesc: "Vous n'avez pas encore loué de numéro premium. Explorez nos numéros disponibles.",
      noPurchases: "Aucun achat",
      noPurchasesDesc: "Vous n'avez pas encore effectué d'achat.",
      rentalActive: "Actif",
      rentalExpired: "Expiré",
      rentalCancelled: "Annulé",
      expiresAt: "Expire",
      duration: "Durée",
      price: "Prix",
      status: "Statut",
      date: "Date",
      type: "Type",
      amount: "Montant",
      buyCredits: "Acheter des crédits",
      browseNumbers: "Explorer les numéros",
      memberSince: "Membre depuis",
      viewSms: "Voir les SMS",
    },
    purchase: {
      title: "Louer un numéro premium",
      subtitle: "Choisissez le plan qui correspond le mieux à vos besoins",
      choosePlan: "Choisissez un plan",
      plan24h: "24 heures",
      plan7d: "7 jours",
      plan30d: "30 jours",
      plan24hDesc: "Idéal pour les vérifications rapides",
      plan7dDesc: "Parfait pour une utilisation prolongée",
      plan30dDesc: "Meilleur rapport qualité-prix",
      buyNow: "Acheter maintenant",
      confirmPurchase: "Confirmer l'achat",
      confirmDesc: "Vous êtes sur le point de louer ce numéro premium",
      payWithCredits: "Payer avec des crédits",
      insufficientCredits: "Crédits insuffisants",
      creditsNeeded: "Crédits nécessaires",
      yourCredits: "Vos crédits",
      cancel: "Annuler",
      confirm: "Confirmer et payer",
      purchaseSuccess: "Achat effectué !",
      purchaseSuccessDesc: "Votre numéro premium est maintenant disponible dans votre tableau de bord",
      purchaseError: "Erreur lors du traitement de l'achat",
      hours: "heures",
      days: "jours",
      popular: "Le plus populaire",
    },
    credits: {
      title: "Acheter des crédits",
      subtitle: "Utilisez des crédits pour louer des numéros premium",
      pack10: "10 crédits",
      pack25: "25 crédits",
      pack50: "50 crédits",
      pack100: "100 crédits",
      pack10Desc: "Assez pour 1-2 numéros",
      pack25Desc: "Économisez 10%",
      pack50Desc: "Économisez 20%",
      pack100Desc: "Meilleur prix par crédit",
      credits: "crédits",
      buy: "Acheter",
    },
    admin: {
      title: "Panel d'Administration",
      subtitle: "Gérez les numéros, utilisateurs et achats",
      overview: "Aperçu",
      manageNumbers: "Gérer les numéros",
      manageUsers: "Gérer les utilisateurs",
      managePurchases: "Gérer les achats",
      manageRentals: "Locations clients",
      smsInbox: "Boîte SMS Globale",
      assignedTo: "Assigné à",
      available: "Disponible",
      rented: "Loué",
      all: "Tous",
      expiringSoon: "Expire bientôt (<24h)",
      extend: "Prolonger",
      endRental: "Terminer la location",
      addCredits: "Ajouter crédits",
      smsReceived: "SMS reçus",
      expiration: "Expiration",
      totalUsers: "Utilisateurs totaux",
      totalRevenue: "Revenus totaux",
      activeRentals: "Locations actives",
      totalNumbers: "Numéros totaux",
      addNumber: "Ajouter un numéro",
      editNumber: "Modifier le numéro",
      deleteNumber: "Supprimer le numéro",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer ce numéro ?",
      number: "Numéro",
      country: "Pays",
      type: "Type",
      status: "Statut",
      actions: "Actions",
      free: "Gratuit",
      paid: "Premium",
      active: "Actif",
      inactive: "Inactif",
      save: "Enregistrer",
      cancel: "Annuler",
      email: "E-mail",
      role: "Rôle",
      admin: "Admin",
      user: "Utilisateur",
      makeAdmin: "Rendre admin",
      removeAdmin: "Retirer admin",
      date: "Date",
      amount: "Montant",
      userName: "Utilisateur",
      noUsers: "Aucun utilisateur",
      noPurchases: "Aucun achat",
      revenueThisMonth: "Revenus ce mois",
      accessDenied: "Accès refusé",
      accessDeniedDesc: "Vous n'avez pas les permissions d'administrateur",
    },
    coinpayments: {
      modalTitle: "Acheter un Numéro Premium",
      exclusiveBadge: "Exclusif",
      modalSubtitle: "Paiement sécurisé via la passerelle CoinPayments",
      price: "Prix",
      newAndPrivate: "Numéro Neuf & 100% Privé",
      selectDuration: "1. Choisissez la durée de location",
      plan24h: "24 Heures",
      plan7d: "7 Jours",
      plan30d: "30 Jours",
      orCredits: "ou {n} crédits",
      paymentMethodTitle: "2. Mode de paiement",
      cryptoMethod: "CoinPayments",
      cryptoSub: "Cryptomonnaie (USDT/BTC/LTC)",
      balanceMethod: "Solde du compte",
      selectCryptoTitle: "3. Choisissez votre Cryptomonnaie",
      lowFee: "Frais réduits",
      yourEmailGuest: "Votre adresse email (pour recevoir votre numéro et voir vos SMS) :",
      payWithCryptoBtn: "Payer {amount} € avec CoinPayments ({crypto})",
      payWithCreditsBtn: "Payer {credits} Crédits de mon solde",
      secureBadge: "CoinPayments Sécurisé",
      instantBadge: "Activation Immédiate",
      orderIdLabel: "Commande CoinPayments :",
      scanWallet: "Scanner avec votre Portefeuille",
      exactAmount: "Montant exact à envoyer :",
      network: "Réseau :",
      copy: "Copier",
      copied: "Copié",
      copiedAddress: "Adresse copiée",
      copiedAmount: "Montant copié",
      depositAddress: "Adresse de dépôt CoinPayments :",
      cryptoWarning: "Envoyez uniquement {crypto} via le réseau {network}. L'activation est automatique dès confirmation sur la blockchain.",
      iHavePaidBtn: "J'ai déjà envoyé le paiement (Vérifier)",
      backBtn: "← Retour pour changer de devise ou de durée",
      verifyingTitle: "Vérification de la transaction sur CoinPayments...",
      verifyingSub: "Analyse de la blockchain et confirmation du dépôt de {amount} {crypto}...",
      pendingTitle: "Paiement en attente de vérification",
      pendingSub: "Nous avons enregistré votre commande. Votre paiement est en cours de vérification sur la blockchain.",
      pendingOrderLabel: "Commande :",
      pendingHelpText: "Dès que votre paiement sera confirmé sur le réseau, votre numéro sera activé automatiquement. Vous n'avez rien d'autre à faire. Ce processus peut prendre quelques minutes.",
      successTitle: "Paiement Vérifié avec Succès !",
      successSub: "Votre numéro exclusif vous a été attribué et réservé pour votre usage personnel.",
      activeNumber: "Numéro Premium Actif :",
      duration: "Durée :",
      expires: "Expire le :",
      goToDashboard: "Accéder à Mon Tableau de Bord",
      rentalPrices: "Tarifs de location :",
      noPriorHistory: "Sans aucun historique antérieur",
      topBadge: "Top",
      insufficientCredits: "Solde insuffisant. Vous avez besoin de {needed} crédits et vous en avez {have}.",
      pleaseEnterEmail: "Veuillez saisir une adresse email valide.",
    },
  },
  de: {
    nav: { dashboard: "Mein Dashboard", admin: "Verwaltung", login: "Anmelden", register: "Registrieren", signOut: "Abmelden" },
    auth: {
      loginTitle: "Anmelden",
      loginSubtitle: "Greife auf dein Dashboard zu, um deine Premium-Nummern zu verwalten",
      registerTitle: "Konto erstellen",
      registerSubtitle: "Registriere dich, um Premium-Nummern zu kaufen und zu verwalten",
      email: "E-Mail-Adresse",
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      signIn: "Anmelden",
      signUp: "Registrieren",
      signingIn: "Anmelden...",
      signingUp: "Registrieren...",
      alreadyHaveAccount: "Schon ein Konto? Anmelden",
      dontHaveAccount: "Kein Konto? Registrieren",
      errorRequired: "Dieses Feld ist erforderlich",
      errorEmail: "Gib eine gültige E-Mail ein",
      errorPasswordLength: "Passwort muss mindestens 6 Zeichen lang sein",
      errorPasswordMatch: "Passwörter stimmen nicht überein",
      backHome: "Zurück zur Startseite",
    },
    dashboard: {
      title: "Mein Dashboard",
      welcome: "Willkommen",
      credits: "Guthaben",
      creditsBalance: "Guthabenstand",
      myRentals: "Meine Mietverträge",
      myPurchases: "Kaufhistorie",
      accountInfo: "Kontoinformationen",
      noRentals: "Keine aktiven Mietverträge",
      noRentalsDesc: "Du hast noch keine Premium-Nummer gemietet. Entdecke unsere verfügbaren Nummern.",
      noPurchases: "Keine Käufe",
      noPurchasesDesc: "Du hast noch keinen Kauf getätigt.",
      rentalActive: "Aktiv",
      rentalExpired: "Abgelaufen",
      rentalCancelled: "Storniert",
      expiresAt: "Läuft ab",
      duration: "Dauer",
      price: "Preis",
      status: "Status",
      date: "Datum",
      type: "Typ",
      amount: "Betrag",
      buyCredits: "Guthaben kaufen",
      browseNumbers: "Nummern durchsuchen",
      memberSince: "Mitglied seit",
      viewSms: "SMS ansehen",
    },
    purchase: {
      title: "Premium-Nummer mieten",
      subtitle: "Wähle den Plan, der am besten zu deinen Bedürfnissen passt",
      choosePlan: "Wähle einen Plan",
      plan24h: "24 Stunden",
      plan7d: "7 Tage",
      plan30d: "30 Tage",
      plan24hDesc: "Ideal für schnelle Verifizierungen",
      plan7dDesc: "Perfekt für längere Nutzung",
      plan30dDesc: "Bestes Preis-Leistungs-Verhältnis",
      buyNow: "Jetzt kaufen",
      confirmPurchase: "Kauf bestätigen",
      confirmDesc: "Du bist dabei, diese Premium-Nummer zu mieten",
      payWithCredits: "Mit Guthaben bezahlen",
      insufficientCredits: "Nicht genügend Guthaben",
      creditsNeeded: "Benötigtes Guthaben",
      yourCredits: "Dein Guthaben",
      cancel: "Abbrechen",
      confirm: "Bestätigen und bezahlen",
      purchaseSuccess: "Kauf abgeschlossen!",
      purchaseSuccessDesc: "Deine Premium-Nummer ist jetzt in deinem Dashboard verfügbar",
      purchaseError: "Fehler beim Verarbeiten des Kaufs",
      hours: "Stunden",
      days: "Tage",
      popular: "Beliebteste",
    },
    credits: {
      title: "Guthaben kaufen",
      subtitle: "Nutze Guthaben, um Premium-Nummern zu mieten",
      pack10: "10 Guthaben",
      pack25: "25 Guthaben",
      pack50: "50 Guthaben",
      pack100: "100 Guthaben",
      pack10Desc: "Reicht für 1-2 Nummern",
      pack25Desc: "Spare 10%",
      pack50Desc: "Spare 20%",
      pack100Desc: "Bester Preis pro Guthaben",
      credits: "Guthaben",
      buy: "Kaufen",
    },
    admin: {
      title: "Administrationspanel",
      subtitle: "Verwalte Nummern, Benutzer und Käufe",
      overview: "Übersicht",
      manageNumbers: "Nummern verwalten",
      manageUsers: "Benutzer verwalten",
      managePurchases: "Käufe verwalten",
      manageRentals: "Kundenmieten",
      smsInbox: "Globales SMS-Postfach",
      assignedTo: "Zugewiesen an",
      available: "Verfügbar",
      rented: "Vermietet",
      all: "Alle",
      expiringSoon: "Läuft bald ab (<24h)",
      extend: "Verlängern",
      endRental: "Miete beenden",
      addCredits: "Guthaben aufladen",
      smsReceived: "Empfangene SMS",
      expiration: "Ablauf",
      totalUsers: "Benutzer gesamt",
      totalRevenue: "Gesamteinnahmen",
      activeRentals: "Aktive Mietverträge",
      totalNumbers: "Nummern gesamt",
      addNumber: "Nummer hinzufügen",
      editNumber: "Nummer bearbeiten",
      deleteNumber: "Nummer löschen",
      confirmDelete: "Möchtest du diese Nummer wirklich löschen?",
      number: "Nummer",
      country: "Land",
      type: "Typ",
      status: "Status",
      actions: "Aktionen",
      free: "Kostenlos",
      paid: "Premium",
      active: "Aktiv",
      inactive: "Inaktiv",
      save: "Speichern",
      cancel: "Abbrechen",
      email: "E-Mail",
      role: "Rolle",
      admin: "Admin",
      user: "Benutzer",
      makeAdmin: "Zum Admin machen",
      removeAdmin: "Admin entfernen",
      date: "Datum",
      amount: "Betrag",
      userName: "Benutzer",
      noUsers: "Keine Benutzer",
      noPurchases: "Keine Käufe",
      revenueThisMonth: "Einnahmen diesen Monat",
      accessDenied: "Zugriff verweigert",
      accessDeniedDesc: "Du hast keine Administratorberechtigungen",
    },
    coinpayments: {
      modalTitle: "Premium-Nummer kaufen",
      exclusiveBadge: "Exklusiv",
      modalSubtitle: "Sichere Zahlung über CoinPayments Gateway",
      price: "Preis",
      newAndPrivate: "100% Neue & Private Nummer",
      selectDuration: "1. Mietdauer auswählen",
      plan24h: "24 Stunden",
      plan7d: "7 Tage",
      plan30d: "30 Tage",
      orCredits: "oder {n} Credits",
      paymentMethodTitle: "2. Zahlungsmethode",
      cryptoMethod: "CoinPayments",
      cryptoSub: "Kryptowährung (USDT/BTC/LTC)",
      balanceMethod: "Kontoguthaben",
      selectCryptoTitle: "3. Kryptowährung auswählen",
      lowFee: "Niedrige Gebühr",
      yourEmailGuest: "Ihre E-Mail-Adresse (für den Empfang der Nummer und Ihrer SMS):",
      payWithCryptoBtn: "{amount} € mit CoinPayments ({crypto}) bezahlen",
      payWithCreditsBtn: "{credits} Credits vom Guthaben bezahlen",
      secureBadge: "Sicheres CoinPayments",
      instantBadge: "Sofortige Aktivierung",
      orderIdLabel: "CoinPayments-Bestellung:",
      scanWallet: "Mit Wallet scannen",
      exactAmount: "Genauer Betrag zu senden:",
      network: "Netzwerk:",
      copy: "Kopieren",
      copied: "Kopiert",
      copiedAddress: "Adresse kopiert",
      copiedAmount: "Betrag kopiert",
      depositAddress: "CoinPayments-Einzahlungsadresse:",
      cryptoWarning: "Senden Sie nur {crypto} über das {network}-Netzwerk. Die Aktivierung erfolgt automatisch nach Bestätigung auf der Blockchain.",
      iHavePaidBtn: "Ich habe die Zahlung gesendet (Prüfen)",
      backBtn: "← Zurück zur Auswahl der Währung oder Dauer",
      verifyingTitle: "Transaktion bei CoinPayments wird geprüft...",
      verifyingSub: "Blockchain-Scan und Bestätigung der Einzahlung von {amount} {crypto}...",
      pendingTitle: "Zahlung ausstehend",
      pendingSub: "Wir haben Ihre Bestellung registriert. Ihre Zahlung wird auf der Blockchain überprüft.",
      pendingOrderLabel: "Bestellung:",
      pendingHelpText: "Sobald Ihre Zahlung im Netzwerk bestätigt ist, wird Ihre Nummer automatisch aktiviert. Sie müssen nichts weiter tun. Dieser Vorgang kann einige Minuten dauern.",
      successTitle: "Zahlung erfolgreich verifiziert!",
      successSub: "Ihre exklusive Nummer wurde für Ihre persönliche Nutzung reserviert und aktiviert.",
      activeNumber: "Aktive Premium-Nummer:",
      duration: "Dauer:",
      expires: "Läuft ab am:",
      goToDashboard: "Zu Meinem Dashboard",
      rentalPrices: "Mietpreise:",
      noPriorHistory: "Keine vorherige Historie",
      topBadge: "Top",
      insufficientCredits: "Unzureichendes Guthaben. Sie benötigen {needed} Credits und haben {have}.",
      pleaseEnterEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    },
  },
  it: {
    nav: { dashboard: "Il mio pannello", admin: "Amministrazione", login: "Accedi", register: "Registrati", signOut: "Esci" },
    auth: {
      loginTitle: "Accedi",
      loginSubtitle: "Accedi al tuo pannello per gestire i tuoi numeri premium",
      registerTitle: "Crea un account",
      registerSubtitle: "Registrati per acquistare e gestire numeri premium",
      email: "Indirizzo email",
      password: "Password",
      confirmPassword: "Conferma password",
      signIn: "Accedi",
      signUp: "Registrati",
      signingIn: "Accesso in corso...",
      signingUp: "Registrazione...",
      alreadyHaveAccount: "Hai già un account? Accedi",
      dontHaveAccount: "Non hai un account? Registrati",
      errorRequired: "Questo campo è obbligatorio",
      errorEmail: "Inserisci un'email valida",
      errorPasswordLength: "La password deve avere almeno 6 caratteri",
      errorPasswordMatch: "Le password non coincidono",
      backHome: "Torna alla home",
    },
    dashboard: {
      title: "Il mio pannello",
      welcome: "Benvenuto",
      credits: "Crediti",
      creditsBalance: "Saldo crediti",
      myRentals: "I miei noleggi",
      myPurchases: "Storico acquisti",
      accountInfo: "Informazioni account",
      noRentals: "Nessun noleggio attivo",
      noRentalsDesc: "Non hai ancora noleggiato alcun numero premium. Esplora i nostri numeri disponibili.",
      noPurchases: "Nessun acquisto",
      noPurchasesDesc: "Non hai ancora effettuato alcun acquisto.",
      rentalActive: "Attivo",
      rentalExpired: "Scaduto",
      rentalCancelled: "Annullato",
      expiresAt: "Scade",
      duration: "Durata",
      price: "Prezzo",
      status: "Stato",
      date: "Data",
      type: "Tipo",
      amount: "Importo",
      buyCredits: "Acquista crediti",
      browseNumbers: "Esplora numeri",
      memberSince: "Membro dal",
      viewSms: "Vedi SMS",
    },
    purchase: {
      title: "Noleggia numero premium",
      subtitle: "Scegli il piano che meglio si adatta alle tue esigenze",
      choosePlan: "Scegli un piano",
      plan24h: "24 ore",
      plan7d: "7 giorni",
      plan30d: "30 giorni",
      plan24hDesc: "Ideale per verifiche rapide",
      plan7dDesc: "Perfetto per uso prolungato",
      plan30dDesc: "Miglior rapporto qualità-prezzo",
      buyNow: "Acquista ora",
      confirmPurchase: "Conferma acquisto",
      confirmDesc: "Stai per noleggiare questo numero premium",
      payWithCredits: "Paga con crediti",
      insufficientCredits: "Crediti insufficienti",
      creditsNeeded: "Crediti necessari",
      yourCredits: "I tuoi crediti",
      cancel: "Annulla",
      confirm: "Conferma e paga",
      purchaseSuccess: "Acquisto completato!",
      purchaseSuccessDesc: "Il tuo numero premium è ora disponibile nel tuo pannello",
      purchaseError: "Errore nell'elaborazione dell'acquisto",
      hours: "ore",
      days: "giorni",
      popular: "Più popolare",
    },
    credits: {
      title: "Acquista crediti",
      subtitle: "Usa crediti per noleggiare numeri premium",
      pack10: "10 crediti",
      pack25: "25 crediti",
      pack50: "50 crediti",
      pack100: "100 crediti",
      pack10Desc: "Sufficiente per 1-2 numeri",
      pack25Desc: "Risparmia 10%",
      pack50Desc: "Risparmia 20%",
      pack100Desc: "Miglior prezzo per credito",
      credits: "crediti",
      buy: "Acquista",
    },
    admin: {
      title: "Pannello di Amministrazione",
      subtitle: "Gestisci numeri, utenti e acquisti",
      overview: "Panoramica",
      manageNumbers: "Gestisci numeri",
      manageUsers: "Gestisci utenti",
      managePurchases: "Gestisci acquisti",
      manageRentals: "Noleggi clienti",
      smsInbox: "Posta SMS Globale",
      assignedTo: "Assegnato a",
      available: "Disponibile",
      rented: "Noleggiato",
      all: "Tutti",
      expiringSoon: "Scade a breve (<24h)",
      extend: "Estendi",
      endRental: "Termina noleggio",
      addCredits: "Aggiungi crediti",
      smsReceived: "SMS ricevuti",
      expiration: "Scadenza",
      totalUsers: "Utenti totali",
      totalRevenue: "Ricavi totali",
      activeRentals: "Noleggi attivi",
      totalNumbers: "Numeri totali",
      addNumber: "Aggiungi numero",
      editNumber: "Modifica numero",
      deleteNumber: "Elimina numero",
      confirmDelete: "Sei sicuro di voler eliminare questo numero?",
      number: "Numero",
      country: "Paese",
      type: "Tipo",
      status: "Stato",
      actions: "Azioni",
      free: "Gratis",
      paid: "Premium",
      active: "Attivo",
      inactive: "Inattivo",
      save: "Salva",
      cancel: "Annulla",
      email: "Email",
      role: "Ruolo",
      admin: "Admin",
      user: "Utente",
      makeAdmin: "Rendi admin",
      removeAdmin: "Rimuovi admin",
      date: "Data",
      amount: "Importo",
      userName: "Utente",
      noUsers: "Nessun utente",
      noPurchases: "Nessun acquisto",
      revenueThisMonth: "Ricavi questo mese",
      accessDenied: "Accesso negato",
      accessDeniedDesc: "Non hai i permessi di amministratore",
    },
    coinpayments: {
      modalTitle: "Acquista Numero Premium",
      exclusiveBadge: "Esclusivo",
      modalSubtitle: "Pagamento sicuro tramite CoinPayments Gateway",
      price: "Prezzo",
      newAndPrivate: "Numero Nuovo & 100% Privato",
      selectDuration: "1. Seleziona la durata del noleggio",
      plan24h: "24 Ore",
      plan7d: "7 Giorni",
      plan30d: "30 Giorni",
      orCredits: "o {n} crediti",
      paymentMethodTitle: "2. Metodo di pagamento",
      cryptoMethod: "CoinPayments",
      cryptoSub: "Criptovalute (USDT/BTC/LTC)",
      balanceMethod: "Saldo dell'account",
      selectCryptoTitle: "3. Seleziona la tua Criptovaluta",
      lowFee: "Commissioni basse",
      yourEmailGuest: "La tua email (per ricevere il tuo numero e visualizzare gli SMS):",
      payWithCryptoBtn: "Paga {amount} € con CoinPayments ({crypto})",
      payWithCreditsBtn: "Paga {credits} Crediti dal mio Saldo",
      secureBadge: "CoinPayments Sicuro",
      instantBadge: "Attivazione Immediata",
      orderIdLabel: "Ordine CoinPayments:",
      scanWallet: "Scansiona con il tuo Wallet",
      exactAmount: "Importo esatto da inviare:",
      network: "Rete:",
      copy: "Copia",
      copied: "Copiato",
      copiedAddress: "Indirizzo copiato",
      copiedAmount: "Importo copiato",
      depositAddress: "Indirizzo di deposito CoinPayments:",
      cryptoWarning: "Invia solo {crypto} tramite la rete {network}. L'attivazione è automatica dopo la conferma su blockchain.",
      iHavePaidBtn: "Ho già inviato il pagamento (Verifica)",
      backBtn: "← Torna indietro e cambia valuta o durata",
      verifyingTitle: "Verifica della transazione su CoinPayments...",
      verifyingSub: "Scansione blockchain e conferma del deposito di {amount} {crypto}...",
      pendingTitle: "Pagamento in attesa di verifica",
      pendingSub: "Abbiamo registrato il tuo ordine. Il tuo pagamento è in fase di verifica sulla blockchain.",
      pendingOrderLabel: "Ordine:",
      pendingHelpText: "Non appena il tuo pagamento sarà confermato sulla rete, il tuo numero verrà attivato automaticamente. Non devi fare altro. Questo processo può richiedere alcuni minuti.",
      successTitle: "Pagamento Verificato con Successo!",
      successSub: "Il tuo numero esclusivo è stato assegnato e riservato per il tuo uso personale.",
      activeNumber: "Numero Premium Attivo:",
      duration: "Durata:",
      expires: "Scade il:",
      goToDashboard: "Vai al Mio Pannello",
      rentalPrices: "Prezzi di noleggio:",
      noPriorHistory: "Nessuna cronologia precedente",
      topBadge: "Top",
      insufficientCredits: "Saldo insufficiente. Ti servono {needed} crediti e ne hai {have}.",
      pleaseEnterEmail: "Inserisci un indirizzo email valido.",
    },
  },
};
