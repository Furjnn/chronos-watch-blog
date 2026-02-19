import type { Locale } from "./config";
import { buildLanguageAlternates, localizePathname } from "./routing";

export function getLocaleAlternates(pathname: string, locale: Locale) {
  return {
    canonical: localizePathname(pathname, locale),
    languages: buildLanguageAlternates(pathname),
  };
}
