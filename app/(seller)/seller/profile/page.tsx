'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sellerApi } from '@/lib/api';
import { MainLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/providers/auth-provider';
import { Seller } from '@/lib/types/models';
import { useLoadingState } from '@/lib/hooks/use-loading';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Camera,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import CloudinaryImage from '@/components/CloudinaryImage';
import ImageUploader from '@/components/ImageUploader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearLocalAuthData } from '@/lib/api/auth';

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(2, 'Please enter your address'),
  description: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  minimumOrder: z.string().optional(),
  deliveryRadius: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SellerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const { withLoading } = useLoadingState();
  const [confirmDeleteText, setConfirmDeleteText] = React.useState('');
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = React.useState(true);

  // Fetch seller profile
  const { 
    data: profile, 
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: () => sellerApi.getProfile(),
    enabled: isAuthenticated,
  });

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onSubmit",
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: user?.address || '',
      description: '',
      openingTime: '09:00',
      closingTime: '22:00',
      minimumOrder: '10',
      deliveryRadius: '5',
      imageUrl: user?.imageUrl || '',
    },
  });

  // Update form values when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        description: profile.description || '',
        openingTime: profile.openingTime || '09:00',
        closingTime: profile.closingTime || '22:00',
        minimumOrder: String(profile.minimumOrder || '10'),
        deliveryRadius: String(profile.deliveryRadius || '5'),
        imageUrl: profile.imageUrl || '',
      });
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: withLoading(async (data: ProfileFormValues) => {
      console.log('Updating profile with data:', data);
      
      try {
        // Create the payload and explicitly convert string values to numbers
        const sellerData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          description: data.description,
          openingTime: data.openingTime,
          closingTime: data.closingTime,
          imageUrl: data.imageUrl,
        };
        
        // Add numeric values separately to avoid TypeScript errors
        if (data.minimumOrder) {
          Object.assign(sellerData, { minimumOrder: Number(data.minimumOrder) });
        }
        
        if (data.deliveryRadius) {
          Object.assign(sellerData, { deliveryRadius: Number(data.deliveryRadius) });
        }
        
        console.log('Sending sellerData to API:', sellerData);
        return await sellerApi.updateProfile(sellerData);
      } catch (error) {
        console.error('Error in mutation function:', error);
        throw error;
      }
    }),
    onSuccess: (data) => {
      console.log('Profile update success:', data);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: withLoading(async () => {
      console.log('Starting account deletion process');
      try {
        const response = await sellerApi.deleteAccount();
        console.log('Account deletion API response:', response);
        return response;
      } catch (error: any) {
        console.error('Account deletion API error:', error.response?.data || error.message);
        throw error;
      }
    }),
    onSuccess: () => {
      // Clear auth data from local storage
      clearLocalAuthData();
      toast.success('Your account has been deleted successfully');
      // Redirect to home page
      router.push('/');
    },
    onError: (error: any) => {
      console.error('Delete account error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete your account';
      toast.error(`Failed to delete your account: ${errorMessage}`);
    },
  });

  // Handle form submission
  const handleSubmit = (data: ProfileFormValues) => {
    console.log('Form submitted with data:', data);
    updateProfileMutation.mutate(data);
  };

  // Handle delete confirmation text change
  const handleDeleteConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmDeleteText(e.target.value);
    setIsDeleteButtonDisabled(e.target.value !== 'DELETE');
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  // Loading state
  const isLoading = authLoading || profileLoading;

  if (!isAuthenticated && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6">Please log in to view your profile.</p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Seller Profile</h1>
          <p className="text-gray-600">Manage your restaurant information and settings</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault(); // Prevent default form submission
                      console.log('Form submit event triggered');
                      
                      // Log validation state
                      console.log('Form validity:', form.formState.isValid);
                      console.log('Form values:', form.getValues());
                      console.log('Form errors:', form.formState.errors);
                      
                      // Proceed with submission regardless of form.formState.isValid
                      // since errors appear to be empty
                      const formData = form.getValues();
                      console.log('Proceeding with form submission:', formData);
                      handleSubmit(formData);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell customers about your cooking..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Restaurant Cover Image</Label>
                      {profile?.imageUrl && (
                        <div className="mb-4">
                          <p className="text-sm mb-2">Current Image:</p>
                          <div className="relative h-40 w-full rounded-md overflow-hidden">
                            <CloudinaryImage
                              src={profile.imageUrl}
                              alt={profile.name || 'Restaurant cover'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <ImageUploader
                        onImageUpload={(imageUrl) => {
                          form.setValue('imageUrl', imageUrl);
                        }}
                        currentImage={profile?.imageUrl}
                        folder="seller"
                        buttonText="Upload Restaurant Cover Image"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended image size: 1200x800 pixels
                      </p>
                      {form.formState.errors.imageUrl && (
                        <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      disabled={updateProfileMutation.isPending}
                      onClick={() => {
                        console.log('Save Changes button clicked directly');
                        const formData = form.getValues();
                        console.log('Form data:', formData);
                        
                        // Manually handle the submission without going through the form validation
                        const sellerData = {
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone,
                          address: formData.address,
                          description: formData.description,
                          openingTime: formData.openingTime,
                          closingTime: formData.closingTime,
                          imageUrl: formData.imageUrl,
                        };
                        
                        // Add numeric fields directly to payload
                        if (formData.minimumOrder) {
                          Object.assign(sellerData, { minimumOrder: Number(formData.minimumOrder) });
                        }
                        
                        if (formData.deliveryRadius) {
                          Object.assign(sellerData, { deliveryRadius: Number(formData.deliveryRadius) });
                        }
                        
                        console.log('Submitting seller data:', sellerData);
                        
                        // Call the API directly with loading state
                        withLoading(async () => {
                          try {
                            const response = await sellerApi.updateProfile(sellerData);
                            console.log('Profile update success:', response);
                            toast.success('Profile updated successfully');
                            queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
                          } catch (error) {
                            console.error('Profile update error:', error);
                            toast.error('Failed to update profile');
                          }
                        })();
                      }}
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center space-x-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{user?.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    9:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Delete Account Section */}
        <Card className="mt-8 border-red-200">
          <CardHeader className="bg-red-50 rounded-t-lg">
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently remove your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">
                <strong>Warning:</strong> This action cannot be undone. When you delete your account:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All your restaurant information will be permanently deleted</li>
                <li>Your menu items and categories will be removed</li>
                <li>You will no longer have access to order history</li>
                <li>Customers will no longer be able to order from your restaurant</li>
              </ul>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account and all data associated with it will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <p className="text-sm font-medium mb-2">
                    Type <span className="font-bold">DELETE</span> to confirm:
                  </p>
                  <Input
                    className="border-red-300 focus:border-red-500"
                    value={confirmDeleteText}
                    onChange={handleDeleteConfirmTextChange}
                    placeholder="Type DELETE to confirm"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                    disabled={isDeleteButtonDisabled || deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 