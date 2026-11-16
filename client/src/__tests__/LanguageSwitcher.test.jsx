import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function TestConsumer() {
  const { lang, changeLanguage, t, tCategory } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="explore-text">{t('explore')}</span>
      <span data-testid="search-text">{t('search_btn')}</span>
      <span data-testid="category-text">{tCategory('street-food-chaat')}</span>
      <button onClick={() => changeLanguage('en')}>Set EN</button>
      <button onClick={() => changeLanguage('gu')}>Set GU</button>
      <button onClick={() => changeLanguage('hi')}>Set HI</button>
    </div>
  );
}

describe('Multi-Language Switching System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English and allows dynamic switching to Gujarati and Hindi', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );

    // Default English
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('explore-text')).toHaveTextContent('Explore Stalls');
    expect(screen.getByTestId('search-text')).toHaveTextContent('Search Stalls');
    expect(screen.getByTestId('category-text')).toHaveTextContent('Street Food & Chaat');

    // Switch to Gujarati
    act(() => {
      fireEvent.click(screen.getByText('Set GU'));
    });

    expect(screen.getByTestId('current-lang')).toHaveTextContent('gu');
    expect(screen.getByTestId('explore-text')).toHaveTextContent('લારીઓ શોધો');
    expect(screen.getByTestId('search-text')).toHaveTextContent('લારીઓ શોધો');
    expect(screen.getByTestId('category-text')).toHaveTextContent('સ્ટ્રીટ ફૂડ અને ચાટ');
    expect(localStorage.getItem('hezal_language')).toBe('gu');

    // Switch to Hindi
    act(() => {
      fireEvent.click(screen.getByText('Set HI'));
    });

    expect(screen.getByTestId('current-lang')).toHaveTextContent('hi');
    expect(screen.getByTestId('explore-text')).toHaveTextContent('ठेले खोजें');
    expect(screen.getByTestId('search-text')).toHaveTextContent('ठेले खोजें');
    expect(screen.getByTestId('category-text')).toHaveTextContent('स्ट्रीट फूड और चाट');
    expect(localStorage.getItem('hezal_language')).toBe('hi');
  });

  it('renders working language toggle buttons in the Navbar for desktop and mobile', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Desktop or mobile toggle buttons exist
    const guButtons = screen.getAllByRole('button', { name: /ગુજ/i });
    expect(guButtons.length).toBeGreaterThanOrEqual(1);

    // Clicking switches the active state
    act(() => {
      fireEvent.click(guButtons[0]);
    });

    expect(localStorage.getItem('hezal_language')).toBe('gu');

    // The button reflects active state with aria-pressed
    expect(guButtons[0]).toHaveAttribute('aria-pressed', 'true');
  });
});
