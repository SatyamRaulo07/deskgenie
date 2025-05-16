import React from 'react';
import { render, screen } from '@testing-library/react';
import MainInterface from '../MainInterface';

describe('MainInterface', () => {
  it('renders the component with trial license', () => {
    const mockLicenseInfo = {
      isTrial: true,
      expiresAt: '2024-12-31'
    };
    
    render(<MainInterface licenseInfo={mockLicenseInfo} />);
    expect(screen.getByText('DeskGenie')).toBeInTheDocument();
  });

  it('renders the component with full license', () => {
    const mockLicenseInfo = {
      isTrial: true,
      expiresAt: '2024-12-31'
    };
    const fullLicenseInfo = { ...mockLicenseInfo, isTrial: false };
    render(<MainInterface licenseInfo={fullLicenseInfo} />);
    
    expect(screen.getByText('DeskGenie')).toBeInTheDocument();
    expect(screen.getByText('Full License')).toBeInTheDocument();
  });

  it('shows status indicator', () => {
    const mockLicenseInfo = {
      isTrial: true,
      expiresAt: '2024-12-31'
    };
    
    render(<MainInterface licenseInfo={mockLicenseInfo} />);
    
    const statusIndicator = screen.getByRole('status');
    expect(statusIndicator).toBeInTheDocument();
  });
}); 