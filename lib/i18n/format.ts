import type { Locale } from "./config";
import { getLocaleTag } from "./index";

export function formatDateByLocale(
  date: Date | null,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
) {
  if (!date) return "";
  return date.toLocaleDateString(getLocaleTag(locale), options);
}

export function formatDateTimeByLocale(
  date: Date | null,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
) {
  if (!date) return "";
  return date.toLocaleString(getLocaleTag(locale), options);
}
