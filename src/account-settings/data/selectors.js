import { createSelector, createStructuredSelector } from 'reselect';
import { siteLanguageListSelector, siteLanguageOptionsSelector } from '../site-language';
import { compareVerifiedNamesByCreatedDate } from '../../utils';
import { CUSTOM_ACCOUNT_FIELDS } from './service';

export const storeName = 'accountSettings';

export const accountSettingsSelector = state => state[storeName];

export const customFieldsSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.customFields,
);

export const customValuesSelector = createSelector(
  customFieldsSelector,
  customFields => customFields.values,
);

export const customDraftsSelector = createSelector(
  customFieldsSelector,
  customFields => customFields.drafts,
);

export const customOptionsSelector = createSelector(
  customFieldsSelector,
  customFields => customFields.options,
);

export const customVisibilitySelector = createSelector(
  customFieldsSelector,
  customFields => customFields.visibility,
);

export const customFormValuesSelector = createSelector(
  customValuesSelector,
  customDraftsSelector,
  (values, drafts) => [...new Set([...Object.keys(values), ...Object.keys(drafts)])].reduce((formValues, name) => {
    formValues[name] = drafts[name] !== undefined ? drafts[name] : values[name];
    return formValues;
  }, {}),
);

const editableFieldNameSelector = (state, props) => props.name;

const verifiedNameSettingsSelector = createSelector(
  accountSettingsSelector,
  accountSettings => ({
    history: accountSettings.verifiedNameHistory.results,
    useVerifiedNameForCerts: accountSettings?.verifiedNameHistory.use_verified_name_for_certs,
  }),
);

const sortedVerifiedNameHistorySelector = createSelector(
  verifiedNameSettingsSelector,
  verifiedNameSettings => {
    const { history } = verifiedNameSettings;

    if (Array.isArray(history)) {
      return history.sort(compareVerifiedNamesByCreatedDate);
    }

    return [];
  },
);

const mostRecentVerifiedNameSelector = createSelector(
  sortedVerifiedNameHistorySelector,
  sortedHistory => (sortedHistory.length > 0 ? sortedHistory[0] : null),
);

const mostRecentApprovedVerifiedNameValueSelector = createSelector(
  sortedVerifiedNameHistorySelector,
  mostRecentVerifiedNameSelector,
  (sortedHistory, mostRecentVerifiedName) => {
    const approvedVerifiedNames = sortedHistory.filter(name => name.status === 'approved');
    const approvedVerifiedName = approvedVerifiedNames.length > 0 ? approvedVerifiedNames[0] : null;

    let verifiedName = null;
    switch (mostRecentVerifiedName && mostRecentVerifiedName.status) {
      case 'approved':
      case 'denied':
      case 'pending':
        verifiedName = approvedVerifiedName;
        break;
      case 'submitted':
        verifiedName = mostRecentVerifiedName;
        break;
      default:
        verifiedName = null;
    }
    return verifiedName;
  },
);

const valuesSelector = createSelector(
  accountSettingsSelector,
  mostRecentApprovedVerifiedNameValueSelector,
  (accountSettings, mostRecentApprovedVerifiedNameValue) => {
    let useVerifiedNameForCerts = (
      accountSettings.verifiedNameHistory?.use_verified_name_for_certs || false
    );

    if (Object.keys(accountSettings.confirmationValues).includes('useVerifiedNameForCerts')) {
      useVerifiedNameForCerts = accountSettings.confirmationValues.useVerifiedNameForCerts;
    }

    return {
      ...accountSettings.values,
      verified_name: mostRecentApprovedVerifiedNameValue?.verified_name,
      useVerifiedNameForCerts,
    };
  },
);

const draftsSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.drafts,
);

const previousSiteLanguageSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.previousSiteLanguage,
);

const countriesSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.countriesCodesList,
);

const editableFieldErrorSelector = createSelector(
  editableFieldNameSelector,
  accountSettingsSelector,
  (name, accountSettings) => CUSTOM_ACCOUNT_FIELDS.includes(name)
    ? accountSettings.customFields.errors[name]
    : accountSettings.errors?.[name],
);

const editableFieldConfirmationValuesSelector = createSelector(
  editableFieldNameSelector,
  accountSettingsSelector,
  (name, accountSettings) => accountSettings.confirmationValues?.[name],
);

const isEditingSelector = createSelector(
  editableFieldNameSelector,
  accountSettingsSelector,
  (name, accountSettings) => CUSTOM_ACCOUNT_FIELDS.includes(name)
    ? accountSettings.customFields.openFormId === name
    : accountSettings.openFormId === name,
);

const errorSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.errors,
);

const nameChangeModalSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.nameChangeModal,
);

const saveStateSelector = createSelector(
  editableFieldNameSelector,
  accountSettingsSelector,
  (name, accountSettings) => CUSTOM_ACCOUNT_FIELDS.includes(name)
    ? accountSettings.customFields.saveState
    : accountSettings.saveState,
);

const customEditableFieldPropsSelector = createSelector(
  editableFieldNameSelector,
  customFormValuesSelector,
  customOptionsSelector,
  (name, values, options) => (CUSTOM_ACCOUNT_FIELDS.includes(name)
    ? { value: values[name], options: options[name] || [] }
    : {}),
);

export const editableFieldSelector = createSelector(
  editableFieldErrorSelector,
  editableFieldConfirmationValuesSelector,
  saveStateSelector,
  isEditingSelector,
  customEditableFieldPropsSelector,
  (error, confirmationValue, saveState, isEditing, customProps) => ({
    error,
    confirmationValue,
    saveState,
    isEditing,
    ...customProps,
  }),
);

export const profileDataManagerSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.profileDataManager,
);

export const staticFieldsSelector = createSelector(
  accountSettingsSelector,
  mostRecentVerifiedNameSelector,
  (accountSettings, verifiedName) => {
    const staticFields = [];
    if (accountSettings.profileDataManager) {
      staticFields.push('name', 'email', 'country');
    }
    if (verifiedName && ['submitted'].includes(verifiedName.status)) {
      staticFields.push('verifiedName');
    }

    return staticFields;
  },
);

/**
 * If there's no draft present at all (undefined), use the original committed value.
 */
function chooseFormValue(draft, committed) {
  return draft !== undefined ? draft : committed;
}

export const formValuesSelector = createSelector(
  valuesSelector,
  draftsSelector,
  (values, drafts) => {
    const formValues = {};
    Object.entries(values).forEach(([name, value]) => {
      if (typeof value === 'boolean') {
        formValues[name] = chooseFormValue(drafts[name], value);
      } else if (typeof value === 'object' && name === 'extended_profile' && value !== null) {
        const extendedProfile = value.slice();
        const draftsKeys = Object.keys(drafts);

        if (draftsKeys.length !== 0) {
          const draftFieldName = draftsKeys[0];
          const index = extendedProfile.findIndex((profile) => profile.field_name === draftFieldName);

          if (index !== -1) {
            extendedProfile[index] = { field_name: draftFieldName, field_value: drafts[draftFieldName] };
          }
        }

        formValues.extended_profile = [...extendedProfile];
      } else {
        formValues[name] = chooseFormValue(drafts[name], value) || '';
      }
    });
    return formValues;
  },
);

const transformTimeZonesToOptions = timeZoneArr => timeZoneArr
  .map(({ time_zone, description }) => ({ // eslint-disable-line camelcase
    value: time_zone, label: description, // eslint-disable-line camelcase
  }));

const timeZonesSelector = createSelector(
  accountSettingsSelector,
  accountSettings => transformTimeZonesToOptions(accountSettings.timeZones),
);

const countryTimeZonesSelector = createSelector(
  accountSettingsSelector,
  accountSettings => transformTimeZonesToOptions(accountSettings.countryTimeZones),
);

const activeAccountSelector = createSelector(
  accountSettingsSelector,
  accountSettings => accountSettings.values.is_active,
);

export const siteLanguageSelector = createSelector(
  previousSiteLanguageSelector,
  draftsSelector,
  (previousValue, drafts) => ({
    previousValue,
    draft: drafts.siteLanguage,
  }),
);

export const betaLanguageBannerSelector = createStructuredSelector({
  siteLanguageList: siteLanguageListSelector,
  siteLanguage: siteLanguageSelector,
});

export const accountSettingsPageSelector = createSelector(
  accountSettingsSelector,
  siteLanguageOptionsSelector,
  siteLanguageSelector,
  formValuesSelector,
  valuesSelector,
  draftsSelector,
  errorSelector,
  profileDataManagerSelector,
  staticFieldsSelector,
  timeZonesSelector,
  countryTimeZonesSelector,
  activeAccountSelector,
  nameChangeModalSelector,
  mostRecentApprovedVerifiedNameValueSelector,
  mostRecentVerifiedNameSelector,
  sortedVerifiedNameHistorySelector,
  countriesSelector,
  (
    accountSettings,
    siteLanguageOptions,
    siteLanguage,
    formValues,
    committedValues,
    drafts,
    formErrors,
    profileDataManager,
    staticFields,
    timeZoneOptions,
    countryTimeZoneOptions,
    activeAccount,
    nameChangeModal,
    verifiedName,
    mostRecentVerifiedName,
    verifiedNameHistory,
    countriesCodesList,
  ) => ({
    siteLanguageOptions,
    siteLanguage,
    loading: accountSettings.loading,
    loaded: accountSettings.loaded,
    loadingError: accountSettings.loadingError,
    timeZoneOptions,
    countryTimeZoneOptions,
    isActive: activeAccount,
    formValues,
    committedValues,
    drafts,
    formErrors,
    profileDataManager,
    staticFields,
    tpaProviders: accountSettings.thirdPartyAuth.providers,
    nameChangeModal,
    verifiedName,
    mostRecentVerifiedName,
    verifiedNameHistory,
    countriesCodesList,
  }),
);

export const certPreferenceSelector = createSelector(
  valuesSelector,
  formValuesSelector,
  mostRecentApprovedVerifiedNameValueSelector,
  saveStateSelector,
  errorSelector,
  (
    committedValues,
    formValues,
    mostRecentApprovedVerifiedNameValue,
    saveState,
    errors,
  ) => ({
    originalFullName: committedValues?.name || '',
    originalVerifiedName: mostRecentApprovedVerifiedNameValue?.verified_name || '',
    useVerifiedNameForCerts: formValues.useVerifiedNameForCerts || false,
    saveState,
    formErrors: errors,
  }),
);

export const nameChangeSelector = createSelector(
  accountSettingsSelector,
  formValuesSelector,
  (accountSettings, formValues) => ({
    ...accountSettings.nameChange,
    formValues,
  }),
);
