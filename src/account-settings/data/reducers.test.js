import reducer, { defaultState } from './reducers';
import {
  FETCH_CUSTOM_FIELDS,
  OPEN_CUSTOM_FORM,
  UPDATE_CUSTOM_DRAFT,
  SAVE_CUSTOM_FIELD,
  SAVE_SETTINGS,
} from './actions';

describe('custom account fields reducer', () => {
  it('stores custom values, options, and visibility metadata independently', () => {
    const state = reducer(defaultState, {
      type: FETCH_CUSTOM_FIELDS.SUCCESS,
      payload: {
        ethnicity: 'asian',
        options: { ethnicity: [{ value: 'asian', label: 'Asian' }] },
        visibility: { ethnicity: 'required' },
      },
    });

    expect(state.customFields).toMatchObject({
      loaded: true,
      values: { ethnicity: 'asian' },
      options: { ethnicity: [{ value: 'asian', label: 'Asian' }] },
      visibility: { ethnicity: 'required' },
    });
  });

  it('keeps custom drafts, editing, save state, and errors isolated from core state', () => {
    const editingState = reducer(defaultState, {
      type: OPEN_CUSTOM_FORM,
      payload: { formId: 'zipcode' },
    });
    const draftState = reducer(editingState, {
      type: UPDATE_CUSTOM_DRAFT,
      payload: { name: 'zipcode', value: '12345' },
    });
    const savingState = reducer(draftState, {
      type: SAVE_CUSTOM_FIELD.BEGIN,
    });
    const errorState = reducer(savingState, {
      type: SAVE_CUSTOM_FIELD.FAILURE,
      payload: { errors: { zipcode: 'Enter a valid ZIP Code.' } },
    });

    expect(errorState.customFields).toMatchObject({
      openFormId: 'zipcode',
      drafts: { zipcode: '12345' },
      saveState: 'error',
      errors: { zipcode: 'Enter a valid ZIP Code.' },
    });
    expect(errorState.saveState).toBeNull();
    expect(errorState.errors).toEqual({});
  });

  it('does not let core save actions change custom save state', () => {
    const state = reducer(defaultState, { type: SAVE_SETTINGS.BEGIN });

    expect(state.saveState).toBe('pending');
    expect(state.customFields.saveState).toBeNull();
  });
});