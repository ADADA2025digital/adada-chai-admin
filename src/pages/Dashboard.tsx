import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Package,
  Printer,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/config/axiosConfig";

interface Category {
  c_id: number;
  category_name: string;
  category_description: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  product_id: number;
  product_name: string;
  c_id: number;
  sku: string;
  supplier_sku: string | null;
  buy_price: string;
  sell_price: string;
  quantity: number;
  specification: string;
  description: string;
  discount_id: number | null;
  product_status: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

interface OrderItem {
  order_item_id: number;
  order_number: string;
  product_id: number;
  quantity: number;
  order_price: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

interface Order {
  o_id: number;
  order_number: string;
  customer_id: number;
  address_id: number;
  order_date: string;
  order_status: string;
  payment_status: string;
  payment_intent_id: string;
  created_at: string;
  updated_at: string;
  customer?: {
    customer_id: number;
    email: string;
    full_name: string;
    ph_number: string;
  };
  address?: any;
  items?: OrderItem[];
  transaction?: any;
}

interface Transaction {
  t_id: number;
  order_number: string;
  invoice_number: string;
  trans_number: string;
  created_at: string;
  updated_at: string;
  view_url: string;
  download_url: string;
  order?: Order;
}

interface Customer {
  customer_id: number;
  email: string;
  full_name: string;
  ph_number: string;
  created_at: string;
  updated_at: string;
  addresses?: any[];
  orders?: Order[];
}

// Helper function to calculate order total
const calculateOrderTotal = (items?: OrderItem[]): number => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const price = parseFloat(item.order_price || "0");
    const quantity = parseInt(item.quantity?.toString() || "0");
    return total + price * quantity;
  }, 0);
};

// Helper function to get order item details for display
const getOrderItemDetails = (items?: OrderItem[]) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { count: 0, firstItem: null, totalItems: 0 };
  }

  const totalItems = items.reduce(
    (sum, item) => sum + parseInt(item.quantity?.toString() || "0"),
    0
  );
  const firstItem = items[0];

  return {
    count: items.length,
    totalItems,
    firstItem,
  };
};

// Helper function to calculate total revenue from all orders
const calculateTotalRevenue = (orders: Order[]): number => {
  return orders.reduce((total, order) => {
    return total + calculateOrderTotal(order.items);
  }, 0);
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [dashboardData, setDashboardData] = useState({
    categories: [] as Category[],
    products: [] as Product[],
    orders: [] as Order[],
    transactions: [] as Transaction[],
    customers: [] as Customer[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoriesRes, productsRes, ordersRes, transactionsRes, customersRes] =
        await Promise.allSettled([
          api.get("/categories"),
          api.get("/products"),
          api.get("/orders"),
          api.get("/transactions"),
          api.get("/customers"),
        ]);

      const extractData = (response: any): any[] => {
        if (response.status === "fulfilled") {
          const responseData = response.value.data;
          if (
            responseData &&
            responseData.status === "success" &&
            Array.isArray(responseData.data)
          ) {
            return responseData.data;
          }
          return [];
        }
        return [];
      };

      const categories = extractData(categoriesRes);
      const products = extractData(productsRes);
      const orders = extractData(ordersRes);
      const transactions = extractData(transactionsRes);
      const customers = extractData(customersRes);

      const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.order_date || a.created_at);
        const dateB = new Date(b.order_date || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

      setDashboardData({
        categories,
        products,
        orders: sortedOrders,
        transactions,
        customers,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = calculateTotalRevenue(dashboardData.orders);
    const totalOrders = dashboardData.orders.length;
    const totalCustomers = dashboardData.customers.length;
    const totalProducts = dashboardData.products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
      newUsers: totalCustomers.toLocaleString(),
      orders: totalOrders.toLocaleString(),
      activeUsers: Math.floor(totalCustomers * 0.6).toLocaleString(),
      totalProducts,
      avgOrderValue: `$${avgOrderValue.toFixed(2)}`,
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "New Users",
      value: stats.newUsers,
      change: "+180.1%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Orders",
      value: stats.orders,
      change: "-19%",
      trend: "down",
      icon: ShoppingCart,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      change: "+201",
      trend: "up",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  function getStatusColor(status: string): string {
    if (!status) return "bg-gray-500";

    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "processing":
      case "proccessing":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "shipped":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  function formatTimeAgo(dateString: string): string {
    if (!dateString) return "recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffMinutes < 1) return "just now";
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    } catch (e) {
      return "recently";
    }
  }

  const recentOrders = dashboardData.orders.slice(0, 5).map((order) => {
    const orderTotal = calculateOrderTotal(order.items);
    const itemDetails = getOrderItemDetails(order.items);

    return {
      id: order.order_number,
      customer: order.customer?.full_name || "Guest User",
      email: order.customer?.email || "guest@example.com",
      amount: `$${orderTotal.toFixed(2)}`,
      status: order.order_status,
      statusColor: getStatusColor(order.order_status),
      itemsCount: order.items?.length || 0,
      totalQuantity: itemDetails.totalItems,
      orderDate: order.order_date || order.created_at,
      itemBreakdown: itemDetails.firstItem
        ? `${itemDetails.firstItem.quantity} × $${parseFloat(
            itemDetails.firstItem.order_price
          ).toFixed(2)}`
        : "",
    };
  });

  const getTopProducts = () => {
    const productSales = new Map<
      number,
      { name: string; quantity: number; revenue: number }
    >();

    dashboardData.orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productId = item.product_id;
          const quantity = parseInt(item.quantity?.toString() || "0");
          const price = parseFloat(item.order_price || "0");
          const revenue = price * quantity;

          if (productSales.has(productId)) {
            const existing = productSales.get(productId)!;
            existing.quantity += quantity;
            existing.revenue += revenue;
          } else {
            productSales.set(productId, {
              name: item.product?.product_name || `Product ${productId}`,
              quantity,
              revenue,
            });
          }
        });
      }
    });

    const sortedProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        sales: data.quantity,
        revenue: `$${data.revenue.toFixed(2)}`,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return sortedProducts.map((product, index) => ({
      ...product,
      trend: ["+12%", "+8%", "-3%", "+15%", "+5%"][index % 5],
      trendUp: index !== 2,
    }));
  };

  const topProducts = getTopProducts();

  const getMonthlyRevenue = () => {
    const monthlyData = new Array(12).fill(0);

    dashboardData.orders.forEach((order) => {
      const orderDate = new Date(order.order_date || order.created_at);
      const month = orderDate.getMonth();
      const orderTotal = calculateOrderTotal(order.items);
      monthlyData[month] += orderTotal;
    });

    const maxRevenue = Math.max(...monthlyData, 1);
    const scaledData = monthlyData.map((value) => (value / maxRevenue) * 100);

    return scaledData;
  };

  const monthlyRevenue = getMonthlyRevenue();

  const recentActivity = dashboardData.orders.slice(0, 5).map((order) => {
    const orderTotal = calculateOrderTotal(order.items);
    const itemDetails = getOrderItemDetails(order.items);

    return {
      user: order.customer?.full_name || "Guest User",
      action: `placed an order with ${itemDetails.totalItems} item(s) (${
        order.items?.length || 0
      } item${order.items?.length !== 1 ? "s" : ""})`,
      time: formatTimeAgo(order.created_at),
      amount: `$${orderTotal.toFixed(2)}`,
    };
  });

  const totalRevenue = calculateTotalRevenue(dashboardData.orders);
  const totalOrders = dashboardData.orders.length;
  const totalCustomers = dashboardData.customers.length;

  const targetRevenue = 75000;
  const targetOrders = 2000;
  const targetCustomers = 3000;

  const handlePrint = useReactToPrint({
    contentRef: dashboardRef,
    documentTitle: `dashboard-${new Date().toISOString().split("T")[0]}`,
    onBeforePrint: async () => {
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 12mm;
      }

      @media print {
        html, body {
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .no-print {
          display: none !important;
        }

        .print\\:block {
          display: block !important;
        }

        .print\\:hidden {
          display: none !important;
        }

        .dashboard-container {
          padding: 0 !important;
        }

        .stats-grid,
        .card,
        table,
        tr,
        td,
        th {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `,
  });

  const handleBrowserPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's an overview of your store performance.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="no-print">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            className="no-print"
          >
            <Download className="mr-2 h-4 w-4" />
            {isPrinting ? "Opening..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Dashboard Content - This will be printed */}
      <div ref={dashboardRef} className="dashboard-container">
        {/* Header for print */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-3xl font-bold">Dashboard Report</h1>
          <p className="text-gray-600 mt-2">
            Generated on: {new Date().toLocaleString()}
          </p>
          <hr className="my-4" />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stats-grid">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}

                  <span
                    className={
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {stat.change}
                  </span>

                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Activity Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
          {/* Revenue Overview Chart */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue performance for the current year
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2 pt-4">
                {monthlyRevenue.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary/80"
                      style={{ height: `${Math.max(value * 2.5, 4)}px` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions and updates from users
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {activity.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">
                            {activity.action}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>

                      {activity.amount && (
                        <Badge variant="outline" className="text-xs">
                          {activity.amount}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] no-print">
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
            </TabsList>

            {/* Print version of tabs header */}
            <div className="hidden print:block mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
            </div>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                      Latest {recentOrders.length} orders from your store
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="no-print">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </CardHeader>

                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {recentOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-xs font-medium">
                                {order.id}
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 no-print">
                                    <AvatarFallback className="text-xs">
                                      {order.customer
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {order.customer}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="text-sm text-muted-foreground">
                                {order.email}
                              </TableCell>

                              <TableCell className="text-sm">
                                {order.itemsCount} item
                                {order.itemsCount !== 1 ? "s" : ""}
                              </TableCell>

                              <TableCell className="text-sm">
                                {order.totalQuantity} unit
                                {order.totalQuantity !== 1 ? "s" : ""}
                              </TableCell>

                              <TableCell className="font-medium">
                                {order.amount}
                              </TableCell>

                              <TableCell>
                                <Badge className={`${order.statusColor} text-white`}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>
                      Best selling products based on order history
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="no-print">
                    <Package className="mr-2 h-4 w-4" />
                    View All Products
                  </Button>
                </CardHeader>

                <CardContent>
                  {topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {topProducts.map((product, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 text-center font-medium text-muted-foreground">
                              #{i + 1}
                            </div>

                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.sales} units sold
                              </p>
                            </div>
                          </div>

                          <div className="w-24 text-right font-medium">
                            {product.revenue}
                          </div>

                          <div className="w-16 text-right no-print">
                            <div
                              className={`flex items-center justify-end gap-1 text-xs ${
                                product.trendUp ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {product.trendUp ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              {product.trend}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No products found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Monthly target achievement</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue Target</span>
                  <span className="font-medium">
                    ${totalRevenue.toFixed(2)} / ${targetRevenue.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={Math.min((totalRevenue / targetRevenue) * 100, 100)}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Target</span>
                  <span className="font-medium">
                    {totalOrders} / {targetOrders}
                  </span>
                </div>
                <Progress
                  value={Math.min((totalOrders / targetOrders) * 100, 100)}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Customer Target</span>
                  <span className="font-medium">
                    {totalCustomers} / {targetCustomers}
                  </span>
                </div>
                <Progress
                  value={Math.min((totalCustomers / targetCustomers) * 100, 100)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">
                    {totalCustomers > 0 ? "89%" : "0%"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customer Satisfaction
                  </p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-xs text-muted-foreground">
                    Avg Response Time
                  </p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold">
                    {dashboardData.orders.filter(
                      (o) => o.order_status?.toLowerCase() === "delivered"
                    ).length > 0
                      ? "98%"
                      : "0%"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    On-time Delivery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer for print */}
        <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
          <hr className="mb-4" />
          <p>Generated from Dashboard | {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}