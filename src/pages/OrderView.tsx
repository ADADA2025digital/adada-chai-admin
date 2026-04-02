import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  PackageCheck,
  ReceiptText,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Check,
  Loader2,
} from "lucide-react";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type OrderType = {
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
    quantity: number | string;
    order_price: number | string;
    product?: {
      product_id: number;
      product_name: string;
      price: number;
      assets?: Array<{
        asset_id: number;
        asset_type: string;
        asset_url: string;
      }>;
    };
  }>;
  transaction?: {
    t_id: number;
    order_number: string;
    invoice_number: string;
    trans_number: string;
  };
};

type TransformedOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  items: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  trackingStatus?: string;
  orderItems: Array<{
    id: number;
    productId: number;
    productName: string;
    image: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
};

type AlertType = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

// Refund Modal Component
const RefundModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onRefundSuccess,
  showAlert 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  order: TransformedOrder; 
  onRefundSuccess: () => void;
  showAlert: (type: "success" | "error", message: string) => void;
}) => {
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setRefundAmount("");
    setReason("");
    setIsSubmitting(false);
  };

  const handleRefund = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {};
      
      if (refundAmount && parseFloat(refundAmount) > 0) {
        const amount = parseFloat(refundAmount);
        if (amount > order.totalAmount) {
          showAlert("error", `Refund amount cannot exceed $${order.totalAmount.toFixed(2)}`);
          setIsSubmitting(false);
          return;
        }
        payload.amount = amount;
      }
      
      if (reason) {
        payload.reason = reason;
      }

      const response = await api.post(`/orders/${order.id}/refund`, payload);

      if (response.data.status === "success") {
        showAlert("success", "Refund processed successfully");
        onRefundSuccess();
        onClose();
        resetForm();
      } else {
        showAlert("error", response.data.message || "Failed to process refund");
      }
    } catch (error: any) {
      console.error("Refund failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to process refund";
      showAlert("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Refund - Order #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Refund will be processed to the original payment method. 
            The refund amount cannot exceed the order total of ${order.totalAmount.toFixed(2)}.
            {order.paymentStatus === 'paid' && ' This order is eligible for refund.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="refundAmount">
              Refund Amount <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0.01"
                max={order.totalAmount}
                placeholder={order.totalAmount.toFixed(2)}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty for full refund (Max: ${order.totalAmount.toFixed(2)})
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">
              Refund Reason <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a reason</option>
              <option value="customer_request">Customer Request</option>
              <option value="duplicate">Duplicate Order</option>
              <option value="fraudulent">Fraudulent Order</option>
              <option value="product_unavailable">Product Unavailable</option>
            </select>
          </div>

          {refundAmount && parseFloat(refundAmount) > 0 && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Partial refund of ${parseFloat(refundAmount).toFixed(2)} will be processed.
                The customer will be refunded this amount to their original payment method.
              </p>
            </div>
          )}

          {!refundAmount && (
            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Full refund of ${order.totalAmount.toFixed(2)} will be processed.
                The entire order amount will be refunded to the customer.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRefund} 
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const normalizeStatus = (status: string) => status?.toLowerCase()?.trim() || "";

const getSelectSafeStatus = (status: string) => {
  const normalized = normalizeStatus(status);

  if (normalized === "proccessing") return "processing";
  if (normalized === "shipped") return "shipping";

  return normalized;
};

const getOrderStatusClasses = (status: string) => {
  const normalized = normalizeStatus(status);

  const statusMap: Record<string, string> = {
    delivered: "bg-green-100 text-green-700 border-green-200",
    shipping: "bg-purple-100 text-purple-700 border-purple-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    proccessing: "bg-blue-100 text-blue-700 border-blue-200",
    confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    statusMap[normalized] || "bg-muted text-muted-foreground border-border"
  );
};

const getPaymentStatusClasses = (status: string) => {
  const normalized = normalizeStatus(status);

  const statusMap: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    statusMap[normalized] || "bg-muted text-muted-foreground border-border"
  );
};

const formatStatusLabel = (status: string) => {
  const normalized = normalizeStatus(status);

  const labels: Record<string, string> = {
    delivered: "Delivered",
    shipping: "Shipping",
    shipped: "Shipped",
    processing: "Processing",
    proccessing: "Processing",
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };

  return labels[normalized] || status;
};

// Helper function to get product image URL
const getProductImageUrl = (product: any): string => {
  if (!product?.assets || product.assets.length === 0) {
    return "/placeholder-image.jpg";
  }

  const imageAsset = product.assets.find(
    (asset: any) => asset.asset_type === "image",
  );

  if (!imageAsset) {
    return "/placeholder-image.jpg";
  }

  let imageUrl = imageAsset.asset_url;

  // Add base URL if it's a relative path
  if (imageUrl.startsWith("/storage/") || imageUrl.startsWith("/")) {
    // Get the base URL from your API config or environment variable
    const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    imageUrl = `${baseURL}${imageUrl}`;
  }

  return imageUrl;
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex items-start gap-3 border-b py-2 last:border-0">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 break-words text-sm font-medium">{value}</div>
      </div>
    </div>
  );
};

export default function OrderView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [alert, setAlert] = useState<AlertType>({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await api.get(`/orders/${id}`);

        if (response.data.status === "success") {
          setOrderData(response.data.data);
          if (isRefresh) {
            showAlert("success", "Order details refreshed successfully");
          }
        } else {
          const errorMsg = "Failed to fetch order";
          setError(errorMsg);
          showAlert("error", errorMsg);
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to fetch order";
        setError(errorMessage);
        showAlert("error", errorMessage);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [id],
  );

  const order = useMemo<TransformedOrder | null>(() => {
    if (!orderData) return null;

    const totalAmount =
      orderData.items?.reduce((sum, item) => {
        const price =
          typeof item.order_price === "string"
            ? parseFloat(item.order_price)
            : item.order_price;

        const quantity =
          typeof item.quantity === "string"
            ? parseInt(item.quantity, 10)
            : item.quantity;

        return sum + price * quantity;
      }, 0) || 0;

    const shippingAddress = orderData.address
      ? {
          address: [
            orderData.address.address_line1,
            orderData.address.address_line2,
          ]
            .filter(Boolean)
            .join(", "),
          suburb: orderData.address.city,
          state: orderData.address.state,
          postcode: orderData.address.postal_code,
        }
      : {
          address: "",
          suburb: "",
          state: "",
          postcode: "",
        };

    const orderItems =
      orderData.items?.map((item) => {
        const unitPrice =
          typeof item.order_price === "string"
            ? parseFloat(item.order_price)
            : item.order_price;

        const quantity =
          typeof item.quantity === "string"
            ? parseInt(item.quantity, 10)
            : item.quantity;

        // Get the image URL using the helper function
        const imageUrl = getProductImageUrl(item.product);

        return {
          id: item.order_item_id,
          productId: item.product_id,
          productName:
            item.product?.product_name || `Product ${item.product_id}`,
          image: imageUrl,
          unitPrice,
          quantity,
          total: unitPrice * quantity,
        };
      }) || [];

    return {
      id: orderData.o_id,
      orderNumber: orderData.order_number,
      customerName: orderData.customer?.full_name || "N/A",
      email: orderData.customer?.email || "N/A",
      phone: orderData.customer?.ph_number || "N/A",
      date: new Date(orderData.order_date).toLocaleDateString(),
      items: orderData.items?.length || 0,
      totalAmount,
      paymentMethod: "Card",
      paymentStatus: orderData.payment_status || "pending",
      orderStatus: orderData.order_status || "pending",
      shippingAddress,
      trackingStatus:
        normalizeStatus(orderData.order_status) === "shipping"
          ? "In Transit"
          : undefined,
      orderItems,
    };
  }, [orderData]);

  const handleStatusChange = (value: string) => {
    setNewStatus(value);

    if (order) {
      const currentStatus = getSelectSafeStatus(order.orderStatus);
      setStatusChanged(
        normalizeStatus(value) !== normalizeStatus(currentStatus),
      );
    }
  };

  const handleCancelStatusChange = () => {
    if (!order) return;
    setNewStatus(getSelectSafeStatus(order.orderStatus));
    setStatusChanged(false);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !orderData || !statusChanged) return;

    try {
      setUpdatingStatus(true);

      let backendStatus = newStatus.toLowerCase();

      if (backendStatus === "processing") {
        backendStatus = "proccessing";
      }

      const response = await api.put(`/orders/${orderData.o_id}/status`, {
        order_status: backendStatus,
      });

      if (response.data.status === "success") {
        await fetchOrder();
        setStatusChanged(false);
        showAlert(
          "success",
          `Order status updated to ${formatStatusLabel(newStatus)}`,
        );
      } else {
        showAlert("error", "Failed to update order status");
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update order status";
      showAlert("error", errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefresh = () => {
    fetchOrder(true);
  };

  const handleRefundSuccess = () => {
    fetchOrder(true);
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order && !statusChanged) {
      setNewStatus(getSelectSafeStatus(order.orderStatus));
    }
  }, [order, statusChanged]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 p-6">
        {alert.show && (
          <div className="fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
            <Alert variant={alert.type}>
              {alert.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div className="flex flex-col">
                <AlertTitle>
                  {alert.type === "success" ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              {error || "The requested order record could not be found."}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>

        <Separator />

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="rounded-2xl bg-muted p-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Order not found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This order may have been removed or the link is incorrect.
              </p>
            </div>

            <Button onClick={() => navigate("/admin/orders")}>
              Go to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {alert.show && (
        <div className="fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
          <Alert variant={alert.type}>
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <div className="flex flex-col">
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Review customer, payment, shipping, and order status information.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order ID
              </p>
              <p className="text-xl font-bold">{order.orderNumber}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ReceiptText className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order Date
              </p>
              <p className="text-sm font-bold">{order.date}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Amount
              </p>
              <p className="text-xl font-bold">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </p>
              <p className="text-xl font-bold">{order.items}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <ReceiptText className="h-4 w-4" />
              Order Summary
            </h3>

            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-3">
              <InfoRow
                icon={<ReceiptText className="h-4 w-4" />}
                label="Order ID"
                value={order.orderNumber}
              />

              <InfoRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Order Date"
                value={order.date}
              />

              <div className="flex items-start gap-3 border-b py-2 last:border-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order Status
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusClasses(
                      order.orderStatus,
                    )}`}
                  >
                    {formatStatusLabel(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-b py-2 last:border-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment Status
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusClasses(
                      order.paymentStatus,
                    )}`}
                  >
                    {formatStatusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>

              <InfoRow
                icon={<CreditCard className="h-4 w-4" />}
                label="Payment Method"
                value={order.paymentMethod}
              />

              <InfoRow
                icon={<PackageCheck className="h-4 w-4" />}
                label="Total Amount"
                value={`$${order.totalAmount.toFixed(2)}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <PackageCheck className="h-4 w-4" />
              Status Overview
            </h3>

            <div className="space-y-6">
              {/* ROW 1 - Order Status, Payment Status, Order Value */}
              <div className="grid grid-cols-3 gap-4">
                {/* Order Status */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order Status
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusClasses(order.orderStatus)}`}
                  >
                    {formatStatusLabel(order.orderStatus)}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment Status
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusClasses(order.paymentStatus)}`}
                  >
                    {formatStatusLabel(order.paymentStatus)}
                  </span>
                </div>

                {/* Order Value */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* <Separator /> */}

              {/* ROW 2 - Update Order Status & Refund in ONE ROW */}
              <div className="grid grid-cols-2 gap-2">
                {/* Update Order Status Section */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Update Order Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Select
                        value={newStatus}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "pending",
                            "confirmed",
                            "processing",
                            "shipping",
                            "delivered",
                            "cancelled",
                          ].map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {statusChanged && (
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          size="icon"
                          onClick={handleStatusUpdate}
                          disabled={updatingStatus}
                        >
                          {updatingStatus ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handleCancelStatusChange}
                          disabled={updatingStatus}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Refund Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Process Refund
                    </p>
                    {order.paymentStatus === 'refunded' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Refunded
                      </span>
                    )}
                  </div>

                  {/* Refund Button - Only for paid orders not refunded */}
                  {order.paymentStatus === 'paid' && (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowRefundModal(true)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Process Refund
                    </Button>
                  )}

                  {/* Refund Info for refunded orders */}
                  {order.paymentStatus === 'refunded' && (
                    <div className="rounded-md bg-muted p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Refund processed successfully
                      </p>
                    </div>
                  )}

                  {/* Message for non-refundable orders */}
                  {order.paymentStatus !== 'paid' && order.paymentStatus !== 'refunded' && (
                    <div className="rounded-md bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">
                        Cannot refund - Payment status: {formatStatusLabel(order.paymentStatus)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <User className="h-4 w-4" />
          Customer Details
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {order.customerName}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {order.email}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {order.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Shipping Address
                </p>
                <div className="mt-1 break-words text-sm font-semibold">
                  <p>
                    {order.shippingAddress.address &&
                    order.shippingAddress.suburb &&
                    order.shippingAddress.state
                      ? `${order.shippingAddress.address}, ${order.shippingAddress.suburb}, ${order.shippingAddress.state} ${order.shippingAddress.postcode}`
                      : order.shippingAddress.address ||
                        order.shippingAddress.suburb ||
                        order.shippingAddress.state ||
                        order.shippingAddress.postcode ||
                        "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="h-4 w-4" />
          Order Items
        </h3>

        <div className="overflow-x-auto rounded-xl border">
          <Table className="custom-table-header">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.productName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No order items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        order={order}
        onRefundSuccess={handleRefundSuccess}
        showAlert={showAlert}
      />
    </div>
  );
}