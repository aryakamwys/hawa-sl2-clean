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
    // Check localStorage first
    const savedLang = localStorage.getItem("hawa_language") as Language;
    if (savedLang && (savedLang === "EN" || savedLang === "ID")) {
      setLanguage(savedLang);
      setTranslations(dictionaries[savedLang]);
    }
  }, []);

  const changeLanguage = async (lang: Language) => {
    setLanguage(lang);
    setTranslations(dictionaries[lang]);
    localStorage.setItem("hawa_language", lang);

    // Sync with DB if user is logged in
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
