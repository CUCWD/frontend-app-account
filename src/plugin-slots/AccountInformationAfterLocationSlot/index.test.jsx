import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import AccountInformationAfterLocationSlot from '.';

describe('AccountInformationAfterLocationSlot', () => {
  const mockStore = configureStore();

  it('renders the zipcode field in the account information slot when it is visible', () => {
    const store = mockStore({
      accountSettings: {
        customFields: {
          values: { zipcode: '12345' },
          drafts: {},
          options: {},
          visibility: { zipcode: 'optional' },
          errors: {},
          openFormId: null,
          saveState: null,
        },
      },
    });

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <AccountInformationAfterLocationSlot />
        </Provider>
      </IntlProvider>,
    );

    expect(screen.getByText('ZIP Code')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('does not render the zipcode field when it is hidden', () => {
    const store = mockStore({
      accountSettings: {
        customFields: {
          values: { zipcode: '12345' },
          drafts: {},
          options: {},
          visibility: { zipcode: 'hidden' },
          errors: {},
          openFormId: null,
          saveState: null,
        },
      },
    });

    const { container } = render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <AccountInformationAfterLocationSlot />
        </Provider>
      </IntlProvider>,
    );

    expect(screen.queryByText('ZIP Code')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('12345');
  });

  it('marks the zipcode field as required with the existing label convention', () => {
    const store = mockStore({
      accountSettings: {
        customFields: {
          values: { zipcode: '12345' },
          drafts: {},
          options: {},
          visibility: { zipcode: 'required' },
          errors: {},
          openFormId: null,
          saveState: null,
        },
      },
    });

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <AccountInformationAfterLocationSlot />
        </Provider>
      </IntlProvider>,
    );

    expect(screen.getByText((_, node) => node?.textContent?.replace(/\s+/g, ' ').trim() === 'ZIP Code *'))
      .toBeInTheDocument();
  });
});
