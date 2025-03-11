'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icons } from '@/components/ui/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsDashboardProps {
  data: {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    activeOrders: number;
    revenueData?: {
      date: string;
      revenue: number;
    }[];
    orderData?: {
      date: string;
      orders: number;
    }[];
  };
  isLoading?: boolean;
}

const dummyRevenueData = [
  { date: '2024-01', revenue: 4000 },
  { date: '2024-02', revenue: 3000 },
  { date: '2024-03', revenue: 2000 },
  { date: '2024-04', revenue: 2780 },
  { date: '2024-05', revenue: 1890 },
  { date: '2024-06', revenue: 2390 },
];

const dummyOrderData = [
  { date: '2024-01', orders: 40 },
  { date: '2024-02', orders: 30 },
  { date: '2024-03', orders: 20 },
  { date: '2024-04', orders: 27 },
  { date: '2024-05', orders: 18 },
  { date: '2024-06', orders: 23 },
];

export function AnalyticsDashboard({
  data,
  isLoading,
}: AnalyticsDashboardProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const revenueData = data.revenueData || dummyRevenueData;
  const orderData = data.orderData || dummyOrderData;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (MTD)
            </CardTitle>
            <Icons.dollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders (MTD)</CardTitle>
            <Icons.order className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Icons.star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Based on 50 reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              2 pending acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8A2BE2"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle>Order Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#8A2BE2"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Popular Items (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Butter Chicken</span>
                <span className="font-medium">45 orders</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biryani</span>
                <span className="font-medium">38 orders</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dal Makhani</span>
                <span className="font-medium">32 orders</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>12:00 PM - 2:00 PM</span>
                <span className="font-medium">32% orders</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>7:00 PM - 9:00 PM</span>
                <span className="font-medium">45% orders</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>9:00 PM - 11:00 PM</span>
                <span className="font-medium">23% orders</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>5 Stars</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>4 Stars</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>3 Stars or below</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 