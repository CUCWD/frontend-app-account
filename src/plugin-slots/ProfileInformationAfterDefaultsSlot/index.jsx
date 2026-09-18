import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import EditableSelectField from '../../account-settings/EditableSelectField';
import {
  customFormValuesSelector,
  customOptionsSelector,
  customVisibilitySelector,
} from '../../account-settings/data/selectors';
import { updateDraft, saveSettings } from '../../account-settings/data/actions';

const PROFILE_FIELDS = [
  { name: 'ethnicity', label: 'Ethnicity', emptyLabel: 'Add ethnicity' },
  { name: 'employment_status', label: 'Employment status', emptyLabel: 'Add employment status' },
  { name: 'enrolled_in_school', label: 'Enrolled in school', emptyLabel: 'Add school enrollment status' },
  { name: 'enrolled_in_school_type', label: 'School type', emptyLabel: 'Add school type' },
  { name: 'local_community_living', label: 'Local community living', emptyLabel: 'Add local community living' },
];

const ProfileInformationAfterDefaultsSlot = ({
  values,
  options,
  visibility,
  intl,
  onChange,
  onSubmit,
}) => (
  <PluginSlot id="org.skilredi.frontend.account.profile_information_after_defaults.v1">
    {PROFILE_FIELDS.map(({ name, label, emptyLabel }) => (
      visibility?.[name] === 'hidden' ? null : (
        <EditableSelectField
          key={name}
          name={name}
          type="select"
          value={values[name]}
          options={options[name] || []}
          isRequired={visibility?.[name] === 'required'}
          label={intl.formatMessage({
            id: `account.settings.field.${name}`,
            defaultMessage: label,
            description: `Label for the ${name} account field.`,
          })}
          emptyLabel={intl.formatMessage({
            id: `account.settings.field.${name}.empty`,
            defaultMessage: emptyLabel,
            description: `Placeholder for empty ${name} account field.`,
          })}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )
    ))}
  </PluginSlot>
);

ProfileInformationAfterDefaultsSlot.propTypes = {
  values: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  options: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }))).isRequired,
  visibility: PropTypes.objectOf(PropTypes.string).isRequired,
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  values: customFormValuesSelector(state),
  options: customOptionsSelector(state),
  visibility: customVisibilitySelector(state),
});

export default connect(mapStateToProps, {
  onChange: updateDraft,
  onSubmit: saveSettings,
})(injectIntl(ProfileInformationAfterDefaultsSlot));
