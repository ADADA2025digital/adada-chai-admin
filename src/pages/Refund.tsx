// src/pages/refund.tsx
import { useEffect, useMemo, useState, useCallback, type ChangeEvent } from "react";
import { refundData as initialRefundData, type RefundType, type RefundItem } from "../constant/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  RotateCcw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  CreditCard,
  MessageSquare,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusClasses = (status: string) => {
  switch (status) {
    case "refunded":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "refunded":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const formatDate = (dateString: string) => {
  return dateString;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export default function Refund() {
  const [refunds, setRefunds] = useState<RefundType[]>(initialRefundData);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const refundsPerPage = 5;

  const formatDateTime = useCallback((date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  const filteredRefunds = useMemo(() => {
    const q = search.toLowerCase().trim();
    
    if (!q) return refunds;
    
    return refunds.filter((refund) => {
      return (
        refund.id.toString().includes(q) ||
        refund.orderId.toLowerCase().includes(q) ||
        refund.customerName.toLowerCase().includes(q) ||
        refund.status.toLowerCase().includes(q) ||
        refund.reason.toLowerCase().includes(q)
      );
    });
  }, [refunds, search]);

  const totalRefunds = refunds.length;
  const pendingRefunds = refunds.filter(item => item.status === "pending").length;
  const refundedCount = refunds.filter(item => item.status === "refunded").length;
  const rejectedCount = refunds.filter(item => item.status === "rejected").length;
  const totalRefundAmount = refunds
    .filter(item => item.status === "refunded")
    .reduce((sum, item) => sum + item.orderTotal, 0);

  const totalPages = Math.max(1, Math.ceil(filteredRefunds.length / refundsPerPage));

  const paginatedRefunds = useMemo(() => {
    const startIndex = (currentPage - 1) * refundsPerPage;
    const endIndex = startIndex + refundsPerPage;
    return filteredRefunds.slice(startIndex, endIndex);
  }, [filteredRefunds, currentPage]);

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
    await new Promise(resolve => setTimeout(resolve, 800));
    setSearch("");
    setCurrentPage(1);
    setLastRefreshTime(new Date());
    setIsRefreshing(false);
  }, []);

  const handleViewClick = (refund: RefundType) => {
    setSelectedRefund(refund);
    setIsViewOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage refund requests, review details, and update refund status.
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <h3 className="mt-1 text-2xl font-bold">{totalRefunds}</h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="mt-1 text-2xl font-bold">{pendingRefunds}</h3>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-3">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Refunded</p>
              <h3 className="mt-1 text-2xl font-bold">{refundedCount}</h3>
            </div>
            <div className="rounded-2xl bg-green-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Refunded</p>
              <h3 className="mt-1 text-2xl font-bold">{formatCurrency(totalRefundAmount)}</h3>
            </div>
            <div className="rounded-2xl bg-red-100 p-3">
              <DollarSign className="h-5 w-5 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Refund Requests</CardTitle>
            <CardDescription>
              View and manage all refund requests from customers.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer, status..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table  className="custom-table-header" >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Total</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRefunds.length > 0 ? (
                  paginatedRefunds.map((refund) => (
                    <TableRow key={refund.id} className="group">
                      <TableCell className="font-mono text-sm text-center">{refund.id}</TableCell>
                      <TableCell>
                        <p className="font-mono text-sm font-medium">{refund.orderId}</p>
                      </TableCell>
                      <TableCell>{formatCurrency(refund.orderTotal)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="capitalize">{refund.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm">{refund.reason}</p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            refund.status
                          )}`}
                        >
                          {getStatusIcon(refund.status)}
                          <span className="capitalize">{refund.status}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{refund.requestedAt}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{refund.items.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(refund)}
                            title="View Refund Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <RotateCcw className="h-8 w-8 opacity-50" />
                        <p>No refund requests found</p>
                        {search && (
                          <Button
                            variant="link"
                            onClick={handleRefresh}
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
          {filteredRefunds.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * refundsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * refundsPerPage, filteredRefunds.length)}
                </span>{" "}
                of <span className="font-medium">{filteredRefunds.length}</span> refund requests
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

 {/* View Refund Details Modal */}
<Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
  <DialogContent className="max-h-[80vh] sm:max-w-5xl overflow-y-auto">
    {selectedRefund && (
      <>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Refund Request Details</DialogTitle>
            {/* <div className={`flex items-center gap-1 rounded-full border px-4 py-1  ${getStatusClasses(selectedRefund.status)}`}>
              {getStatusIcon(selectedRefund.status)}
              <span className="text-sm font-medium capitalize">{selectedRefund.status}</span>
            </div> */}
          </div>
          <DialogDescription>
            Review the refund request details and order information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information Section */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Order ID
                </p>
                <p className="font-mono text-sm font-medium">
                  {selectedRefund.orderId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Order Date
                </p>
                <p className="text-sm font-medium">
                  {selectedRefund.orderDate}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Order Total
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(selectedRefund.orderTotal)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Customer
                </p>
                <p className="text-sm font-medium">
                  {selectedRefund.customerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedRefund.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Payment Method
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium capitalize">
                    {selectedRefund.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Requested At
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {selectedRefund.requestedAt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Reason Section */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Refund Reason
            </h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm">{selectedRefund.reason}</p>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRefund.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Subtotal:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(selectedRefund.orderTotal)}
                    </TableCell>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>

          {/* Additional Notes Section */}
          {selectedRefund.notes && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Additional Notes
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm">{selectedRefund.notes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}