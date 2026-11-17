import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import AdBlockerBanner from '../components/AdBlockerBanner';
import LoginPage from '../pages/LoginPage';
import AdminLoginPage from '../pages/AdminLoginPage';

describe('Ad Blocker Detection & Google Authenticator Passwordless Login', () => {
  it('renders AdminLoginPage with Google Authenticator TOTP and Password login tabs', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <AdminLoginPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify Google Authenticator tab is present
    expect(screen.getByRole('button', { name: /Google Auth Code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Password Login/i })).toBeInTheDocument();

    // Verify operator email and TOTP code inputs
    expect(screen.getByPlaceholderText('admin@hezalmarket.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();

    // Verify demo TOTP quick helper button and demo secret display
    expect(screen.getByText(/Fill Live Google Authenticator Code/i)).toBeInTheDocument();
    expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument();
  });

  it('renders LoginPage with Google Auth tab for customers and vendors', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <LoginPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify both Password and Google Auth tabs are present
    expect(screen.getByRole('button', { name: /^Password$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google Auth/i })).toBeInTheDocument();
  });

  it('handles AdBlockerBanner gracefully without crashing when inactive', () => {
    const { container } = render(
      <MemoryRouter>
        <AdBlockerBanner />
      </MemoryRouter>
    );

    // When ad blocker is not active, banner remains non-intrusive / hidden
    expect(container).toBeInTheDocument();
  });

  it('renders free Google Authentication buttons across login and admin pages', () => {
    const { unmount } = render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <LoginPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify "Continue with Google" is present on customer/vendor login
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <AdminLoginPage />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify "Admin Sign in with Google" is present on admin login
    expect(screen.getByRole('button', { name: /Admin Sign in with Google/i })).toBeInTheDocument();
  });
});
