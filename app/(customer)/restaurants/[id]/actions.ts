'use server';

export async function addItemToCart(formData: FormData) {
  console.log('Server action: Adding item to cart');
  
  let success = false;
  let message = '';
  
  try {
    const foodItemId = formData.get('foodItemId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const itemName = formData.get('itemName') as string;
    
    if (!foodItemId || isNaN(quantity) || quantity <= 0) {
      console.error('Invalid food item or quantity', { foodItemId, quantity });
      message = 'Invalid quantity selected';
      return { success, message };
    }
    
    console.log('Server action: Making API request with', { foodItemId, quantity });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${formData.get('token')}`
      },
      body: JSON.stringify({ foodItemId, quantity }),
      cache: 'no-store'
    });
    
    console.log('Server action: API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to add item to cart', errorData);
      message = errorData.message || 'Failed to add item to cart';
      return { success, message };
    }
    
    console.log('Item added to cart successfully');
    success = true;
    message = `${quantity} × ${itemName} added to your cart.`;
  } catch (error) {
    console.error('Error in server action:', error);
    message = 'An error occurred while adding to cart';
  }
  
  // Return the result that will be available to the client
  return { success, message };
} 