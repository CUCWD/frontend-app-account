import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ProfileInformationAfterDefaultsSlot from '.';

describe('ProfileInformationAfterDefaultsSlot', () => {
  const mockStore = configureStore();

  const renderSlot = (customFields = {}) => {
    const store = mockStore({
      accountSettings: {
        customFields: {
          values: {
            ethnicity: 'asian',
            employment_status: 'employed',
            enrolled_in_school: 'yes',
            enrolled_in_school_type: 'university',
            local_community_living: 'yes',
            ...customFields.values,
          },
          drafts: {},
          options: {
            ethnicity: [{ value: 'asian', label: 'Asian' }],
            employment_status: [{ value: 'employed', label: 'Employed' }],
            enrolled_in_school: [{ value: 'yes', label: 'Yes' }],
            enrolled_in_school_type: [{ value: 'university', label: 'University' }],
            local_community_living: [{ value: 'yes', label: 'Yes' }],
            ...customFields.options,
          },
          visibility: {
            ethnicity: 'required',
            employment_status: 'optional',
            enrolled_in_school: 'required',
            enrolled_in_school_type: 'optional',
            local_community_living: 'optional',
            ...customFields.visibility,
          },
          errors: {},
          openFormId: null,
          saveState: null,
        },
      },
    });

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <ProfileInformationAfterDefaultsSlot />
        </Provider>
      </IntlProvider>,
    );
  };

  it('renders visible profile fields with saved values and backend options', () => {
    renderSlot();

    expect(screen.getByText('PluginSlot_org.skilredi.frontend.account.profile_information_after_defaults.v1'))
      .toBeInTheDocument();
    expect(screen.getByText('Ethnicity')).toBeInTheDocument();
    expect(screen.getByText('Asian')).toBeInTheDocument();
    expect(screen.getByText('Employment status')).toBeInTheDocument();
    expect(screen.getByText('Employed')).toBeInTheDocument();
    expect(screen.getByText('Enrolled in school')).toBeInTheDocument();
    expect(screen.getByText('University')).toBeInTheDocument();
    expect(screen.getByText('Local community living')).toBeInTheDocument();
  });

  it('marks required custom fields with the required label convention', () => {
    renderSlot({
      visibility: {
        ethnicity: 'required',
        employment_status: 'required',
        enrolled_in_school: 'required',
        enrolled_in_school_type: 'required',
        local_community_living: 'required',
      },
    });

    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'Ethnicity *')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'Employment status *')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'Enrolled in school *')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'School type *')).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'Local community living *')).toBeInTheDocument();
  });

  it('does not render fields hidden by backend metadata', () => {
    renderSlot({
      visibility: {
        ethnicity: 'hidden',
        employment_status: 'hidden',
        enrolled_in_school: 'hidden',
        enrolled_in_school_type: 'hidden',
        local_community_living: 'hidden',
      },
    });

    expect(screen.queryByText('Ethnicity')).not.toBeInTheDocument();
    expect(screen.queryByText('Employment status')).not.toBeInTheDocument();
    expect(screen.queryByText('Enrolled in school')).not.toBeInTheDocument();
    expect(screen.queryByText('School type')).not.toBeInTheDocument();
    expect(screen.queryByText('Local community living')).not.toBeInTheDocument();
  });

  it('renders optional fields without a required marker and routes editing through custom actions', () => {
    const store = mockStore({
      accountSettings: {
        customFields: {
          values: { ethnicity: 'asian' },
          drafts: {},
          options: { ethnicity: [{ value: 'asian', label: 'Asian' }] },
          visibility: {
            ethnicity: 'optional',
            employment_status: 'hidden',
            enrolled_in_school: 'hidden',
            enrolled_in_school_type: 'hidden',
            local_community_living: 'hidden',
          },
          errors: {},
          openFormId: null,
          saveState: null,
        },
      },
    });

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <ProfileInformationAfterDefaultsSlot />
        </Provider>
      </IntlProvider>,
    );

    expect(screen.getByText('Ethnicity')).toBeInTheDocument();
    expect(screen.queryByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'Ethnicity *'))
      .not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(store.getActions()).toEqual(expect.arrayContaining([
      { type: 'OPEN_CUSTOM_FORM', payload: { formId: 'ethnicity' } },
    ]));
  });
});
