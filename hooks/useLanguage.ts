"use client";

import { useState, useEffect } from "react";
import en from "@/dictionaries/en.json";
import id from "@/dictionaries/id.json";

export type Language = "EN" | "ID";
type Translations = typeof en;

const dictionaries = {
  EN: en,
  ID: id,
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("EN");
  const [translations, setTranslations] = useState<Translations>(en);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadLanguageFromDB = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user?.language && (data.user.language === "EN" || data.user.language === "ID")) {
          const lang = data.user.language as Language;
          setLanguage(lang);
          setTranslations(dictionaries[lang]);
          return true;
        }
      } catch {
        console.error("Failed to load language from DB");
      }
      return false;
    };

    const savedLang = localStorage.getItem("hawa_language") as Language;
    if (savedLang && (savedLang === "EN" || savedLang === "ID")) {
      setLanguage(savedLang);
      setTranslations(dictionaries[savedLang]);
      loadLanguageFromDB();
    } else {
      loadLanguageFromDB().then((loaded) => {
        if (!loaded) {
        }
      });
    }
  }, []);

  const changeLanguage = async (lang: Language) => {
    setLanguage(lang);
    setTranslations(dictionaries[lang]);
    localStorage.setItem("hawa_language", lang);

    try {
      await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
    } catch (err) {
      console.error("Failed to sync language preference:", err);
    }
  };

  return {
    language,
    t: translations,
    changeLanguage,
    mounted,
  };
}
