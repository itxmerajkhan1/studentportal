/**
 * ILMORA - Core Identity, Branding & Public Contact Configuration
 * Tagline: "Learn Today. Lead Tomorrow."
 *
 * CRITICAL SEPARATION:
 * - ADMIN_AUTH_EMAIL: Strictly for Firebase Authentication, admin authorization checks,
 *   and /admins/{uid} Firestore verification. Never displayed publicly to students.
 * - PUBLIC_CONTACT_EMAIL: Official public contact email displayed across website footers,
 *   support channels, registration instructions, and application status inquiry cards.
 */

// Official Brand Identity
export const BRAND_NAME = 'ILMORA';
export const BRAND_TAGLINE = 'Learn Today. Lead Tomorrow.';
export const BRAND_FULL_TITLE = 'ILMORA | Learn Today. Lead Tomorrow.';

// Administrator authentication email (Private / Auth-only)
export const ADMIN_AUTH_EMAIL = 'itxmerajkhan3109@gmail.com';

// Public website contact email (Displayed to students & visitors)
export const PUBLIC_CONTACT_EMAIL = 'itxmirajkhan@gmail.com';

// Official Portal Phone & WhatsApp Support Number
export const OFFICIAL_CONTACT_PHONE = '+92 321 2812203';
export const OFFICIAL_WHATSAPP_NUMBER = '923212812203';
export const OFFICIAL_WHATSAPP_URL = 'https://wa.me/923212812203';

// Official Payment Account Details (Default / Fallback)
export const OFFICIAL_PAYMENT_ACCOUNTS = {
  bank: {
    bankName: 'Meezan Bank Limited',
    branchLabel: 'MEEZAN DIGITAL CENTRE',
    accountTitle: 'MUHAMMAD MIRAJ KHAN',
    accountNumber: '00300116151367',
    iban: 'PK45MEZN0000300116151367',
  },
  sadapay: {
    accountHolder: 'Muhammad Mairaj Khan',
    paymentNumber: '03323242608',
  },
  easypaisa: {
    accountHolder: 'Muhammad Mubeen Khan',
    paymentNumber: '03265877959',
  },
} as const;
