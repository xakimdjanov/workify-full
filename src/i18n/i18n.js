import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationUZ from './locales/uz.json';
import translationRU from './locales/ru.json';
import translationEN from './locales/en.json';

const savedLanguage = localStorage.getItem('language') || 'uz';

const resources = {
    uz: { translation: translationUZ },
    ru: { translation: translationRU },
    en: { translation: translationEN }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage, // Boshlang'ich til
        fallbackLng: 'uz',  // Agar tanlangan tilda tarjima topilmasa ishlatiladigan til
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;