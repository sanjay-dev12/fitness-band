/**
 * Hand Band — Centralized Health Constants
 *
 * Change thresholds here only. Do NOT hardcode these values in other files.
 */

/** Heart rate at or below this value (BPM) is considered low and triggers an alert. */
export const LOW_HR_THRESHOLD = 50;

/** Minimum milliseconds between repeated low-HR alerts (5 minutes). */
export const LOW_HR_ALERT_COOLDOWN_MS = 5 * 60 * 1000;
