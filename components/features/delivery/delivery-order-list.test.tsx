import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { DeliveryOrderList } from './delivery-order-list';

const mockOrders = [
  {
    id: '1',
    createdAt: new Date().toISOString(),
    status: 'pending',
    deliveryAddress: '123 Test St',
    specialInstructions: 'Ring the bell',
    totalPrice: 1000,
    items: [
      {
        id: '1',
        name: 'Test Item',
        quantity: 2,
        price: 500,
      },
    ],
  },
];

describe('DeliveryOrderList', () => {
  it('renders loading spinner when loading', () => {
    render(<DeliveryOrderList orders={[]} isLoading={true} type="active" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders empty state message when no orders', () => {
    render(<DeliveryOrderList orders={[]} isLoading={false} type="active" />);
    expect(screen.getByText('No active deliveries')).toBeInTheDocument();

    render(<DeliveryOrderList orders={[]} isLoading={false} type="available" />);
    expect(screen.getByText('No available orders')).toBeInTheDocument();
  });

  it('renders order cards with correct information', () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="active" />);

    // Check order ID
    expect(screen.getByText(`Order #${mockOrders[0].id}`)).toBeInTheDocument();

    // Check status badge
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Check delivery address
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('expands order details when clicking view details', async () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="active" />);

    // Click view details button
    fireEvent.click(screen.getByText('View Details'));

    // Check if details are shown
    await waitFor(() => {
      expect(screen.getByText('Delivery Details')).toBeInTheDocument();
      expect(screen.getByText(mockOrders[0].deliveryAddress)).toBeInTheDocument();
      expect(screen.getByText(`Note: ${mockOrders[0].specialInstructions}`)).toBeInTheDocument();
    });
  });

  it('shows accept button for available orders', () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="available" />);
    expect(screen.getByText('Accept Order')).toBeInTheDocument();
  });

  it('shows status update buttons for active orders', () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="active" />);
    expect(screen.getByText('Mark as Picked Up')).toBeInTheDocument();
  });

  it('handles order acceptance', async () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="available" />);

    // Click accept order button
    fireEvent.click(screen.getByText('Accept Order'));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('handles status updates', async () => {
    render(<DeliveryOrderList orders={mockOrders} isLoading={false} type="active" />);

    // Click status update button
    fireEvent.click(screen.getByText('Mark as Picked Up'));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
}); 