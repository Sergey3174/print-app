import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const langMap = {
  en: "en_US",
  id: "id_ID",
} as const;

export type AppLanguage = keyof typeof langMap;
type I18nLanguage = (typeof langMap)[AppLanguage];

function isAppLanguage(value: string): value is AppLanguage {
  return value in langMap;
}

const storedLang = localStorage.getItem("userLang");
const initialLanguage: I18nLanguage | undefined =
  storedLang && isAppLanguage(storedLang) ? langMap[storedLang] : undefined;

export const changeAppLanguage = (lang: AppLanguage): Promise<void> =>
  i18n.changeLanguage(langMap[lang]).then(() => {
    localStorage.setItem("userLang", lang);
  });

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: ["en_US"],
    debug: true,
    load: "currentOnly",
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key: string) => {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    },
  });

export default i18n;
