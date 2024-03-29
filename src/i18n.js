import { createIntl, createIntlCache } from "react-intl";
import translations from "./translations.json";

const cache = createIntlCache();
const defaultLocale = "en"; // 默认语言

export const getMessages = (locale) => translations[locale];

export const createIntlObject = (locale) => {
  const selectedLocale = translations[locale] ? locale : defaultLocale;

  return createIntl(
    {
      locale: selectedLocale,
      messages: getMessages(selectedLocale),
    },
    cache
  );
};