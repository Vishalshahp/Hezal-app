import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('Hezal Market Client Frontend Application', () => {
  it('renders the application brand and foundation status', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Verify Brand title is rendered
    expect(screen.getAllByText(/Hezal Market/i).length).toBeGreaterThan(0);

    // Verify Tagline is rendered
    expect(screen.getAllByText(/Discover Local. Shop Nearby./i).length).toBeGreaterThan(0);

    // Verify Phase 2 Foundation badge is rendered
    expect(screen.getByText(/Phase 2: Project Foundation Ready/i)).toBeInTheDocument();
  });
});
