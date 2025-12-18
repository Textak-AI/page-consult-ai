// Dev Mode Configuration
// Enables bypassing subscription and credit checks for development/testing

// Add dev email addresses here
const DEV_EMAILS = [
  'kyle@textak.ai',
  'jkyle.moyer76@gmail.com',
  // Add other dev emails as needed
];

/**
 * Check if the app is running in development mode
 * Dev mode bypasses credit/subscription checks
 */
export const isDevMode = (userEmail?: string | null): boolean => {
  // Option 1: Vite development environment
  if (import.meta.env.DEV) {
    return true;
  }
  
  // Option 2: Check for dev URL parameter (?dev=true)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
      return true;
    }
  }
  
  // Option 3: Check if user email is in dev list
  if (userEmail && DEV_EMAILS.includes(userEmail.toLowerCase())) {
    return true;
  }
  
  return false;
};

/**
 * Check if a specific user email is a dev/admin
 */
export const isDevUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return DEV_EMAILS.includes(email.toLowerCase());
};

// Virtual credits for dev mode (effectively unlimited)
export const DEV_MODE_CREDITS = 9999;

// Log dev mode status for debugging
export const logDevMode = (userEmail?: string | null) => {
  const devMode = isDevMode(userEmail);
  if (devMode) {
    console.log('[DEV MODE] 🛠️ Development mode active - credit/subscription checks bypassed');
  }
  return devMode;
};
