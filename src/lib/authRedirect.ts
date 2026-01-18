/**
 * Post-login redirect logic
 * Blocks mid-flow paths to ensure users always land on dashboard after login
 */

// Paths that should NOT be returned to after login
// These are mid-flow pages where dropping users would be confusing
const BLOCKED_RETURN_PATHS = [
  '/huddle',
  '/wizard', 
  '/new',
  '/generate',
  '/consultation',
  '/brand-setup',
  '/strategy-brief'
];

/**
 * Get the safe redirect path after login
 * If the intended path is a mid-flow page, redirect to dashboard instead
 */
export function getPostLoginRedirect(intendedPath?: string): string {
  // If no intended path, go to dashboard
  if (!intendedPath) {
    return '/';
  }

  // If it's a blocked mid-flow page, go to dashboard
  if (BLOCKED_RETURN_PATHS.some(p => intendedPath.startsWith(p))) {
    console.log('🔒 [Auth] Blocked redirect to mid-flow path:', intendedPath, '-> redirecting to /');
    return '/';
  }

  return intendedPath;
}

/**
 * Check if a path is a mid-flow page that should be blocked
 */
export function isBlockedReturnPath(path: string): boolean {
  return BLOCKED_RETURN_PATHS.some(p => path.startsWith(p));
}
