const NOTIFICATIONS_REFRESH_EVENT = "hadijam:notifications-refresh";

/** Refresh the account notification list after a booking has been saved. */
export function refreshMyNotifications() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
	}
}

export { NOTIFICATIONS_REFRESH_EVENT };
