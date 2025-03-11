import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import SearchPage from './page';

describe('SearchPage', () => {
  beforeEach(() => {
    render(<SearchPage />);
  });

  it('renders search input and filters', () => {
    // Check for search input
    expect(screen.getByPlaceholderText('Search for home chefs...')).toBeInTheDocument();

    // Check for cuisine type filters
    expect(screen.getByText('Cuisine Type')).toBeInTheDocument();
    expect(screen.getByText('North Indian')).toBeInTheDocument();
    expect(screen.getByText('South Indian')).toBeInTheDocument();

    // Check for price range filter
    expect(screen.getByText('Price Range')).toBeInTheDocument();

    // Check for rating filter
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();

    // Check for dietary preferences
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  it('updates search query when typing', () => {
    const searchInput = screen.getByPlaceholderText('Search for home chefs...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(searchInput).toHaveValue('test query');
  });

  it('toggles cuisine type filters', () => {
    const northIndianCheckbox = screen.getByLabelText('North Indian');
    fireEvent.click(northIndianCheckbox);
    expect(northIndianCheckbox).toBeChecked();

    fireEvent.click(northIndianCheckbox);
    expect(northIndianCheckbox).not.toBeChecked();
  });

  it('toggles dietary preference filters', () => {
    const vegetarianCheckbox = screen.getByLabelText('Vegetarian');
    fireEvent.click(vegetarianCheckbox);
    expect(vegetarianCheckbox).toBeChecked();

    fireEvent.click(vegetarianCheckbox);
    expect(vegetarianCheckbox).not.toBeChecked();
  });

  it('resets all filters when clicking reset button', async () => {
    // Set some filters
    const searchInput = screen.getByPlaceholderText('Search for home chefs...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    const vegetarianCheckbox = screen.getByLabelText('Vegetarian');
    fireEvent.click(vegetarianCheckbox);

    const northIndianCheckbox = screen.getByLabelText('North Indian');
    fireEvent.click(northIndianCheckbox);

    // Click reset button
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);

    // Verify filters are reset
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(vegetarianCheckbox).not.toBeChecked();
      expect(northIndianCheckbox).not.toBeChecked();
    });
  });

  it('shows loading state while fetching results', () => {
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows no results message when no sellers found', async () => {
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search query')).toBeInTheDocument();
    });
  });
}); 