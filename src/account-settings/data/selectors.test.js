import {
  profileDataManagerSelector,
  formValuesSelector,
  customFormValuesSelector,
  customOptionsSelector,
  customVisibilitySelector,
  editableFieldSelector,
} from './selectors';

const testValue = 'test VALUE';

describe('profileDataManagerSelector', () => {
  it('returns the profileDataManager from the state', () => {
    const state = {
      accountSettings: {
        profileDataManager: { testValue },
      },
    };
    const result = profileDataManagerSelector(state);

    expect(result).toEqual(state.accountSettings.profileDataManager);
  });

  it('should correctly select form values', () => {
    const state = {
      accountSettings: {
        values: {
          name: 'John Doe',
          age: 25,
        },
        drafts: {
          age: 26,

        },
        verifiedNameHistory: 'test',
        confirmationValues: {},
      },
    };

    const result = formValuesSelector(state);

    const expected = {
      name: 'John Doe',
      age: 26,
      verified_name: '',
      useVerifiedNameForCerts: false,
    };

    expect(result).toEqual(expected);
  });

  it('should correctly select form values with extended_profile', () => {
    // Mock data with extended_profile field in both values and drafts
    const state = {
      accountSettings: {
        values: {
          extended_profile: [
            { field_name: 'test_field', field_value: '5' },
          ],
        },
        drafts: { test_field: '6' },
        verifiedNameHistory: 'test',
        confirmationValues: {},
      },
    };

    const result = formValuesSelector(state);

    const expected = {
      verified_name: '',
      useVerifiedNameForCerts: false,
      extended_profile: [ // Draft value should override the committed value
        { field_name: 'test_field', field_value: '6' }, // Value from the committed values
      ],
    };

    expect(result).toEqual(expected);
  });
});

describe('custom account field selectors', () => {
  const state = {
    accountSettings: {
      customFields: {
        values: { zipcode: '12345' },
        drafts: { zipcode: '90210' },
        options: { zipcode: [{ value: '12345', label: '12345' }] },
        visibility: { zipcode: 'optional' },
        errors: { zipcode: 'Invalid ZIP Code.' },
        openFormId: 'zipcode',
        saveState: 'pending',
      },
    },
  };

  it('returns custom form values, options, and visibility metadata', () => {
    expect(customFormValuesSelector(state)).toEqual({ zipcode: '90210' });
    expect(customOptionsSelector(state)).toEqual(state.accountSettings.customFields.options);
    expect(customVisibilitySelector(state)).toEqual(state.accountSettings.customFields.visibility);
  });

  it('returns a draft value when the custom field has no committed value', () => {
    const draftOnlyState = {
      accountSettings: {
        customFields: {
          values: {},
          drafts: { ethnicity: 'asian' },
          options: {},
          visibility: {},
        },
      },
    };

    expect(customFormValuesSelector(draftOnlyState)).toEqual({ ethnicity: 'asian' });
  });

  it('maps custom state to EditableSelectField props', () => {
    expect(editableFieldSelector(state, { name: 'zipcode' })).toEqual({
      error: 'Invalid ZIP Code.',
      confirmationValue: undefined,
      saveState: 'pending',
      isEditing: true,
      value: '90210',
      options: [{ value: '12345', label: '12345' }],
    });
  });

  it('does not override core field values or options', () => {
    expect(editableFieldSelector(state, { name: 'country' })).toEqual({
      error: undefined,
      confirmationValue: undefined,
      saveState: undefined,
      isEditing: false,
    });
  });
});
