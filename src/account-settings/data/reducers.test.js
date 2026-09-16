import { call, put, select } from 'redux-saga/effects';

import reducer, { defaultState } from './reducers';
import {
  FETCH_CUSTOM_FIELDS,
  OPEN_CUSTOM_FORM,
  UPDATE_CUSTOM_DRAFT,
  SAVE_CUSTOM_FIELD,
  SAVE_SETTINGS,
  fetchCustomFieldsBegin,
  fetchCustomFieldsSuccess,
  saveCustomFieldBegin,
  saveCustomFieldFailure,
  saveCustomFieldSuccess,
} from './actions';
import { handleFetchCustomFields, handleSaveCustomField } from './sagas';
import { getCustomFields, patchCustomFields } from './service';

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

  it('normalizes metadata envelopes into the account-settings custom field shape', () => {
    const state = reducer(defaultState, {
      type: FETCH_CUSTOM_FIELDS.SUCCESS,
      payload: {
        values: { ethnicity: 'asian' },
        metadata: {
          options: { ethnicity: [{ value: 'asian', label: 'Asian' }] },
          visibility: { ethnicity: 'required' },
        },
      },
    });

    expect(state.customFields).toMatchObject({
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

  it('does not merge metadata into saved custom field values', () => {
    const state = reducer(defaultState, {
      type: SAVE_CUSTOM_FIELD.SUCCESS,
      payload: {
        values: { zipcode: '12345' },
        metadata: { visibility: { zipcode: 'required' } },
      },
    });

    expect(state.customFields).toMatchObject({
      values: { zipcode: '12345' },
      visibility: { zipcode: 'required' },
    });
    expect(state.customFields.values).not.toHaveProperty('metadata');
  });

  it('ignores duplicate custom field loads while one is already in flight or loaded', () => {
    const loadingState = reducer(defaultState, { type: FETCH_CUSTOM_FIELDS.BEGIN });
    const duplicateLoadingState = reducer(loadingState, { type: FETCH_CUSTOM_FIELDS.BEGIN });
    const loadedState = reducer(duplicateLoadingState, {
      type: FETCH_CUSTOM_FIELDS.SUCCESS,
      payload: { values: { zipcode: '12345' } },
    });
    const duplicateLoadedState = reducer(loadedState, { type: FETCH_CUSTOM_FIELDS.BEGIN });

    expect(duplicateLoadingState.customFields.loading).toBe(true);
    expect(duplicateLoadedState.customFields.loading).toBe(false);
    expect(duplicateLoadedState.customFields.loaded).toBe(true);
  });

  it('does not let core save actions change custom save state', () => {
    const state = reducer(defaultState, { type: SAVE_SETTINGS.BEGIN });

    expect(state.saveState).toBe('pending');
    expect(state.customFields.saveState).toBeNull();
  });
});

describe('custom account field sagas', () => {
  it('fetches custom fields once when not already loaded', () => {
    const iterator = handleFetchCustomFields();

    expect(iterator.next().value).toMatchObject({
      '@@redux-saga/IO': true,
      combinator: false,
    });
    expect(iterator.next({ loading: false, loaded: false }).value).toEqual(put(fetchCustomFieldsBegin()));
    expect(iterator.next().value).toEqual(call(getCustomFields));
    expect(iterator.next({ zipcode: '12345' }).value).toEqual(put(fetchCustomFieldsSuccess({ zipcode: '12345' })));
    expect(iterator.next().done).toBe(true);
  });

  it('skips duplicate fetch requests while a custom fields fetch is active or completed', () => {
    const iterator = handleFetchCustomFields();

    expect(iterator.next().value).toMatchObject({
      '@@redux-saga/IO': true,
      combinator: false,
    });
    expect(iterator.next({ loading: true, loaded: false }).done).toBe(true);

    const completedIterator = handleFetchCustomFields();
    completedIterator.next();
    expect(completedIterator.next({ loading: false, loaded: true }).done).toBe(true);
  });

  it('maps custom-field save errors to the correct field and preserves the draft state', () => {
    const action = { payload: { formId: 'zipcode', commitValues: '12345' } };
    const iterator = handleSaveCustomField(action);

    expect(iterator.next().value).toEqual(put(saveCustomFieldBegin()));
    expect(iterator.next().value).toEqual(call(patchCustomFields, { zipcode: '12345' }));
    expect(iterator.throw({ fieldErrors: { zipcode: 'Enter a valid ZIP Code.' } }).value)
      .toEqual(put(saveCustomFieldFailure({ fieldErrors: { zipcode: 'Enter a valid ZIP Code.' } })));
  });

  it('puts the custom-field success action with the saved field value on success', () => {
    const action = { payload: { formId: 'zipcode', commitValues: '12345' } };
    const iterator = handleSaveCustomField(action);

    iterator.next();
    iterator.next();
    expect(iterator.next({ zipcode: '12345' }).value).toEqual(put(saveCustomFieldSuccess({ zipcode: '12345' })));
  });
});