import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { useAuthContext } from '@/providers/auth-provider';
import SellerMenuPage from './page';

// Mock auth context
vi.mock('@/components/providers/auth-provider', () => ({
  useAuthContext: vi.fn(),
}));

const mockUser = {
  id: '1',
  name: 'Test Seller',
  email: 'test@example.com',
};

const mockCategories = [
  {
    id: '1',
    name: 'Category 1',
    restaurantId: '1',
  },
];

const mockFoodItems = [
  {
    id: '1',
    name: 'Food Item 1',
    categoryId: '1',
    restaurantId: '1',
    price: 1000,
    imageUrl: 'https://example.com/image.jpg',
    isAvailable: true,
    description: 'Test description',
    dietaryInfo: 'Vegetarian',
    stock: 10,
  },
];

describe('SellerMenuPage', () => {
  beforeEach(() => {
    (useAuthContext as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
    });
  });

  it('renders login message when not authenticated', () => {
    (useAuthContext as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<SellerMenuPage />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Please log in to manage your menu.')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    (useAuthContext as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
    });

    render(<SellerMenuPage />);
    expect(screen.getByText('Loading menu data...')).toBeInTheDocument();
  });

  it('renders menu management interface when authenticated', async () => {
    render(<SellerMenuPage />);

    // Check header
    expect(screen.getByText('Menu Management')).toBeInTheDocument();
    expect(screen.getByText('Manage your food items and categories')).toBeInTheDocument();

    // Check tabs
    expect(screen.getByRole('tab', { name: 'Food Items' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Categories' })).toBeInTheDocument();
  });

  it('switches between food items and categories tabs', async () => {
    render(<SellerMenuPage />);

    // Click categories tab
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));
    expect(screen.getByText('Categories')).toBeInTheDocument();

    // Click food items tab
    fireEvent.click(screen.getByRole('tab', { name: 'Food Items' }));
    expect(screen.getByText('Food Items')).toBeInTheDocument();
  });

  it('filters food items by search query', async () => {
    render(<SellerMenuPage />);

    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput).toHaveValue('test query');
  });

  it('filters food items by category', async () => {
    render(<SellerMenuPage />);

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'all' } });

    expect(categorySelect).toHaveValue('all');
  });

  it('toggles food item availability', async () => {
    render(<SellerMenuPage />);

    // Find and click the availability toggle
    const availabilitySwitch = screen.getByRole('switch');
    fireEvent.click(availabilitySwitch);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('handles food item deletion', async () => {
    render(<SellerMenuPage />);

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    // Find and click delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('handles category deletion', async () => {
    render(<SellerMenuPage />);

    // Switch to categories tab
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    // Find and click delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });
}); 