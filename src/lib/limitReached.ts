/** Server refused an AI action because the allowance is exhausted (HTTP 402 limit_reached). */
export function isLimitReached(error: unknown): boolean {
  return (error as { context?: { status?: number } } | null)?.context?.status === 402;
}

export const LIMIT_REACHED_MESSAGE =
  "You've used all your AI actions. Upgrade your plan or buy an action pack to continue.";
