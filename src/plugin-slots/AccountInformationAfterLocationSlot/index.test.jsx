import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountInformationAfterLocationSlot from '.';

describe('AccountInformationAfterLocationSlot', () => {
  it('renders the account information plugin slot', () => {
    render(<AccountInformationAfterLocationSlot />);

    expect(screen.getByText(
      'PluginSlot_org.skilredi.frontend.account.account_information_after_location.v1',
    )).toBeInTheDocument();
  });
});
