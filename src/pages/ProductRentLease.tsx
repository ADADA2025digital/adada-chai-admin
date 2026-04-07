import { useEffect, useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  Loader2,
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  Edit,
  ShoppingCart,
  FileText,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Rent Request Interface
interface RentRequest {
  rent_id: number;
  customer_id: number;
  product_id: number;
  query: string;
  rent_note: string | null;
  rent_status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  payment_status?:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "unpaid"
    | "cancelled";
  is_refunded?: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    customer_id: number;
    full_name: string;
    email: string;
    ph_number: string | null;
  };
  product?: {
    product_id: number;
    product_name: string;
    sell_price: string;
    buy_price: string;
    description?: string;
    sku?: string;
    quantity?: number;
    product_status?: string;
    assets?: Array<{
      asset_id: number;
      asset_url: string;
      asset_type: string;
    }>;
    category?: {
      c_id: number;
      category_name: string;
      category_description: string;
    };
  };
}

type LoadingState = {
  fetching: boolean;
  refreshing: boolean;
  updatingStatus: boolean;
  processingRefund: boolean;
};

// Alert interface
interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

// Status badge component
const StatusBadge = ({ status }: { status?: string }) => {
  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
      icon: Clock,
    },
    approved: {
      color: "bg-green-100 text-green-800",
      label: "Approved",
      icon: CheckCircle,
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      label: "Rejected",
      icon: XCircle,
    },
    cancelled: {
      color: "bg-gray-100 text-gray-800",
      label: "Cancelled",
      icon: XCircle,
    },
    completed: {
      color: "bg-blue-100 text-blue-800",
      label: "Completed",
      icon: CheckCircle,
    },
  };

  const config =
    status && statusConfig[status as keyof typeof statusConfig]
      ? statusConfig[status as keyof typeof statusConfig]
      : {
          color: "bg-gray-100 text-gray-800",
          label: status || "Unknown",
          icon: FileText,
        };

  const Icon = config.icon;

  return (
    <Badge
      className={`${config.color} font-medium inline-flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Product Image component
const ProductImage = ({
  product,
  className,
}: {
  product?: RentRequest["product"];
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (!product?.assets || product.assets.length === 0 || imageError) {
      return null;
    }

    let imageUrl = product.assets[0].asset_url;

    if (!imageUrl) {
      return null;
    }

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    if (imageUrl.startsWith("/storage")) {
      imageUrl = `${baseURL}${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      imageUrl = `${baseURL}/${imageUrl}`;
    }

    return imageUrl;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl) {
    return (
      <div
        className={`bg-primary/10 rounded-lg flex items-center justify-center ${className || "h-10 w-10"}`}
      >
        <Package className="h-5 w-5 text-primary" />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-100 ${className || "h-10 w-10"}`}
    >
      <img
        src={imageUrl}
        alt={product?.product_name || "Product"}
        className="h-full w-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function ProductRentLease() {
  const [rentRequests, setRentRequests] = useState<RentRequest[]>([]);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    fetching: true,
    refreshing: false,
    updatingStatus: false,
    processingRefund: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });

  // Alert state
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState<RentRequest | null>(null);
  const [statusUpdateRequest, setStatusUpdateRequest] =
    useState<RentRequest | null>(null);
  const [refundRequest, setRefundRequest] = useState<RentRequest | null>(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    rent_status: "",
    rent_note: "",
  });
  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 15;

  // Show alert function with auto-dismiss
  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  // Fetch all rent requests from API
  const fetchRentRequests = useCallback(
    async (showLoading = true, showSuccessAlert = false) => {
      try {
        if (showLoading) {
          setLoading((prev) => ({ ...prev, fetching: true }));
        }
        setError(null);

        const response = await api.get("/admin/rent/requests");
        console.log("✅ Rent requests API response:", response.data);

        if (response.data.status === "success") {
          let requests: RentRequest[] = [];

          // Handle the response structure from your admin endpoint
          if (
            response.data.data &&
            Array.isArray(response.data.data.rent_requests)
          ) {
            requests = response.data.data.rent_requests;
          } else if (Array.isArray(response.data.data)) {
            requests = response.data.data;
          } else {
            console.error("❌ Unexpected response format:", response.data);
            throw new Error("Invalid response format from server");
          }

          setRentRequests(requests);

          // Set statistics from API response
          if (response.data.statistics) {
            setStatistics(response.data.statistics);
          } else {
            // Calculate statistics if not provided
            setStatistics({
              total: requests.length,
              pending: requests.filter((r) => r.rent_status === "pending")
                .length,
              approved: requests.filter((r) => r.rent_status === "approved")
                .length,
              rejected: requests.filter((r) => r.rent_status === "rejected")
                .length,
              cancelled: requests.filter((r) => r.rent_status === "cancelled")
                .length,
              completed: requests.filter((r) => r.rent_status === "completed")
                .length,
            });
          }

          setLastRefreshTime(new Date());

          if (showSuccessAlert) {
            showAlert("success", "Rent requests refreshed successfully!");
          }
        } else {
          console.error("❌ Invalid response format:", response.data);
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
        console.error("❌ Error fetching rent requests:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch rent requests";

        setError(errorMessage);

        if (showSuccessAlert) {
          showAlert("error", errorMessage);
        }
      } finally {
        if (showLoading) {
          setLoading((prev) => ({ ...prev, fetching: false }));
        }
      }
    },
    [showAlert],
  );

  // Update rent request status (Admin)
  const handleUpdateStatus = useCallback(async () => {
    if (!statusUpdateRequest || !statusUpdateData.rent_status) {
      console.error("❌ No request or status to update");
      return;
    }

    setLoading((prev) => ({ ...prev, updatingStatus: true }));

    try {
      const response = await api.put(
        `/admin/rent/${statusUpdateRequest.rent_id}/status`,
        {
          rent_status: statusUpdateData.rent_status,
          rent_note: statusUpdateData.rent_note,
        },
      );

      if (response.data.status === "success") {
        // Update local state
        setRentRequests((prev) =>
          prev.map((req) =>
            req.rent_id === statusUpdateRequest.rent_id
              ? {
                  ...req,
                  rent_status: statusUpdateData.rent_status as RentRequest["rent_status"],
                  rent_note: statusUpdateData.rent_note,
                  updated_at: new Date().toISOString(),
                }
              : req,
          ),
        );

        // Update statistics
        setStatistics((prevStats) => {
          const oldStatus = statusUpdateRequest.rent_status;
          const newStatus = statusUpdateData.rent_status;

          const updatedStats = { ...prevStats };

          // Decrement old status count
          if (oldStatus === "pending")
            updatedStats.pending = Math.max(0, updatedStats.pending - 1);
          if (oldStatus === "approved")
            updatedStats.approved = Math.max(0, updatedStats.approved - 1);
          if (oldStatus === "rejected")
            updatedStats.rejected = Math.max(0, updatedStats.rejected - 1);
          if (oldStatus === "cancelled")
            updatedStats.cancelled = Math.max(0, updatedStats.cancelled - 1);
          if (oldStatus === "completed")
            updatedStats.completed = Math.max(0, updatedStats.completed - 1);

          // Increment new status count
          if (newStatus === "pending") updatedStats.pending++;
          if (newStatus === "approved") updatedStats.approved++;
          if (newStatus === "rejected") updatedStats.rejected++;
          if (newStatus === "cancelled") updatedStats.cancelled++;
          if (newStatus === "completed") updatedStats.completed++;

          return updatedStats;
        });

        setIsStatusUpdateOpen(false);
        setStatusUpdateRequest(null);
        setStatusUpdateData({ rent_status: "", rent_note: "" });
        showAlert(
          "success",
          `Rent request ${statusUpdateData.rent_status} successfully!`,
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err: any) {
      console.error("❌ Error updating status:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update status";
      showAlert("error", errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, updatingStatus: false }));
    }
  }, [statusUpdateRequest, statusUpdateData, showAlert]);

  // Process refund for rejected/cancelled requests
  const handleProcessRefund = useCallback(async () => {
    if (!refundRequest) return;

    setLoading((prev) => ({ ...prev, processingRefund: true }));

    try {
      const response = await api.post(`/admin/rent/${refundRequest.rent_id}/refund`, {
        amount: parseFloat(refundData.amount),
        reason: refundData.reason,
      });

      if (response.data.status === "success") {
        // Update payment status and refund flag in local state
        setRentRequests((prev) =>
          prev.map((req) =>
            req.rent_id === refundRequest.rent_id
              ? {
                  ...req,
                  payment_status: "refunded" as const,
                  is_refunded: true,
                  updated_at: new Date().toISOString(),
                }
              : req,
          ),
        );

        setIsRefundOpen(false);
        setRefundRequest(null);
        setRefundData({ amount: "", reason: "" });
        showAlert("success", "Refund processed successfully!");
      } else {
        throw new Error("Failed to process refund");
      }
    } catch (err: any) {
      console.error("❌ Error processing refund:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to process refund";
      showAlert("error", errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, processingRefund: false }));
    }
  }, [refundRequest, refundData, showAlert]);

  const formatDateTime = useCallback((date: Date | string): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount || 0);
  };

  // Filter requests based on search
  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rentRequests;

    const filtered = rentRequests.filter((request) => {
      const customerName = request.customer?.full_name?.toLowerCase() || "";
      const customerEmail = request.customer?.email?.toLowerCase() || "";
      const customerPhone = request.customer?.ph_number?.toLowerCase() || "";
      const productName = request.product?.product_name?.toLowerCase() || "";
      const status = request.rent_status?.toLowerCase() || "";
      const query = request.query?.toLowerCase() || "";

      return (
        request.rent_id.toString().includes(q) ||
        customerName.includes(q) ||
        customerEmail.includes(q) ||
        customerPhone.includes(q) ||
        productName.includes(q) ||
        status.includes(q) ||
        query.includes(q)
      );
    });

    return filtered;
  }, [rentRequests, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / requestsPerPage),
  );

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Initial fetch
  useEffect(() => {
    fetchRentRequests(true, false);
  }, [fetchRentRequests]);

  const handleRefresh = useCallback(async () => {
    setLoading((prev) => ({ ...prev, refreshing: true }));
    await fetchRentRequests(false, true);
    setSearch("");
    setCurrentPage(1);
    setLoading((prev) => ({ ...prev, refreshing: false }));
  }, [fetchRentRequests]);

  const handleViewClick = (request: RentRequest) => {
    setViewRequest(request);
    setIsViewOpen(true);
  };

  const handleStatusUpdateClick = (request: RentRequest) => {
    setStatusUpdateRequest(request);
    setStatusUpdateData({
      rent_status: request.rent_status || "pending",
      rent_note: request.rent_note || "",
    });
    setIsStatusUpdateOpen(true);
  };

  const handleRefundClick = (request: RentRequest) => {
    setRefundRequest(request);
    setRefundData({
      amount: request.product?.sell_price || "0",
      reason: "",
    });
    setIsRefundOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading.fetching && rentRequests.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="mt-2 h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <Separator />

        {/* Stats loading skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="mt-1 h-8 w-12 bg-muted animate-pulse rounded" />
                </div>
                <div className="rounded-2xl bg-muted p-3 animate-pulse h-11 w-11" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading rent requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Alert Notification */}
      {alert.show && (
        <div className="fixed top-16 right-4 z-[9999] w-full max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
          <Alert variant={alert.type === "success" ? "default" : "destructive"}>
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

      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Product Rent & Lease Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all product rental and lease requests.
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.refreshing}
          >
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                loading.refreshing && "animate-spin",
              )}
            />
            {loading.refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Separator />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-red-700 hover:text-red-800"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <h3 className="mt-1 text-2xl font-bold">{statistics.total}</h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="mt-1 text-2xl font-bold text-yellow-600">
                {statistics.pending}
              </h3>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-3">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <h3 className="mt-1 text-2xl font-bold text-green-600">
                {statistics.approved}
              </h3>
            </div>
            <div className="rounded-2xl bg-green-100 p-3">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <h3 className="mt-1 text-2xl font-bold text-red-600">
                {statistics.rejected}
              </h3>
            </div>
            <div className="rounded-2xl bg-red-100 p-3">
              <XCircle className="h-5 w-5 text-red-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-600">
                {statistics.cancelled}
              </h3>
            </div>
            <div className="rounded-2xl bg-gray-100 p-3">
              <XCircle className="h-5 w-5 text-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="mt-1 text-2xl font-bold text-blue-600">
                {statistics.completed}
              </h3>
            </div>
            <div className="rounded-2xl bg-blue-100 p-3">
              <CheckCircle className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rent Requests Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Rent & Lease Requests</CardTitle>
            <CardDescription>
              View and manage all product rental and lease requests.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer, product, or status..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.rent_id} className="group">
                      <TableCell className="font-mono text-sm text-center">
                        {request.rent_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProductImage
                            product={request.product}
                            className="h-12 w-12 rounded-lg"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {request.product?.product_name || "N/A"}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              {request.product?.sell_price && (
                                <span className="text-xs font-medium text-primary">
                                  {formatCurrency(request.product.sell_price)}
                                </span>
                              )}
                              {request.product?.quantity && (
                                <span className="text-xs text-muted-foreground">
                                  Qty: {request.product.quantity}
                                </span>
                              )}
                              {request.product?.sku && (
                                <span className="text-xs text-muted-foreground">
                                  SKU: {request.product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.customer?.full_name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.customer?.ph_number ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {request.customer.ph_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(request.product?.sell_price || 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.rent_status} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(request)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdateClick(request)}
                            title="Update Status"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* Refund button - only for rejected or cancelled statuses that haven't been refunded yet */}
                          {(request.rent_status === "rejected" || request.rent_status === "cancelled") && 
                           request.payment_status !== "refunded" && 
                           !request.is_refunded && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRefundClick(request)}
                              title="Process Refund"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 opacity-50" />
                        <p>No rent/lease requests found</p>
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

          {filteredRequests.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * requestsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * requestsPerPage,
                    filteredRequests.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredRequests.length}</span>{" "}
                requests
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
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
                    <span className="px-2">...</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="modal-scroll max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Rent & Lease Request Details</DialogTitle>
            <DialogDescription>
              Complete rental request information.
            </DialogDescription>
          </DialogHeader>

          {viewRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product Information
                  </h3>
                  <div className="flex gap-6">
                    <ProductImage
                      product={viewRequest.product}
                      className="h-32 w-32 rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Product Name
                          </p>
                          <p className="text-lg font-semibold">
                            {viewRequest.product?.product_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Price
                          </p>
                          <p className="text-base font-bold text-primary">
                            {formatCurrency(
                              viewRequest.product?.sell_price || 0,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Quantity Available
                          </p>
                          <p className="text-base font-medium">
                            {viewRequest.product?.quantity || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            SKU
                          </p>
                          <p className="text-sm font-mono">
                            {viewRequest.product?.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {viewRequest.product?.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </p>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto max-h-48 pr-2"
                        style={{ maxHeight: "150px" }}
                        dangerouslySetInnerHTML={{
                          __html: viewRequest.product.description,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Customer Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Full Name
                      </p>
                      <p className="text-sm font-medium">
                        {viewRequest.customer?.full_name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Email Address
                      </p>
                      <p className="text-sm font-medium flex items-center gap-2 break-all">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        {viewRequest.customer?.email || "N/A"}
                      </p>
                    </div>
                    {viewRequest.customer?.ph_number && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Phone Number
                        </p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {viewRequest.customer.ph_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rental Details Section */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rental Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {formatCurrency(viewRequest.product?.sell_price || 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Request Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime(viewRequest.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime(viewRequest.updated_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Request Status
                    </p>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={viewRequest.rent_status} />
                    </div>
                  </div>
                </div>

                {(viewRequest.rent_note || viewRequest.query) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                    {viewRequest.query && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Customer Query
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {viewRequest.query}
                        </p>
                      </div>
                    )}

                    {viewRequest.rent_note && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Admin Note
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {viewRequest.rent_note}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Update Request Status
            </DialogTitle>
            <DialogDescription>
              Update the status of this rent/lease request.
            </DialogDescription>
          </DialogHeader>

          {statusUpdateRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rent_status">Status</Label>
                <Select
                  value={statusUpdateData.rent_status}
                  onValueChange={(value) =>
                    setStatusUpdateData((prev) => ({
                      ...prev,
                      rent_status: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent_note">Note (Optional)</Label>
                <Textarea
                  id="rent_note"
                  value={statusUpdateData.rent_note}
                  onChange={(e) =>
                    setStatusUpdateData((prev) => ({
                      ...prev,
                      rent_note: e.target.value,
                    }))
                  }
                  placeholder="Add a note about this status update..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsStatusUpdateOpen(false);
                    setStatusUpdateRequest(null);
                    setStatusUpdateData({ rent_status: "", rent_note: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={
                    loading.updatingStatus || !statusUpdateData.rent_status
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading.updatingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Process Refund
            </DialogTitle>
            <DialogDescription>
              Process a refund for this cancelled/rejected rental request.
            </DialogDescription>
          </DialogHeader>

          {refundRequest && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono font-medium">#{refundRequest.rent_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{refundRequest.product?.product_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{refundRequest.customer?.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={refundRequest.rent_status} />
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Amount:</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(refundRequest.product?.sell_price || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund_amount">Refund Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="refund_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={parseFloat(refundRequest.product?.sell_price || "0")}
                    value={refundData.amount}
                    onChange={(e) => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum refund amount: {formatCurrency(refundRequest.product?.sell_price || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund_reason">Refund Reason (Optional)</Label>
                <Textarea
                  id="refund_reason"
                  value={refundData.reason}
                  onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for refund..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRefundOpen(false);
                    setRefundRequest(null);
                    setRefundData({ amount: "", reason: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleProcessRefund}
                  disabled={loading.processingRefund || !refundData.amount || parseFloat(refundData.amount) <= 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading.processingRefund && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Process Refund
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}