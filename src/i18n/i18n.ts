import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en-translation.json';
import vi from './locales/vi-translation.json';

import enCreateLeaveOther from './locales/en/createLeaveOther.json';
import viCreateLeaveOther from './locales/vi/createLeaveOther.json';

import enMngTimekeeping from './locales/en/mngTimeKeeping.json';
import viMngTimekeeping from './locales/vi/mngTimeKeeping.json';

import enMngLeaveRequest from './locales/en/mngLeaveRequest.json';
import viMngLeaveRequest from './locales/vi/mngLeaveRequest.json';

import enChangeOrgUnit from './locales/en/changeOrgUnit.json';
import viChangeOrgUnit from './locales/vi/changeOrgUnit.json';

import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: 'vi',
    debug: false,
    defaultNS: 'translation',
    ns: ['translation', 'createLeaveOther', 'mngTimeKeeping', 'mngLeaveRequest', 'common', 'changeOrgUnit'],
    resources: {
		en: {
			translation: en,
			common: enCommon,
			createLeaveOther: enCreateLeaveOther,
      		mngTimeKeeping: enMngTimekeeping,
			mngLeaveRequest: enMngLeaveRequest,
			changeOrgUnit: enChangeOrgUnit
		},
		vi: {
			translation: vi,
			common: viCommon,
			createLeaveOther: viCreateLeaveOther,
      		mngTimeKeeping: viMngTimekeeping,
			mngLeaveRequest: viMngLeaveRequest,
			changeOrgUnit: viChangeOrgUnit
		},
    },
    interpolation: {
        escapeValue: false
    }
});

export default i18n;