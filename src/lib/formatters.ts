/**
 * Capitalizes each word in a display name
 * "kyle smith" -> "Kyle Smith"
 */
export function capitalizeDisplayName(name: string | null | undefined): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Get initials from a name (1-2 characters)
 * "Kyle Smith" -> "KS"
 * "Kyle" -> "K"
 */
export function getNameInitials(name: string | null | undefined): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
