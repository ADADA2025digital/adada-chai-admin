import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Search,
  Eye,
  CircleDollarSign,
  PackageCheck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { cva, type VariantProps } from "class-variance-authority";

// Alert Components
const alertVariants = cva(
  [
    "relative flex items-center gap-3",
    "rounded-[6px] border px-4 py-3",
    "text-left transition-all duration-200",
    "bg-white text-zinc-900",
    "dark:bg-[oklch(0.12_0.01_260)] dark:text-white",
    "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:text-current",
  ].join(" "),
  {
    variants: {
      variant: {
        success: "border-emerald-500/50 dark:border-emerald-400/35",
        error: "border-red-500/50 dark:border-red-400/35",
        warning: "border-amber-500/50 dark:border-amber-400/35",
        info: "border-blue-500/50 dark:border-blue-400/35",
        muted: "border-zinc-300 dark:border-white/10",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-[16px] font-semibold leading-none", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-1 text-[14px] leading-[1.35] text-current/75", className)}
      {...props}
    />
  );
}

type AlertState = {
  show: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

function ToastAlert({
  alert,
  onClose,
}: {
  alert: AlertState;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show, onClose]);

  if (!alert.show) return null;

  return (
    <div className="fixed right-3 top-16 z-50 w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
      <Alert variant={alert.type}>
        {alert.type === "success" ? (
          <CheckCircle className="h-5 w-5" />
        ) : alert.type === "error" ? (
          <XCircle className="h-5 w-5" />
        ) : alert.type === "warning" ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Info className="h-5 w-5" />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </div>

        <button
          onClick={onClose}
          className="ml-auto shrink-0 text-current/50 transition-colors hover:text-current"
          aria-label="Close alert"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}

// Type definitions matching your API response
type OrderType = {
  o_id: number;
  order_number: string;
  customer_id: number;
  address_id: number;
  order_date: string;
  order_status: string;
  payment_status: string;
  payment_intent_id: string;
  delivery_charge: string;
  grand_total: string;
  total_weight: string;
  delivery_type: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    customer_id: number;
    full_name: string;
    email: string;
    ph_number: string;
  };
  address?: {
    address_id: number;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items?: Array<{
    order_item_id: number;
    order_number: string;
    product_id: number;
    quantity: number;
    order_price: number;
    product?: {
      product_id: number;
      product_name: string;
      price: number;
    };
  }>;
  transaction?: {
    t_id: number;
    order_number: string;
    invoice_number: string;
    trans_number: string;
  };
};

const getOrderStatusClasses = (status: string) => {
  const normalized = status?.toLowerCase();
  const statusMap: Record<string, string> = {
    delivered: "bg-green-100 text-green-700 border-green-200",
    shipping: "bg-purple-100 text-purple-700 border-purple-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    proccessing: "bg-blue-100 text-blue-700 border-blue-200",
    confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return statusMap[normalized] || "bg-muted text-muted-foreground border-border";
};

const getPaymentStatusClasses = (status: string) => {
  const normalized = status?.toLowerCase();
  const statusMap: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return statusMap[normalized] || "bg-muted text-muted-foreground border-border";
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const ordersPerPage = 15;

  const showAlert = (
    type: AlertState["type"],
    title: string,
    message: string,
  ) => {
    setAlert({
      show: true,
      type,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }));
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/orders");
      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setOrders(response.data.data);
      } else {
        setError("Failed to fetch orders");
        showAlert("error", "Error", "Failed to fetch orders");
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      const message = err.response?.data?.message || "Failed to fetch orders";
      setError(message);
      showAlert("error", "Error", message);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDateTime = useCallback((date: string | Date): string => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  const sortedAndFilteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = orders.filter((order) => {
      return (
        order.o_id.toString().includes(q) ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer?.full_name?.toLowerCase().includes(q) ||
        order.customer?.email?.toLowerCase().includes(q) ||
        order.order_status.toLowerCase().includes(q) ||
        order.payment_status.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.order_date || a.created_at);
      const dateB = new Date(b.order_date || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders, search]);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (item) => item.order_status?.toLowerCase() === "pending",
  ).length;

  const deliveredOrders = orders.filter(
    (item) => item.order_status?.toLowerCase() === "delivered",
  ).length;

  const totalRevenue = orders
    .filter((item) => item.payment_status?.toLowerCase() === "paid")
    .reduce((sum, item) => {
      if (item.grand_total) {
        return sum + parseFloat(item.grand_total);
      }

      const subtotal =
        item.items?.reduce((itemSum, orderItem) => {
          return itemSum + orderItem.order_price * orderItem.quantity;
        }, 0) || 0;

      const deliveryCharge = item.delivery_charge
        ? parseFloat(item.delivery_charge)
        : 0;

      return sum + subtotal + deliveryCharge;
    }, 0);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAndFilteredOrders.length / ordersPerPage),
  );

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return sortedAndFilteredOrders.slice(startIndex, endIndex);
  }, [sortedAndFilteredOrders, currentPage]);

  const getSerialNumber = useCallback(
    (index: number) => {
      return (currentPage - 1) * ordersPerPage + index + 1;
    },
    [currentPage],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setSearch("");
    setCurrentPage(1);
    setLastRefreshTime(new Date());
    setIsRefreshing(false);

    showAlert(
      "success",
      "Refresh Successful",
      "Orders have been refreshed successfully.",
    );
  }, [fetchOrders]);

  const handleViewClick = (order: OrderType) => {
    navigate(`/admin/orders/${order.o_id}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted p-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchOrders}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastAlert alert={alert} onClose={closeAlert} />

      <div className="relative min-w-0 overflow-x-hidden space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
        {/* Header Section */}
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage orders, customer details, payment status, and delivery
              progress.
            </p>

            {lastRefreshTime && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
              </div>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h3 className="mt-1 text-2xl font-bold">{totalOrders}</h3>
              </div>
              <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <h3 className="mt-1 text-2xl font-bold">{pendingOrders}</h3>
              </div>
              <div className="shrink-0 rounded-2xl bg-yellow-100 p-3">
                <Clock3 className="h-5 w-5 text-yellow-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Delivered Orders</p>
                <h3 className="mt-1 text-2xl font-bold">{deliveredOrders}</h3>
              </div>
              <div className="shrink-0 rounded-2xl bg-green-100 p-3">
                <PackageCheck className="h-5 w-5 text-green-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <h3 className="mt-1 break-words text-2xl font-bold">
                  ${totalRevenue.toFixed(2)}
                </h3>
              </div>
              <div className="shrink-0 rounded-2xl bg-emerald-100 p-3">
                <CircleDollarSign className="h-5 w-5 text-emerald-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <CardTitle>Order Listing</CardTitle>
              <CardDescription>
                View and inspect all order records. Most recent orders appear
                first.
              </CardDescription>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, order number, customer..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="min-w-0">
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => {
                  const subtotal =
                    order.items?.reduce((sum, item) => {
                      return sum + item.order_price * item.quantity;
                    }, 0) || 0;

                  const deliveryCharge = order.delivery_charge
                    ? parseFloat(order.delivery_charge)
                    : 0;

                  const totalAmount = subtotal + deliveryCharge;

                  return (
                    <div
                      key={order.o_id}
                      className="min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm"
                    >
                      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            No #{getSerialNumber(index)}
                          </p>
                          <p className="break-words font-medium">
                            {order.order_number}
                          </p>
                          <p className="mt-1 break-words text-xs text-muted-foreground">
                            {formatDateTime(order.order_date)}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(order)}
                            className="h-8 w-8"
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">
                            Customer
                          </p>
                          <p className="mt-1 break-words text-sm font-medium">
                            {order.customer?.full_name || "N/A"}
                          </p>
                          <p className="mt-1 break-words text-xs text-muted-foreground">
                            {order.customer?.email || "N/A"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">
                              Subtotal
                            </p>
                            <p className="mt-1 break-words text-sm font-medium">
                              ${subtotal.toFixed(2)}
                            </p>
                          </div>

                          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">
                              Delivery Charge
                            </p>
                            <p className="mt-1 break-words text-sm font-medium">
                              ${deliveryCharge.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="mt-1 break-words text-sm font-semibold">
                            ${totalAmount.toFixed(2)}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">
                              Order Status
                            </p>
                            <div className="mt-1 min-w-0">
                              <span
                                className={cn(
                                  "inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                                  getOrderStatusClasses(order.order_status),
                                )}
                              >
                                {order.order_status}
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">
                              Payment Status
                            </p>
                            <div className="mt-1 min-w-0">
                              <span
                                className={cn(
                                  "inline-flex max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                                  getPaymentStatusClasses(order.payment_status),
                                )}
                              >
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingCart className="h-8 w-8 opacity-50" />
                    <p>No orders found</p>
                    {search && (
                      <Button
                        variant="link"
                        onClick={() => setSearch("")}
                        className="text-sm"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden min-w-0 overflow-x-auto rounded-xl border md:block">
              <Table className="custom-table-header">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 text-center">No</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Delivery Charge</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => {
                      const subtotal =
                        order.items?.reduce((sum, item) => {
                          return sum + item.order_price * item.quantity;
                        }, 0) || 0;

                      const deliveryCharge = order.delivery_charge
                        ? parseFloat(order.delivery_charge)
                        : 0;

                      const totalAmount = subtotal + deliveryCharge;

                      return (
                        <TableRow key={order.o_id}>
                          <TableCell className="text-center font-mono text-sm">
                            {getSerialNumber(index)}
                          </TableCell>

                          <TableCell>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(order.order_date)}
                            </p>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.customer?.full_name || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.customer?.email || "N/A"}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>${subtotal.toFixed(2)}</TableCell>
                          <TableCell>${deliveryCharge.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            ${totalAmount.toFixed(2)}
                          </TableCell>

                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                                getOrderStatusClasses(order.order_status),
                              )}
                            >
                              {order.order_status}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                                getPaymentStatusClasses(order.payment_status),
                              )}
                            >
                              {order.payment_status}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewClick(order)}
                                title="View Order Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingCart className="h-8 w-8 opacity-50" />
                          <p>No orders found</p>
                          {search && (
                            <Button
                              variant="link"
                              onClick={() => setSearch("")}
                              className="text-sm"
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {sortedAndFilteredOrders.length > 0 && (
              <div className="mt-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="min-w-0 break-words text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ordersPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ordersPerPage,
                      sortedAndFilteredOrders.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {sortedAndFilteredOrders.length}
                  </span>{" "}
                  orders
                </p>

                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                  </Button>

                  <div className="flex min-w-0 flex-wrap items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                      let page = index + 1;

                      if (totalPages > 5 && currentPage > 3) {
                        page = currentPage - 2 + index;
                        if (page > totalPages) return null;
                      }

                      if (page > totalPages) return null;

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-9"
                        >
                          {page}
                        </Button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="min-w-9"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}