import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ExplorePage from '../pages/ExplorePage';
import PublicVendorProfilePage from '../pages/PublicVendorProfilePage';
import vendorService from '../services/vendorService';

// Mock vendorService methods
vi.mock('../services/vendorService', () => ({
  default: {
    getCategories: vi.fn(),
    searchVendors: vi.fn(),
    getNearbyVendors: vi.fn(),
    getPublicProfile: vi.fn(),
  },
  getCategories: vi.fn(),
  searchVendors: vi.fn(),
  getNearbyVendors: vi.fn(),
  getPublicProfile: vi.fn(),
}));

// Mock InteractiveMap for jsdom testing
vi.mock('../components/InteractiveMap', () => ({
  default: ({ vendors, _selectedVendor, onSelectVendor }) => (
    <div data-testid="interactive-map">
      <span>Interactive Map Mock</span>
      {vendors && (
        <div data-testid="map-markers-count">{vendors.length} markers</div>
      )}
      {vendors?.map((v) => (
        <button
          key={v.id}
          data-testid={`map-marker-${v.id}`}
          onClick={() => onSelectVendor && onSelectVendor(v)}
        >
          {v.stallName}
        </button>
      ))}
    </div>
  ),
}));

const mockCategories = [
  { id: 'cat1', name: 'Street Food', slug: 'street-food', icon: 'Utensils' },
  { id: 'cat2', name: 'Handcrafts', slug: 'handcrafts', icon: 'Palette' },
];

const mockVendors = [
  {
    id: 'ven1',
    stallName: 'Ramesh Famous Chaat',
    stallType: 'mobile',
    tagline: 'Best spicy pani puri',
    description: 'Serving fresh homemade sev puri.',
    categories: [{ id: 'cat1', name: 'Street Food', slug: 'street-food' }],
    contactPublic: { phone: '+919876543201' },
    address: { street: 'Law Garden Khau Gali', area: 'Ellisbridge', city: 'Ahmedabad' },
    location: { type: 'Point', coordinates: [72.5598, 23.0232] },
    locationUpdatedAt: new Date().toISOString(),
    availabilityStatus: 'open',
    approvalStatus: 'approved',
    distance: 350,
    distanceKm: 0.4,
    productCount: 2,
    sampleProducts: [{ name: 'Pani Puri', price: 40 }],
  },
  {
    id: 'ven2',
    stallName: 'Geeta Clay Crafts',
    stallType: 'fixed',
    tagline: 'Handmade terracotta pots',
    description: 'Earthenware and clay items.',
    categories: [{ id: 'cat2', name: 'Handcrafts', slug: 'handcrafts' }],
    contactPublic: { phone: '+919876543202' },
    address: { street: 'Vastrapur Lake Stall 12', area: 'Vastrapur', city: 'Ahmedabad' },
    location: { type: 'Point', coordinates: [72.5293, 23.035] },
    locationUpdatedAt: new Date().toISOString(),
    availabilityStatus: 'open',
    approvalStatus: 'approved',
    distance: 3200,
    distanceKm: 3.2,
    productCount: 1,
    sampleProducts: [{ name: 'Clay Matka', price: 250 }],
  },
];

describe('Phase 5: Discovery, Explore Page & Public Profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vendorService.getCategories.mockResolvedValue({
      success: true,
      data: { categories: mockCategories },
    });
    vendorService.searchVendors.mockResolvedValue({
      success: true,
      data: {
        vendors: mockVendors,
        pagination: { total: 2, page: 1, limit: 12, totalPages: 1 },
      },
    });
  });

  it('renders explore page with search bar, categories, and vendor cards', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/explore']}>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Explore Local Stalls/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search product, stall name, item/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ramesh Famous Chaat').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Geeta Clay Crafts').length).toBeGreaterThan(0);
      expect(screen.getByTestId('interactive-map')).toBeInTheDocument();
    });
  });

  it('displays category filter chips and triggers category filtering', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/explore']}>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Street Food' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Handcrafts' })).toBeInTheDocument();
    });

    const handcraftsBtn = screen.getByRole('button', { name: 'Handcrafts' });
    await act(async () => {
      fireEvent.click(handcraftsBtn);
    });

    expect(vendorService.searchVendors).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'handcrafts' })
    );
  });

  it('switches view mode between List, Map, and Split', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/explore']}>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    const listBtn = screen.getByRole('button', { name: /List/i });
    await act(async () => {
      fireEvent.click(listBtn);
    });

    // In List mode, vendor cards are displayed without sticky split
    expect(screen.getByText('Ramesh Famous Chaat')).toBeInTheDocument();

    const mapBtn = screen.getByRole('button', { name: /Map/i });
    await act(async () => {
      fireEvent.click(mapBtn);
    });

    expect(screen.getByTestId('interactive-map')).toBeInTheDocument();
  });

  it('handles empty results and provides a reset filters action', async () => {
    vendorService.searchVendors.mockResolvedValueOnce({
      success: true,
      data: { vendors: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/explore?q=NonExistentItem']}>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/No Matching Stalls Found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Filters/i })).toBeInTheDocument();
    });
  });

  it('handles geolocation permission denied error gracefully', async () => {
    // Mock navigator.geolocation
    const originalGeolocation = navigator.geolocation;
    navigator.geolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error({ code: 1, message: 'User denied Geolocation' });
      }),
    };

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/explore']}>
          <AuthProvider>
            <ExplorePage />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    const geoBtn = screen.getByRole('button', { name: /Use My Current Location/i });
    await act(async () => {
      fireEvent.click(geoBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Location permission denied/i)).toBeInTheDocument();
    });

    navigator.geolocation = originalGeolocation;
  });

  it('renders public vendor profile with stall details and products', async () => {
    vendorService.getPublicProfile.mockResolvedValueOnce({
      success: true,
      data: {
        profile: {
          id: 'ven1',
          stallName: 'Ramesh Famous Chaat',
          stallType: 'mobile',
          tagline: 'Best spicy pani puri',
          description: 'Hygienic street chaat.',
          categories: [{ id: 'cat1', name: 'Street Food' }],
          contactPublic: { phone: '+919876543201', whatsapp: '+919876543201' },
          address: { street: 'Law Garden Stall #4', area: 'Ellisbridge', city: 'Ahmedabad' },
          location: { type: 'Point', coordinates: [72.5598, 23.0232] },
          availabilityStatus: 'open',
          approvalStatus: 'approved',
          openingHours: [
            { day: 'Mon', open: '16:00', close: '23:00', isClosed: false },
          ],
        },
        products: [
          {
            id: 'p1',
            name: 'Pani Puri Special',
            description: '8 crispy puris with spiced water',
            price: 40,
            isAvailable: true,
          },
        ],
      },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/vendors/ven1']}>
          <Routes>
            <Route path="/vendors/:id" element={<PublicVendorProfilePage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ramesh Famous Chaat' })).toBeInTheDocument();
      expect(screen.getByText('Pani Puri Special')).toBeInTheDocument();
      expect(screen.getByText('₹40')).toBeInTheDocument();
      expect(screen.getByText(/Get Walking Directions/i)).toBeInTheDocument();
      expect(screen.getByText('Weekly Operating Hours')).toBeInTheDocument();
    });
  });

  it('renders safe 404 message when vendor profile is unavailable or unapproved', async () => {
    vendorService.getPublicProfile.mockRejectedValueOnce(
      new Error('This vendor stall is currently not publicly available or pending review.')
    );

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/vendors/unapproved_id']}>
          <Routes>
            <Route path="/vendors/:id" element={<PublicVendorProfilePage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Vendor Stall Unavailable/i })).toBeInTheDocument();
      expect(screen.getByText(/Back to Explore Stalls/i)).toBeInTheDocument();
    });
  });
});
