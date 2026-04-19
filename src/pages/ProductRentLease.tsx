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

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

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
      className={cn(
        config.color,
        "inline-flex max-w-full items-center gap-1 break-words font-medium",
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="break-words">{config.label}</span>
    </Badge>
  );
};

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
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary/10",
          className || "h-10 w-10",
        )}
      >
        <Package className="h-5 w-5 text-primary" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gray-100",
        className || "h-10 w-10",
      )}
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

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const fetchRentRequests = useCallback(
    async (showLoading = true, showSuccessAlert = false) => {
      try {
        if (showLoading) {
          setLoading((prev) => ({ ...prev, fetching: true }));
        }
        setError(null);

        const response = await api.get("/admin/rent/requests");

        if (response.data.status === "success") {
          let requests: RentRequest[] = [];

          if (
            response.data.data &&
            Array.isArray(response.data.data.rent_requests)
          ) {
            requests = response.data.data.rent_requests;
          } else if (Array.isArray(response.data.data)) {
            requests = response.data.data;
          } else {
            throw new Error("Invalid response format from server");
          }

          setRentRequests(requests);

          if (response.data.statistics) {
            setStatistics(response.data.statistics);
          } else {
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
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
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

  const handleUpdateStatus = useCallback(async () => {
    if (!statusUpdateRequest || !statusUpdateData.rent_status) return;

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

        setStatistics((prevStats) => {
          const oldStatus = statusUpdateRequest.rent_status;
          const newStatus = statusUpdateData.rent_status;

          const updatedStats = { ...prevStats };

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
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update status";
      showAlert("error", errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, updatingStatus: false }));
    }
  }, [statusUpdateRequest, statusUpdateData, showAlert]);

  const handleProcessRefund = useCallback(async () => {
    if (!refundRequest) return;

    setLoading((prev) => ({ ...prev, processingRefund: true }));

    try {
      const response = await api.post(`/admin/rent/${refundRequest.rent_id}/refund`, {
        amount: parseFloat(refundData.amount),
        reason: refundData.reason,
      });

      if (response.data.status === "success") {
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

  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rentRequests;

    return rentRequests.filter((request) => {
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
      <div className="space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <Separator />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <p className="mt-4 text-muted-foreground">
              Loading rent requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 overflow-x-hidden space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      {alert.show && (
        <div className="fixed right-3 top-16 z-[9999] w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
          <Alert variant={alert.type === "success" ? "default" : "destructive"}>
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}

            <div className="flex min-w-0 flex-col">
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      {/* Header Section */}
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold tracking-tight">
            <Package className="h-6 w-6 shrink-0" />
            <span className="break-words">Product Rent & Lease Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all product rental and lease requests.
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", loading.refreshing && "animate-spin")}
            />
            {loading.refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Separator />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words text-sm">{error}</span>
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
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <h3 className="mt-1 text-2xl font-bold">{statistics.total}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="mt-1 text-2xl font-bold text-yellow-600">
                {statistics.pending}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-yellow-100 p-3">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Approved</p>
              <h3 className="mt-1 text-2xl font-bold text-green-600">
                {statistics.approved}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-green-100 p-3">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <h3 className="mt-1 text-2xl font-bold text-red-600">
                {statistics.rejected}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-red-100 p-3">
              <XCircle className="h-5 w-5 text-red-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-600">
                {statistics.cancelled}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-gray-100 p-3">
              <XCircle className="h-5 w-5 text-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="mt-1 text-2xl font-bold text-blue-600">
                {statistics.completed}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-blue-100 p-3">
              <CheckCircle className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rent Requests Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
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

        <CardContent className="min-w-0">
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <div
                  key={request.rent_id}
                  className="min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        ID #{request.rent_id}
                      </p>
                      <p className="break-words font-medium">
                        {request.product?.product_name || "N/A"}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewClick(request)}
                        className="h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatusUpdateClick(request)}
                        title="Update Status"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(request.rent_status === "rejected" ||
                        request.rent_status === "cancelled") &&
                        request.payment_status !== "refunded" &&
                        !request.is_refunded && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRefundClick(request)}
                            title="Process Refund"
                            className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                      <ProductImage
                        product={request.product}
                        className="h-12 w-12 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-medium">
                          {request.product?.product_name || "N/A"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {request.product?.sell_price && (
                            <span className="font-medium text-primary">
                              {formatCurrency(request.product.sell_price)}
                            </span>
                          )}
                          {request.product?.quantity !== undefined && (
                            <span>Qty: {request.product.quantity}</span>
                          )}
                          {request.product?.sku && (
                            <span className="break-all">
                              SKU: {request.product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="mt-1 break-words text-sm font-medium">
                        {request.customer?.full_name || "N/A"}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {request.customer?.email || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {request.customer?.ph_number || "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatCurrency(request.product?.sell_price || 0)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1">
                          <StatusBadge status={request.rent_status} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Request Date
                      </p>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {formatDateTime(request.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
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
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden min-w-0 overflow-x-auto rounded-xl border md:block">
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
                      <TableCell className="text-center font-mono text-sm">
                        {request.rent_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProductImage
                            product={request.product}
                            className="h-12 w-12 rounded-lg"
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-semibold">
                              {request.product?.product_name || "N/A"}
                            </span>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              {request.product?.sell_price && (
                                <span className="text-xs font-medium text-primary">
                                  {formatCurrency(request.product.sell_price)}
                                </span>
                              )}
                              {request.product?.quantity !== undefined && (
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
                          <span className="text-sm text-muted-foreground">—</span>
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
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(request.rent_status === "rejected" ||
                            request.rent_status === "cancelled") &&
                            request.payment_status !== "refunded" &&
                            !request.is_refunded && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRefundClick(request)}
                                title="Process Refund"
                                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
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

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="mt-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="min-w-0 break-words text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * requestsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * requestsPerPage, filteredRequests.length)}
                </span>{" "}
                of <span className="font-medium">{filteredRequests.length}</span>{" "}
                requests
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

      {/* View Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Rent & Lease Request Details</DialogTitle>
            <DialogDescription>
              Complete rental request information.
            </DialogDescription>
          </DialogHeader>

          {viewRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Product Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <Package className="h-4 w-4" />
                    Product Information
                  </h3>
                  <div className="flex flex-col gap-6 md:flex-row">
                    <ProductImage
                      product={viewRequest.product}
                      className="h-32 w-32 rounded-lg"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Product Name
                          </p>
                          <p className="break-words text-lg font-semibold">
                            {viewRequest.product?.product_name || "N/A"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Price
                          </p>
                          <p className="text-base font-bold text-primary">
                            {formatCurrency(viewRequest.product?.sell_price || 0)}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Quantity Available
                          </p>
                          <p className="text-base font-medium">
                            {viewRequest.product?.quantity || "N/A"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            SKU
                          </p>
                          <p className="break-all text-sm font-mono">
                            {viewRequest.product?.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {viewRequest.product?.description && (
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Description
                      </p>
                      <div
                        className="prose prose-sm max-h-48 overflow-y-auto pr-2 dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: viewRequest.product.description,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Customer Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Full Name
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewRequest.customer?.full_name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email Address
                      </p>
                      <p className="flex items-center gap-2 break-all text-sm font-medium">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {viewRequest.customer?.email || "N/A"}
                      </p>
                    </div>
                    {viewRequest.customer?.ph_number && (
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Phone Number
                        </p>
                        <p className="flex items-center gap-2 break-words text-sm font-medium">
                          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {viewRequest.customer.ph_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rental Details Section */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4" />
                  Rental Details
                </h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {formatCurrency(viewRequest.product?.sell_price || 0)}
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Request Date
                    </p>
                    <p className="break-words text-sm font-medium">
                      {formatDateTime(viewRequest.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="break-words text-sm font-medium">
                      {formatDateTime(viewRequest.updated_at)}
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Request Status
                    </p>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={viewRequest.rent_status} />
                    </div>
                  </div>
                </div>

                {(viewRequest.rent_note || viewRequest.query) && (
                  <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    {viewRequest.query && (
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Customer Query
                        </p>
                        <p className="break-words text-sm font-medium text-primary">
                          {viewRequest.query}
                        </p>
                      </div>
                    )}

                    {viewRequest.rent_note && (
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Admin Note
                        </p>
                        <p className="break-words text-sm text-muted-foreground">
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
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-xl">
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

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsStatusUpdateOpen(false);
                    setStatusUpdateRequest(null);
                    setStatusUpdateData({ rent_status: "", rent_note: "" });
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={
                    loading.updatingStatus || !statusUpdateData.rent_status
                  }
                  className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
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
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-2xl">
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
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono font-medium">
                    #{refundRequest.rent_id}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="break-words text-right font-medium">
                    {refundRequest.product?.product_name}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="break-words text-right font-medium">
                    {refundRequest.customer?.full_name}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={refundRequest.rent_status} />
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between gap-3 text-sm">
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
                    onChange={(e) =>
                      setRefundData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum refund amount:{" "}
                  {formatCurrency(refundRequest.product?.sell_price || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund_reason">Refund Reason (Optional)</Label>
                <Textarea
                  id="refund_reason"
                  value={refundData.reason}
                  onChange={(e) =>
                    setRefundData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Reason for refund..."
                  rows={3}
                />
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRefundOpen(false);
                    setRefundRequest(null);
                    setRefundData({ amount: "", reason: "" });
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleProcessRefund}
                  disabled={
                    loading.processingRefund ||
                    !refundData.amount ||
                    parseFloat(refundData.amount) <= 0
                  }
                  className="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto"
                >
                  {loading.processingRefund && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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