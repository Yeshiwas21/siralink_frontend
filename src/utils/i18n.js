import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import am from '../locales/am.json';
import om from '../locales/om.json';
import tg from '../locales/tg.json'

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        am: { translation: am },
        om: { translation: om },
        tg: { translation: tg },

    },
    lng: localStorage.getItem('siralink_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;