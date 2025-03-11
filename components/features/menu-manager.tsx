'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icons } from '@/components/ui/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface MenuManagerProps {
  items: any[]; // TODO: Type this properly when backend is ready
  isLoading?: boolean;
}

interface FoodItem {
  id?: string;
  name: string;
  price: number;
  description: string;
  category_id: string;
  is_available: boolean;
  stock: number;
  dietary_info: string;
  image_url: string;
}

export function MenuManager({ items = [], isLoading }: MenuManagerProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (newItem: FoodItem) => {
      // TODO: Implement when backend is ready
      return Promise.resolve(newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu'] });
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
      setIsAddingItem(false);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: FoodItem) => {
      // TODO: Implement when backend is ready
      return Promise.resolve(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu'] });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      setEditingItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // TODO: Implement when backend is ready
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu'] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item: FoodItem = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      category_id: formData.get('category') as string,
      is_available: formData.get('is_available') === 'true',
      stock: parseInt(formData.get('stock') as string, 10),
      dietary_info: formData.get('dietary_info') as string,
      image_url: formData.get('image_url') as string,
    };

    if (editingItem?.id) {
      await updateItemMutation.mutateAsync({ ...item, id: editingItem.id });
    } else {
      await addItemMutation.mutateAsync(item);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="main_course">Main Course</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" name="stock" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary_info">Dietary Information</Label>
                <Input id="dietary_info" name="dietary_info" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" type="url" required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="is_available" name="is_available" />
                <Label htmlFor="is_available">Available</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="aspect-video relative mb-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setEditingItem(item)}
                  >
                    <Icons.edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm">{item.description}</p>
              <div className="flex justify-between text-sm">
                <span>Stock: {item.stock}</span>
                <span
                  className={
                    item.is_available ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingItem.price}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingItem.description}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={editingItem.category_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="main_course">Main Course</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  defaultValue={editingItem.stock}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dietary-info">Dietary Information</Label>
                <Input
                  id="edit-dietary-info"
                  name="dietary_info"
                  defaultValue={editingItem.dietary_info}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image-url">Image URL</Label>
                <Input
                  id="edit-image-url"
                  name="image_url"
                  type="url"
                  defaultValue={editingItem.image_url}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-available"
                  name="is_available"
                  defaultChecked={editingItem.is_available}
                />
                <Label htmlFor="edit-is-available">Available</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 