import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en-translation.json'
import vi from './locales/vi-translation.json'

import enCreateLeaveOther from './locales/en/createLeaveOther.json'
import viCreateLeaveOther from './locales/vi/createLeaveOther.json'

import enMngTimekeeping from './locales/en/mngTimeKeeping.json'
import viMngTimekeeping from './locales/vi/mngTimeKeeping.json'

import enMngLeaveRequest from './locales/en/mngLeaveRequest.json'
import viMngLeaveRequest from './locales/vi/mngLeaveRequest.json'

import enChangeOrgUnit from './locales/en/changeOrgUnit.json'
import viChangeOrgUnit from './locales/vi/changeOrgUnit.json'

import enCommon from './locales/en/common.json'
import viCommon from './locales/vi/common.json'

import enFormIT from './locales/en/formIT.json'
import viFormIT from './locales/vi/formIT.json'

import enPermission from './locales/en/permission.json'
import viPermission from './locales/vi/permission.json'

import enRequestType from './locales/en/requestType.json'
import viRequestType from './locales/vi/requestType.json'

import enApproval from './locales/en/approval.json'
import viApproval from './locales/vi/approval.json'

import enAdmin from './locales/en/admin.json'
import viAdmin from './locales/vi/admin.json'

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: 'vi',
    debug: false,
    defaultNS: 'translation',
    ns: [
		'admin',
		'pendingApproval',
		'requestType',
		'translation', 
		'createLeaveOther',
		'mngTimeKeeping',
		'mngLeaveRequest', 
		'common', 
		'changeOrgUnit', 
		'formIT',
		'permission'
	],
    resources: {
		en: {
			admin: enAdmin,
			pendingApproval: enApproval,
			requestType: enRequestType,
			permission: enPermission,
			formIT: enFormIT,
			translation: en,
			common: enCommon,
			createLeaveOther: enCreateLeaveOther,
      		mngTimeKeeping: enMngTimekeeping,
			mngLeaveRequest: enMngLeaveRequest,
			changeOrgUnit: enChangeOrgUnit
		},
		vi: {
			admin: viAdmin,
			pendingApproval: viApproval,
			requestType: viRequestType,
			permission: viPermission,
			formIT: viFormIT,
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