import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import EditableSelectField from '../../account-settings/EditableSelectField';
import { customFormValuesSelector, customVisibilitySelector } from '../../account-settings/data/selectors';
import { updateDraft, saveSettings } from '../../account-settings/data/actions';

const AccountInformationAfterLocationSlot = ({
  zipcode,
  visibility,
  intl,
  onChange,
  onSubmit,
}) => {
  if (visibility?.zipcode === 'hidden') {
    return null;
  }

  return (
    <PluginSlot id="org.skilredi.frontend.account.account_information_after_location.v1">
      <EditableSelectField
        name="zipcode"
        type="text"
        value={zipcode}
        label={intl.formatMessage({
          id: 'account.settings.field.zipcode',
          defaultMessage: 'ZIP Code',
          description: 'Label for the ZIP code field.',
        })}
        emptyLabel={intl.formatMessage({
          id: 'account.settings.field.zipcode.empty',
          defaultMessage: 'Add ZIP code',
          description: 'Placeholder for empty ZIP code field.',
        })}
        options={[]}
        isEditable
        onChange={onChange}
        onSubmit={(formId, commitValues) => onSubmit(formId, commitValues)}
      />
    </PluginSlot>
  );
};

AccountInformationAfterLocationSlot.propTypes = {
  zipcode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  visibility: PropTypes.shape({
    zipcode: PropTypes.string,
  }),
  intl: intlShape.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

AccountInformationAfterLocationSlot.defaultProps = {
  zipcode: undefined,
  visibility: {},
};

const mapStateToProps = state => {
  const values = customFormValuesSelector(state);

  return {
    zipcode: values.zipcode,
    visibility: customVisibilitySelector(state),
  };
};

export default connect(mapStateToProps, {
  onChange: updateDraft,
  onSubmit: saveSettings,
})(injectIntl(AccountInformationAfterLocationSlot));
