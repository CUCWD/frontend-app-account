import {
  closeForm,
  openForm,
  saveSettings,
  updateDraft,
  CLOSE_CUSTOM_FORM,
  OPEN_CUSTOM_FORM,
  SAVE_CUSTOM_FIELD,
  SAVE_SETTINGS,
  UPDATE_CUSTOM_DRAFT,
} from './actions';

describe('custom account field action routing', () => {
  it('routes custom edits to the custom state actions', () => {
    expect(openForm('zipcode')).toEqual({
      type: OPEN_CUSTOM_FORM,
      payload: { formId: 'zipcode' },
    });
    expect(updateDraft('zipcode', '12345')).toEqual({
      type: UPDATE_CUSTOM_DRAFT,
      payload: { name: 'zipcode', value: '12345' },
    });
    expect(closeForm('zipcode')).toEqual({
      type: CLOSE_CUSTOM_FORM,
      payload: { formId: 'zipcode' },
    });
    expect(saveSettings('zipcode', '12345')).toEqual({
      type: SAVE_CUSTOM_FIELD.BASE,
      payload: { formId: 'zipcode', commitValues: '12345', extendedProfile: {} },
    });
  });

  it('keeps core account edits on the existing account state actions', () => {
    expect(openForm('country').type).not.toBe(OPEN_CUSTOM_FORM);
    expect(updateDraft('country', 'US').type).not.toBe(UPDATE_CUSTOM_DRAFT);
    expect(closeForm('country').type).not.toBe(CLOSE_CUSTOM_FORM);
    expect(saveSettings('country', 'US').type).toBe(SAVE_SETTINGS.BASE);
  });
});
