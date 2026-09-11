import { AsyncActionType } from './utils';
import { CUSTOM_ACCOUNT_FIELDS } from './service';

export const FETCH_SETTINGS = new AsyncActionType('ACCOUNT_SETTINGS', 'FETCH_SETTINGS');
export const SAVE_SETTINGS = new AsyncActionType('ACCOUNT_SETTINGS', 'SAVE_SETTINGS');
export const SAVE_MULTIPLE_SETTINGS = new AsyncActionType('ACCOUNT_SETTINGS', 'SAVE_MULTIPLE_SETTINGS');
export const FETCH_CUSTOM_FIELDS = new AsyncActionType('ACCOUNT_SETTINGS', 'FETCH_CUSTOM_FIELDS');
export const SAVE_CUSTOM_FIELD = new AsyncActionType('ACCOUNT_SETTINGS', 'SAVE_CUSTOM_FIELD');
export const FETCH_TIME_ZONES = new AsyncActionType('ACCOUNT_SETTINGS', 'FETCH_TIME_ZONES');
export const SAVE_PREVIOUS_SITE_LANGUAGE = 'SAVE_PREVIOUS_SITE_LANGUAGE';
export const OPEN_FORM = 'OPEN_FORM';
export const CLOSE_FORM = 'CLOSE_FORM';
export const UPDATE_DRAFT = 'UPDATE_DRAFT';
export const RESET_DRAFTS = 'RESET_DRAFTS';
export const BEGIN_NAME_CHANGE = 'BEGIN_NAME_CHANGE';
export const OPEN_CUSTOM_FORM = 'OPEN_CUSTOM_FORM';
export const CLOSE_CUSTOM_FORM = 'CLOSE_CUSTOM_FORM';
export const UPDATE_CUSTOM_DRAFT = 'UPDATE_CUSTOM_DRAFT';
export const RESET_CUSTOM_DRAFTS = 'RESET_CUSTOM_DRAFTS';

// FETCH SETTINGS ACTIONS

export const fetchSettings = () => ({
  type: FETCH_SETTINGS.BASE,
});

export const fetchCustomFields = () => ({
  type: FETCH_CUSTOM_FIELDS.BASE,
});

export const fetchCustomFieldsBegin = () => ({
  type: FETCH_CUSTOM_FIELDS.BEGIN,
});

export const fetchCustomFieldsSuccess = data => ({
  type: FETCH_CUSTOM_FIELDS.SUCCESS,
  payload: data,
});

export const fetchCustomFieldsFailure = error => ({
  type: FETCH_CUSTOM_FIELDS.FAILURE,
  payload: { error },
});

export const fetchSettingsBegin = () => ({
  type: FETCH_SETTINGS.BEGIN,
});

export const fetchSettingsSuccess = ({
  values,
  thirdPartyAuthProviders,
  profileDataManager,
  timeZones,
  verifiedNameHistory,
  countriesCodesList,
}) => ({
  type: FETCH_SETTINGS.SUCCESS,
  payload: {
    values,
    thirdPartyAuthProviders,
    profileDataManager,
    timeZones,
    verifiedNameHistory,
    countriesCodesList,
  },
});

export const fetchSettingsFailure = error => ({
  type: FETCH_SETTINGS.FAILURE,
  payload: { error },
});

export const fetchSettingsReset = () => ({
  type: FETCH_SETTINGS.RESET,
});

// FORM STATE ACTIONS

export const openForm = formId => ({
  type: CUSTOM_ACCOUNT_FIELDS.includes(formId) ? OPEN_CUSTOM_FORM : OPEN_FORM,
  payload: { formId },
});

export const closeForm = formId => ({
  type: CUSTOM_ACCOUNT_FIELDS.includes(formId) ? CLOSE_CUSTOM_FORM : CLOSE_FORM,
  payload: { formId },
});

export const updateDraft = (name, value) => ({
  type: CUSTOM_ACCOUNT_FIELDS.includes(name) ? UPDATE_CUSTOM_DRAFT : UPDATE_DRAFT,
  payload: {
    name,
    value,
  },
});

export const resetDrafts = () => ({
  type: RESET_DRAFTS,
});

export const resetCustomDrafts = () => ({
  type: RESET_CUSTOM_DRAFTS,
});

export const beginNameChange = (formId) => ({
  type: BEGIN_NAME_CHANGE,
  payload: { formId },
});
// SAVE SETTINGS ACTIONS

export const saveSettings = (formId, commitValues, extendedProfile = {}) => ({
  type: CUSTOM_ACCOUNT_FIELDS.includes(formId) ? SAVE_CUSTOM_FIELD.BASE : SAVE_SETTINGS.BASE,
  payload: { formId, commitValues, extendedProfile },
});

export const saveCustomFieldBegin = () => ({
  type: SAVE_CUSTOM_FIELD.BEGIN,
});

export const saveCustomFieldSuccess = values => ({
  type: SAVE_CUSTOM_FIELD.SUCCESS,
  payload: { values: values.values || values },
});

export const saveCustomFieldReset = () => ({
  type: SAVE_CUSTOM_FIELD.RESET,
});

export const saveCustomFieldFailure = ({ fieldErrors, message }) => ({
  type: SAVE_CUSTOM_FIELD.FAILURE,
  payload: { errors: fieldErrors, message },
});

export const saveSettingsBegin = () => ({
  type: SAVE_SETTINGS.BEGIN,
});

export const saveSettingsSuccess = (values, confirmationValues) => ({
  type: SAVE_SETTINGS.SUCCESS,
  payload: { values, confirmationValues },
});

export const saveSettingsReset = () => ({
  type: SAVE_SETTINGS.RESET,
});

export const saveSettingsFailure = ({ fieldErrors, message }) => ({
  type: SAVE_SETTINGS.FAILURE,
  payload: { errors: fieldErrors, message },
});

export const savePreviousSiteLanguage = previousSiteLanguage => ({
  type: SAVE_PREVIOUS_SITE_LANGUAGE,
  payload: { previousSiteLanguage },
});

export const saveMultipleSettings = (settingsArray, form = null) => ({
  type: SAVE_MULTIPLE_SETTINGS.BASE,
  payload: { settingsArray, form },
});

export const saveMultipleSettingsBegin = () => ({
  type: SAVE_MULTIPLE_SETTINGS.BEGIN,
});

export const saveMultipleSettingsSuccess = settingsArray => ({
  type: SAVE_MULTIPLE_SETTINGS.SUCCESS,
  payload: { settingsArray },
});

export const saveMultipleSettingsFailure = ({ fieldErrors, message }) => ({
  type: SAVE_MULTIPLE_SETTINGS.FAILURE,
  payload: { errors: fieldErrors, message },
});

// FETCH TIME_ZONE ACTIONS

export const fetchTimeZones = country => ({
  type: FETCH_TIME_ZONES.BASE,
  payload: { country },
});

export const fetchTimeZonesSuccess = timeZones => ({
  type: FETCH_TIME_ZONES.SUCCESS,
  payload: { timeZones },
});
