import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileInformationAfterDefaultsSlot from '.';

describe('ProfileInformationAfterDefaultsSlot', () => {
  it('renders the profile information plugin slot', () => {
    render(<ProfileInformationAfterDefaultsSlot />);

    expect(screen.getByText(
      'PluginSlot_org.skilredi.frontend.account.profile_information_after_defaults.v1',
    )).toBeInTheDocument();
  });
});
