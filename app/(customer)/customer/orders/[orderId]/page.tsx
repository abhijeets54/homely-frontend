'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layouts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { orderApi } from '@/lib/api/orders';
import { paymentApi } from '@/lib/api/payment';
import { reviewApi } from '@/lib/api/review';
import { formatDate } from '@/lib/utils/format';
import { ArrowLeft, MapPin, CreditCard, Clock, Package, Star, AlertTriangle, RefreshCw } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // State for review
  const [rating, setRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  
  // State for cancellation
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showCancelForm, setShowCancelForm] = useState<boolean>(false);
  
  // State for refund
  const [refundReason, setRefundReason] = useState<string>('');
  const [showRefundForm, setShowRefundForm] = useState<boolean>(false);
  
  // Order query
  const { 
    data: order, 
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        return await orderApi.getOrderDetails(orderId);
      } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
    },
    enabled: !!orderId && isAuthenticated,
  });
  
  // Payment query
  const {
    data: payment,
    isLoading: paymentLoading,
    error: paymentError,
    refetch: refetchPayment
  } = useQuery({
    queryKey: ['payment-by-order', orderId],
    queryFn: async () => {
      try {
        return await paymentApi.getPaymentByOrder(orderId);
      } catch (error) {
        console.error('Error fetching payment:', error);
        throw error;
      }
    },
    enabled: !!orderId && isAuthenticated,
  });
  
  // Review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: any) => reviewApi.createReview(reviewData),
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setShowReviewForm(false);
      setRating(0);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string, reason: string }) => 
      orderApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
      setShowCancelForm(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Request refund mutation
  const requestRefundMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string, reason: string }) => 
      paymentApi.requestRefund({
        paymentId,
        amount: payment?.amount || 0,
        reason
      }),
    onSuccess: () => {
      toast({
        title: "Refund Requested",
        description: "Your refund request has been submitted successfully.",
      });
      setShowRefundForm(false);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['payment-by-order', orderId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to request refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'out for delivery':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle submit review
  const handleSubmitReview = () => {
    if (!user?.id || !order?.id || !order?.restaurantId) return;
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingReview(true);
    
    createReviewMutation.mutate({
      userId: user.id,
      restaurantId: order.restaurantId,
      orderId: order.id,
      rating,
      comment: reviewComment.trim() || undefined
    });
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    if (!orderId) return;
    
    if (!cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }
    
    cancelOrderMutation.mutate({ orderId, reason: cancelReason });
  };
  
  // Handle request refund
  const handleRequestRefund = () => {
    if (!payment?.id) return;
    
    if (!refundReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the refund request.",
        variant: "destructive",
      });
      return;
    }
    
    requestRefundMutation.mutate({ 
      paymentId: payment.id, 
      reason: refundReason 
    });
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Loading state
  const isLoading = orderLoading || paymentLoading;

  // Can request refund if order is delivered and payment is paid
  const canRequestRefund = order?.status === 'delivered' && 
                          payment?.paymentStatus === 'paid' && 
                          payment?.paymentMethod !== 'cod' &&
                          !payment?.refundStatus;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view order details.</p>
            <Button asChild>
              <Link href="/login?userType=customer">Login</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/customer/orders" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Orders</span>
            </Link>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : orderError || !order ? (
          <Card className="p-6 text-center">
            <CardTitle className="text-red-500 mb-2">Error Loading Order</CardTitle>
            <CardDescription>
              We encountered an error while loading your order details. Please try again later.
            </CardDescription>
            <Button className="mt-4" onClick={() => refetchOrder()}>
              Retry
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                        <p className="font-medium">Delivery Address</p>
                        <p className="text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    {order.specialInstructions && (
                      <div className="flex items-start">
                        <Package className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                          <p className="font-medium">Special Instructions</p>
                          <p className="text-gray-600">{order.specialInstructions}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                        <p className="font-medium">Delivery Status</p>
                        <p className="text-gray-600">
                          {order.status === 'delivered' 
                            ? 'Your order has been delivered.' 
                            : order.status === 'out for delivery'
                            ? 'Your order is on the way.'
                            : order.status === 'preparing'
                            ? 'Your order is being prepared.'
                            : order.status === 'cancelled'
                            ? 'Your order has been cancelled.'
                            : 'Your order is pending.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowCancelForm(true)}
                      disabled={cancelOrderMutation.isPending}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {order.status === 'delivered' && !showReviewForm && (
                    <Button onClick={() => setShowReviewForm(true)}>
                      <Star className="h-4 w-4 mr-2" />
                      Leave a Review
                    </Button>
                  )}
                  {canRequestRefund && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRefundForm(true)}
                      disabled={requestRefundMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Refund
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Cancel Order Form */}
              {showCancelForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancel Order</CardTitle>
                    <CardDescription>
                      Please provide a reason for cancellation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Reason for cancellation"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowCancelForm(false)}>
                      Back
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                    >
                      {cancelOrderMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Refund Request Form */}
              {showRefundForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Request Refund</CardTitle>
                    <CardDescription>
                      Please provide a reason for your refund request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Reason for refund request"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowRefundForm(false)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleRequestRefund}
                      disabled={requestRefundMutation.isPending}
                    >
                      {requestRefundMutation.isPending ? 'Submitting...' : 'Submit Refund Request'}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                    <CardDescription>
                      Share your experience with this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                      <p className="font-medium mb-2">Rating</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Comments (Optional)</p>
                      <Textarea
                        placeholder="Share your experience with this order"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={createReviewMutation.isPending || rating === 0}
                    >
                      {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4">
                          <Image
                            src={item.foodItem?.imageUrl || '/placeholder-food.jpg'}
                            alt={item.foodItem?.name || 'Food item'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{item.foodItem?.name || 'Food item'}</h3>
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x ₹{item.price.toFixed(2)}
                          </p>
                          {item.foodItem?.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.foodItem.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  </CardContent>
                </Card>

              {/* Restaurant Info */}
                <Card>
                  <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                    <p className="font-medium">{order.restaurant?.name || 'Restaurant'}</p>
                    <p className="text-gray-600">{order.restaurant?.address || 'Address not available'}</p>
                    {order.restaurant?.phoneNumber && (
                      <p className="text-gray-600">Phone: {order.restaurant.phoneNumber}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href={`/restaurants/${order.restaurantId}`}>
                      View Restaurant
                    </Link>
                      </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹50.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
                      <span>Total</span>
                      <span>₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Payment Information</h3>
                    {paymentError ? (
                      <div className="text-red-500 text-sm">
                        Error loading payment information
                      </div>
                    ) : !payment ? (
                      <div className="text-gray-500 text-sm">
                        Payment information not available
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Payment Method</span>
                          <span className="capitalize">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Payment Status</span>
                          <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
                            {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                        {payment.transactionId && (
                          <div className="flex justify-between text-sm">
                            <span>Transaction ID</span>
                            <span className="font-mono text-xs">{payment.transactionId}</span>
                          </div>
                        )}
                        {payment.refundStatus && (
                          <div className="flex justify-between text-sm">
                            <span>Refund Status</span>
                            <Badge variant="outline" className="capitalize">
                              {payment.refundStatus}
                            </Badge>
                          </div>
                        )}
                        {payment.refundReason && (
                          <div className="text-sm mt-2">
                            <span className="font-medium">Refund Reason:</span>
                            <p className="text-gray-600 mt-1">{payment.refundReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {order.status === 'cancelled' && (
                    <div className="bg-red-50 p-4 rounded-md flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Order Cancelled</p>
                        <p className="text-sm text-red-600">
                          This order has been cancelled and cannot be modified.
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="font-medium text-green-800">Order Completed</p>
                      <p className="text-sm text-green-600">
                        This order has been delivered successfully.
                      </p>
                    </div>
                  )}
                  </CardContent>
                <CardFooter>
                  {order.status === 'delivered' && (
                    <Button className="w-full" asChild>
                      <Link href={`/restaurants/${order.restaurantId}`}>
                        Order Again
                      </Link>
                    </Button>
                  )}
                </CardFooter>
                </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}