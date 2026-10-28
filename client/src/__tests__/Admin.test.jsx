import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import AdminVendorsPage from '../pages/AdminVendorsPage';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import * as adminService from '../services/adminService';

// Mock the admin service functions
vi.mock('../services/adminService', () => ({
  getDashboardMetrics: vi.fn(),
  getAdminVendors: vi.fn(),
  getAdminVendorDetails: vi.fn(),
  updateAdminVendorStatus: vi.fn(),
  getAdminCategories: vi.fn(),
  createAdminCategory: vi.fn(),
  updateAdminCategory: vi.fn(),
  toggleAdminCategoryStatus: vi.fn(),
  deleteAdminCategory: vi.fn(),
  getAdminReports: vi.fn(),
  updateAdminReport: vi.fn(),
  getAdminUsers: vi.fn(),
  updateAdminUserStatus: vi.fn(),
  getAdminAuditLogs: vi.fn(),
  submitPublicReport: vi.fn(),
}));

const mockAdminUser = {
  id: 'admin_123',
  _id: 'admin_123',
  name: 'Super Administrator',
  email: 'admin@hezalmarket.com',
  role: 'admin',
  accountStatus: 'active',
};

const mockAuthContextValue = {
  user: mockAdminUser,
  isAuthenticated: true,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

const renderWithContext = (ui, initialRoute = '/admin') => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Phase 6: Admin Dashboard & Listing Moderation Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Admin Dashboard Metrics & Feeds', () => {
    it('should render calculated metrics cards, pending applications, and audit logs', async () => {
      adminService.getDashboardMetrics.mockResolvedValueOnce({
        success: true,
        data: {
          metrics: {
            totalUsers: 15,
            totalCustomers: 10,
            totalVendors: 4,
            pendingVendors: 2,
            approvedVendors: 2,
            changesRequestedVendors: 0,
            suspendedVendors: 0,
            totalCategories: 6,
            totalProducts: 24,
            unresolvedReports: 1,
          },
        },
      });

      adminService.getAdminVendors.mockResolvedValueOnce({
        success: true,
        data: {
          vendors: [
            {
              id: 'ven_p1',
              stallName: 'Ganesh Pav Bhaji Stall',
              stallType: 'mobile',
              address: { area: 'Maninagar', city: 'Ahmedabad' },
              categories: [{ id: 'cat1', name: 'Fast Food' }],
              createdAt: '2026-10-25T10:00:00.000Z',
              vendorId: { name: 'Ganesh Bhai', email: 'ganesh@example.com' },
            },
          ],
        },
      });

      adminService.getAdminAuditLogs.mockResolvedValueOnce({
        success: true,
        data: {
          logs: [
            {
              id: 'log_1',
              action: 'vendor_approved',
              targetType: 'VendorProfile',
              targetName: 'Suresh Juice Center',
              adminId: { name: 'Super Administrator', email: 'admin@hezalmarket.com' },
              reason: 'Valid stall photo and location verified',
              createdAt: '2026-10-26T12:00:00.000Z',
            },
          ],
        },
      });

      renderWithContext(<AdminDashboard />);

      // Wait for metrics to load
      await waitFor(() => {
        expect(screen.getByText('Admin Control Center')).toBeInTheDocument();
      });

      // Verify KPI values
      expect(screen.getByText('10')).toBeInTheDocument(); // totalCustomers
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // pendingVendors
      expect(screen.getByText('Ganesh Pav Bhaji Stall')).toBeInTheDocument();
      expect(screen.getByText('vendor_approved')).toBeInTheDocument();
      expect(screen.getByText('Suresh Juice Center')).toBeInTheDocument();
    });
  });

  describe('2. Vendor Approvals & Review Desk', () => {
    it('should list vendors and allow inspecting details with moderation action', async () => {
      adminService.getAdminVendors.mockResolvedValueOnce({
        success: true,
        data: {
          vendors: [
            {
              id: 'ven_1',
              stallName: 'Raju Omelette Stall',
              stallType: 'mobile',
              approvalStatus: 'pending',
              address: { area: 'Navrangpura', city: 'Ahmedabad' },
              vendorId: { name: 'Raju Patel', email: 'raju@example.com' },
              createdAt: '2026-10-27T08:00:00.000Z',
            },
          ],
        },
      });

      adminService.getAdminVendorDetails.mockResolvedValueOnce({
        success: true,
        data: {
          profile: {
            id: 'ven_1',
            stallName: 'Raju Omelette Stall',
            stallType: 'mobile',
            approvalStatus: 'pending',
            tagline: 'Best street snacks',
            description: 'Serving hot breakfast since 2018',
            address: { street: 'Main Rd', area: 'Navrangpura', city: 'Ahmedabad' },
            location: { coordinates: [72.56, 23.03] },
            contactPublic: { phone: '+919876543210' },
          },
          user: { name: 'Raju Patel', email: 'raju@example.com' },
          products: [{ id: 'p1', name: 'Cheese Omelette', price: 90, isAvailable: true }],
          auditLogs: [],
        },
      });

      adminService.updateAdminVendorStatus.mockResolvedValueOnce({
        success: true,
        data: { id: 'ven_1', approvalStatus: 'approved' },
      });

      // Re-fetch call after action
      adminService.getAdminVendors.mockResolvedValueOnce({
        success: true,
        data: {
          vendors: [
            {
              id: 'ven_1',
              stallName: 'Raju Omelette Stall',
              stallType: 'mobile',
              approvalStatus: 'approved',
              address: { area: 'Navrangpura', city: 'Ahmedabad' },
              vendorId: { name: 'Raju Patel', email: 'raju@example.com' },
              createdAt: '2026-10-27T08:00:00.000Z',
            },
          ],
        },
      });

      renderWithContext(<AdminVendorsPage />);

      await waitFor(() => {
        expect(screen.getByText('Raju Omelette Stall')).toBeInTheDocument();
      });

      // Click "Inspect & Adjudicate"
      const inspectBtn = screen.getByText('Inspect & Adjudicate');
      fireEvent.click(inspectBtn);

      await waitFor(() => {
        expect(screen.getByText('Cheese Omelette')).toBeInTheDocument();
      });

      // Click "✓ Approve Stall"
      const approveBtn = screen.getByText('✓ Approve Stall');
      fireEvent.click(approveBtn);

      // Confirm approve action
      const confirmBtn = screen.getByText(/Confirm & Execute approve/i);
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(adminService.updateAdminVendorStatus).toHaveBeenCalledWith('ven_1', {
          action: 'approve',
          reason: '',
        });
      });
    });
  });

  describe('3. Category Administration', () => {
    it('should list categories with usage stats and handle active toggle', async () => {
      adminService.getAdminCategories.mockResolvedValueOnce({
        success: true,
        data: {
          categories: [
            {
              id: 'cat_1',
              name: 'Street Food',
              slug: 'street-food',
              icon: 'Utensils',
              displayOrder: 1,
              isActive: true,
              vendorCount: 5,
              productCount: 20,
            },
          ],
        },
      });

      adminService.toggleAdminCategoryStatus.mockResolvedValueOnce({
        success: true,
        message: 'Category Street Food is now inactive.',
        data: { categoryId: 'cat_1', isActive: false },
      });

      // Second getAdminCategories after toggle
      adminService.getAdminCategories.mockResolvedValueOnce({
        success: true,
        data: {
          categories: [
            {
              id: 'cat_1',
              name: 'Street Food',
              slug: 'street-food',
              icon: 'Utensils',
              displayOrder: 1,
              isActive: false,
              vendorCount: 5,
              productCount: 20,
            },
          ],
        },
      });

      renderWithContext(<AdminCategoriesPage />);

      await waitFor(() => {
        expect(screen.getByText('Street Food')).toBeInTheDocument();
        expect(screen.getByText('5 stalls')).toBeInTheDocument();
        expect(screen.getByText('20 products')).toBeInTheDocument();
      });

      // Click status toggle
      const activeBtn = screen.getByText('Active');
      fireEvent.click(activeBtn);

      await waitFor(() => {
        expect(adminService.toggleAdminCategoryStatus).toHaveBeenCalledWith('cat_1');
      });
    });

    it('should open create modal and submit new category', async () => {
      adminService.getAdminCategories.mockResolvedValueOnce({
        success: true,
        data: { categories: [] },
      });

      adminService.createAdminCategory.mockResolvedValueOnce({
        success: true,
        data: {
          category: {
            id: 'cat_2',
            name: 'Organic Fruits',
            slug: 'organic-fruits',
            isActive: true,
          },
        },
      });

      adminService.getAdminCategories.mockResolvedValueOnce({
        success: true,
        data: {
          categories: [
            {
              id: 'cat_2',
              name: 'Organic Fruits',
              slug: 'organic-fruits',
              icon: 'Apple',
              isActive: true,
              vendorCount: 0,
              productCount: 0,
            },
          ],
        },
      });

      renderWithContext(<AdminCategoriesPage />);

      await waitFor(() => {
        expect(screen.getByText('Add New Category')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add New Category'));

      // Fill in category form
      const nameInput = screen.getByPlaceholderText(/e.g. Street Food/i);
      fireEvent.change(nameInput, { target: { value: 'Organic Fruits' } });

      const submitBtn = screen.getByText('Create Category');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(adminService.createAdminCategory).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Organic Fruits',
            slug: 'organic-fruits',
          })
        );
      });
    });
  });

  describe('4. Listing Reports Moderation', () => {
    it('should list reports and resolve with resolution note', async () => {
      adminService.getAdminReports.mockResolvedValueOnce({
        success: true,
        data: {
          reports: [
            {
              id: 'rep_1',
              targetType: 'vendor',
              targetVendorId: 'ven_1',
              targetVendor: {
                stallName: 'Kailash Parbat Corner',
                address: { area: 'CG Road', city: 'Ahmedabad' },
              },
              reason: 'inaccurate_location',
              details: 'Stall relocated to the corner opposite the mall.',
              reporterName: 'Kunal Patel',
              reporterEmail: 'kunal@example.com',
              status: 'open',
              createdAt: '2026-10-27T14:00:00.000Z',
            },
          ],
        },
      });

      adminService.updateAdminReport.mockResolvedValueOnce({
        success: true,
        data: { id: 'rep_1', status: 'resolved', resolutionNote: 'GPS verified' },
      });

      adminService.getAdminReports.mockResolvedValueOnce({
        success: true,
        data: {
          reports: [
            {
              id: 'rep_1',
              targetType: 'vendor',
              targetVendor: { stallName: 'Kailash Parbat Corner' },
              reason: 'inaccurate_location',
              status: 'resolved',
              resolutionNote: 'GPS verified and coordinates corrected.',
              createdAt: '2026-10-27T14:00:00.000Z',
            },
          ],
        },
      });

      renderWithContext(<AdminReportsPage />);

      await waitFor(() => {
        expect(screen.getByText('Kailash Parbat Corner')).toBeInTheDocument();
        expect(screen.getByText(/Stall relocated to the corner/i)).toBeInTheDocument();
      });

      // Open adjudication modal
      const actionBtn = screen.getByText('Take Action / Resolve');
      fireEvent.click(actionBtn);

      // Fill in resolution note
      const noteInput = screen.getByPlaceholderText(/Record what action was taken/i);
      fireEvent.change(noteInput, { target: { value: 'GPS verified and coordinates updated.' } });

      // Apply resolution
      const applyBtn = screen.getByText('Apply Adjudication');
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(adminService.updateAdminReport).toHaveBeenCalledWith('rep_1', {
          status: 'resolved',
          resolutionNote: 'GPS verified and coordinates updated.',
        });
      });
    });
  });

  describe('5. User Accounts & Safeguards', () => {
    it('should list users and prevent admin from suspending self', async () => {
      adminService.getAdminUsers.mockResolvedValueOnce({
        success: true,
        data: {
          users: [
            {
              id: 'admin_123',
              name: 'Super Administrator',
              email: 'admin@hezalmarket.com',
              role: 'admin',
              accountStatus: 'active',
              createdAt: '2026-10-20T00:00:00.000Z',
            },
            {
              id: 'user_cust1',
              name: 'Amit Shah',
              email: 'amit@example.com',
              role: 'customer',
              accountStatus: 'active',
              createdAt: '2026-10-26T00:00:00.000Z',
            },
          ],
        },
      });

      renderWithContext(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Super Administrator')).toBeInTheDocument();
        expect(screen.getByText('Amit Shah')).toBeInTheDocument();
      });

      // Self account should have disabled suspend button with indicator
      expect(screen.getByText('You')).toBeInTheDocument();
      const suspendButtons = screen.getAllByRole('button', { name: /^suspend$/i });
      // First button is for admin_123 (self) - must be disabled
      expect(suspendButtons[0]).toBeDisabled();
    });

    it('should allow admin to suspend another user with explicit reason', async () => {
      adminService.getAdminUsers.mockResolvedValueOnce({
        success: true,
        data: {
          users: [
            {
              id: 'user_cust2',
              name: 'Rogue User',
              email: 'rogue@example.com',
              role: 'customer',
              accountStatus: 'active',
              createdAt: '2026-10-26T00:00:00.000Z',
            },
          ],
        },
      });

      adminService.updateAdminUserStatus.mockResolvedValueOnce({
        success: true,
        data: { id: 'user_cust2', accountStatus: 'suspended' },
      });

      adminService.getAdminUsers.mockResolvedValueOnce({
        success: true,
        data: {
          users: [
            {
              id: 'user_cust2',
              name: 'Rogue User',
              email: 'rogue@example.com',
              role: 'customer',
              accountStatus: 'suspended',
              createdAt: '2026-10-26T00:00:00.000Z',
            },
          ],
        },
      });

      renderWithContext(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Rogue User')).toBeInTheDocument();
      });

      const suspendBtn = screen.getByRole('button', { name: /^suspend$/i });
      fireEvent.click(suspendBtn);

      // Provide reason
      const reasonInput = screen.getByPlaceholderText(/Provide justification/i);
      fireEvent.change(reasonInput, { target: { value: 'Abusive comments and false stall reports.' } });

      const confirmBtn = screen.getByText('Confirm Suspension');
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(adminService.updateAdminUserStatus).toHaveBeenCalledWith('user_cust2', {
          action: 'suspend',
          reason: 'Abusive comments and false stall reports.',
        });
      });
    });
  });
});
