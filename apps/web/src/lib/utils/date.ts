/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatDistanceToNow(date: Date | string): string {
	const now = new Date();
	const then = typeof date === 'string' ? new Date(date) : date;
	const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

	if (seconds < 60) {
		return 'most';
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes} perce`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours} órája`;
	}

	const days = Math.floor(hours / 24);
	if (days < 7) {
		return `${days} napja`;
	}

	const weeks = Math.floor(days / 7);
	if (weeks < 4) {
		return `${weeks} hete`;
	}

	const months = Math.floor(days / 30);
	if (months < 12) {
		return `${months} hónapja`;
	}

	const years = Math.floor(days / 365);
	return `${years} éve`;
}
