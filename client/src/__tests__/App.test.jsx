import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock fetch globally so auth checks return unauthenticated cleanly without network
globalThis.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: false,
    status: 401,
    json: () => Promise.resolve({ success: false, message: 'Unauthorized' }),
  })
);

describe('Hezal Market Client Authentication & Navigation', () => {
  it('renders homepage with brand identity and status card', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getAllByText(/Hezal Market/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Discover Local. Shop Nearby./i).length).toBeGreaterThan(0);
  });

  it('renders login page with email and password fields', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Sign In to Hezal Market/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders customer registration form', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/register/customer']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Create Customer Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Aarav Patel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Customer Account/i })).toBeInTheDocument();
  });

  it('renders vendor registration form with stall acknowledgement', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/register/vendor']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Register as a Local Vendor/i })).toBeInTheDocument();
    expect(screen.getByText(/I understand that when I publish my stall coordinates/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Vendor Account/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated user accessing protected /vendor/dashboard to /login', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/vendor/dashboard']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sign In to Hezal Market/i })).toBeInTheDocument();
    });
  });

  it('renders forgot password page', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Forgot Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });
});
