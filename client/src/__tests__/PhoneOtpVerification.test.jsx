import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PhoneOtpVerification from '../components/PhoneOtpVerification';
import * as authService from '../services/authService';

vi.mock('../services/authService', () => ({
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

describe('PhoneOtpVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders phone input and initial send button', () => {
    render(<PhoneOtpVerification initialPhone="" onVerified={vi.fn()} />);

    expect(screen.getByPlaceholderText(/98765 43210/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send OTP/i })).toBeInTheDocument();
  });

  it('validates phone number and rejects short input', async () => {
    render(<PhoneOtpVerification initialPhone="123" onVerified={vi.fn()} />);

    const sendBtn = screen.getByRole('button', { name: /Send OTP/i });
    expect(sendBtn).toBeDisabled();
  });

  it('sends OTP, displays demo banner and allows verification', async () => {
    authService.sendOtp.mockResolvedValueOnce({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: '9876543210',
        devOtp: '582910',
        resendCooldownSeconds: 45,
      },
    });

    authService.verifyOtp.mockResolvedValueOnce({
      success: true,
      message: 'Mobile number verified successfully!',
      data: {
        phone: '9876543210',
        verified: true,
        verificationToken: 'valid_mock_token_123',
      },
    });

    const onVerifiedMock = vi.fn();

    render(<PhoneOtpVerification initialPhone="9876543210" onVerified={onVerifiedMock} />);

    const sendBtn = screen.getByRole('button', { name: /Send OTP/i });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    // Should call authService.sendOtp
    expect(authService.sendOtp).toHaveBeenCalledWith({
      phone: '9876543210',
      purpose: 'registration',
    });

    // Should display Demo banner with OTP
    await waitFor(() => {
      expect(screen.getByText('582910')).toBeInTheDocument();
      expect(screen.getByText(/Demo SMS (Mode|Code):/i)).toBeInTheDocument();
    });

    // Click Auto-fill OTP
    const autofillBtn = screen.getByRole('button', { name: /Auto-fill OTP/i });
    await act(async () => {
      fireEvent.click(autofillBtn);
    });

    // Click Verify Code
    const verifyBtn = screen.getByRole('button', { name: /Verify Code/i });
    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(authService.verifyOtp).toHaveBeenCalledWith({
      phone: '9876543210',
      otp: '582910',
      purpose: 'registration',
    });

    // Should display verified badge
    await waitFor(() => {
      expect(screen.getByText(/Phone Verified/i)).toBeInTheDocument();
    });

    expect(onVerifiedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '9876543210',
        verificationToken: 'valid_mock_token_123',
      })
    );
  });
});
