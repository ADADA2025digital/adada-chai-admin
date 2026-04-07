import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  useCallback,
} from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Printer,
  CreditCard,
  User,
  DollarSign,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Clock3,
  FileText,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";

type OrderItem = {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  order_price: number;
  subtotal: number;
};

type TransactionType = {
  id: number;
  transactionId: string;
  orderId: string;
  invoiceId: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  paidAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentDate: string;
  createdAt: string;
  lastUpdated: string;
  createdAtRaw?: string;
  updatedAtRaw?: string;
  orderTotal: number;
  viewUrl?: string;
  downloadUrl?: string;
  items?: OrderItem[];
};

const calculatePaidAmountFromItems = (apiTransaction: any): number => {
  const order = apiTransaction.order || {};
  const items = order.items || [];

  if (items.length === 0) return 0;

  return items.reduce((sum: number, item: any) => {
    const price = parseFloat(item.order_price || 0);
    const quantity = parseInt(item.quantity || 0);
    return sum + price * quantity;
  }, 0);
};

const mapApiTransactionToUI = (apiTransaction: any): TransactionType => {
  const order = apiTransaction.order || {};
  const customer = order.customer || {};

  const paymentStatus =
    apiTransaction.payment_status || order.payment_status || "pending";

  const totalAmount = calculatePaidAmountFromItems(apiTransaction);

  const isPaid =
    paymentStatus?.toLowerCase() === "paid" ||
    paymentStatus?.toLowerCase() === "completed";

  const paidAmount = isPaid ? totalAmount : 0;

  let paymentDate = "Pending";
  if (apiTransaction.payment_date) {
    paymentDate = new Date(apiTransaction.payment_date).toLocaleDateString();
  } else if (isPaid && apiTransaction.created_at) {
    paymentDate = new Date(apiTransaction.created_at).toLocaleDateString();
  }

  const items = (order.items || []).map((item: any) => ({
    order_item_id: item.order_item_id,
    product_id: item.product_id,
    product_name: item.product?.product_name || "Unknown Product",
    quantity: Number(item.quantity || 0),
    order_price: parseFloat(item.order_price || 0),
    subtotal: parseFloat(item.order_price || 0) * Number(item.quantity || 0),
  }));

  const customerName =
    customer.full_name ||
    apiTransaction.customer_name ||
    order.customer_name ||
    "Unknown";

  const customerEmail =
    customer.email ||
    apiTransaction.customer_email ||
    order.customer_email ||
    "N/A";

  const customerPhone =
    customer.ph_number ||
    apiTransaction.customer_phone ||
    order.customer_phone ||
    "N/A";

  const transactionPrimaryId = Number(apiTransaction.t_id || apiTransaction.id || 0);

  return {
    id: transactionPrimaryId,
    transactionId: apiTransaction.trans_number || "N/A",
    orderId: apiTransaction.order_number || "N/A",
    invoiceId: apiTransaction.invoice_number || "N/A",
    paymentMethod: apiTransaction.payment_method || "Credit Card",
    paymentStatus:
      paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1),
    orderStatus: order.order_status || "order_placed",
    totalAmount,
    paidAmount,
    customerName,
    customerEmail,
    customerPhone,
    paymentDate,
    createdAt: apiTransaction.created_at
      ? new Date(apiTransaction.created_at).toLocaleString()
      : "N/A",
    lastUpdated: apiTransaction.updated_at
      ? new Date(apiTransaction.updated_at).toLocaleString()
      : "N/A",
    createdAtRaw: apiTransaction.created_at || "",
    updatedAtRaw: apiTransaction.updated_at || "",
    orderTotal: totalAmount,
    viewUrl: apiTransaction.view_url,
    downloadUrl: apiTransaction.download_url,
    items,
  };
};

const getPaymentStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "paid":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    case "refunded":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getOrderStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    case "order_placed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "payment_failed":
      return "bg-red-100 text-red-700 border-red-200";
    case "refunded":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>("all");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 15;

  const calculateStats = useCallback((transactionsData: TransactionType[]) => {
    const total = transactionsData.length;

    const revenue = transactionsData
      .filter((item) => {
        const status = item.paymentStatus.toLowerCase();
        return status === "paid" || status === "completed";
      })
      .reduce((sum, item) => sum + item.paidAmount, 0);

    const pending = transactionsData
      .filter((item) => item.paymentStatus.toLowerCase() === "pending")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const completed = transactionsData.filter((item) => {
      const status = item.paymentStatus.toLowerCase();
      return status === "paid" || status === "completed";
    }).length;

    return {
      totalTransactions: total,
      totalRevenue: revenue,
      pendingPayments: pending,
      completedTransactions: completed,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      averageOrderValue: total > 0 ? revenue / total : 0,
    };
  }, []);

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    successRate: 0,
    averageOrderValue: 0,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/transactions");
console.log("API response:", response);
      let apiData: any[] = [];

      if (
        response.data?.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        apiData = response.data.data;
      } else if (Array.isArray(response.data)) {
        apiData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apiData = response.data.data;
      }

      const mappedTransactions = apiData.map(mapApiTransactionToUI);

      // Latest transaction first
      const sortedTransactions = [...mappedTransactions].sort((a, b) => {
        const timeA = a.createdAtRaw ? new Date(a.createdAtRaw).getTime() : 0;
        const timeB = b.createdAtRaw ? new Date(b.createdAtRaw).getTime() : 0;

        if (timeB !== timeA) return timeB - timeA;

        return (b.id || 0) - (a.id || 0);
      });

      const calculatedStats = calculateStats(sortedTransactions);

      setTransactions(sortedTransactions);
      setStats(calculatedStats);
      setLastRefreshTime(new Date());

      return sortedTransactions;
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.message || "Failed to fetch transactions");
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const fetchTransactionDetails = useCallback(async (id: number) => {
    try {
      const response = await api.get(`/transactions/${id}`);

      let apiData = null;

      if (response.data?.status === "success" && response.data.data) {
        apiData = response.data.data;
      } else if (response.data) {
        apiData = response.data;
      }

      if (apiData) {
        const mappedTransaction = mapApiTransactionToUI(apiData);
        setSelectedTransaction(mappedTransaction);
      } else {
        setError("Failed to fetch transaction details");
      }
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setError(
        err.response?.data?.message || "Failed to fetch transaction details",
      );
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDateTime = useCallback((date: Date): string => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((transaction) => {
        return (
          transaction.transactionId.toLowerCase().includes(q) ||
          transaction.orderId.toLowerCase().includes(q) ||
          transaction.invoiceId.toLowerCase().includes(q) ||
          transaction.customerName.toLowerCase().includes(q) ||
          transaction.customerEmail.toLowerCase().includes(q)
        );
      });
    }

    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter(
        (transaction) =>
          transaction.paymentStatus.toLowerCase() ===
          filterPaymentStatus.toLowerCase(),
      );
    }

    if (filterOrderStatus !== "all") {
      filtered = filtered.filter(
        (transaction) =>
          transaction.orderStatus.toLowerCase() ===
          filterOrderStatus.toLowerCase(),
      );
    }

    return filtered;
  }, [transactions, search, filterPaymentStatus, filterOrderStatus]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / transactionsPerPage),
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPaymentStatus, filterOrderStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setSearch("");
    setFilterPaymentStatus("all");
    setFilterOrderStatus("all");
    setCurrentPage(1);
    setIsRefreshing(false);
  }, [fetchTransactions]);

  const handleViewClick = async (transaction: TransactionType) => {
    await fetchTransactionDetails(transaction.id);
    setIsViewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6 p-6">
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

        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-2 text-red-500">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            All Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all payment records, revenue flow, and transaction history.
          </p>

          {lastRefreshTime && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              <h3 className="mt-1 text-2xl font-bold">
                {stats.totalTransactions}
              </h3>
              {stats.successRate > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.successRate.toFixed(1)}% success rate
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="mt-1 text-2xl font-bold">
                $
                {stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              {stats.averageOrderValue > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Avg. ${stats.averageOrderValue.toFixed(2)} per order
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-green-100 p-3">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <h3 className="mt-1 text-2xl font-bold">
                $
                {stats.pendingPayments.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              {stats.pendingPayments > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {
                    transactions.filter(
                      (item) => item.paymentStatus.toLowerCase() === "pending",
                    ).length
                  }{" "}
                  pending orders
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-yellow-100 p-3">
              <Clock3 className="h-5 w-5 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="mt-1 text-2xl font-bold">
                {stats.completedTransactions}
              </h3>
              {stats.totalTransactions > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {(
                    (stats.completedTransactions / stats.totalTransactions) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-blue-100 p-3">
              <CheckCircle className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, customer..."
              className="pl-10"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Payment Status</Label>
          <Select
            value={filterPaymentStatus}
            onValueChange={setFilterPaymentStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Order Status</Label>
          <Select
            value={filterOrderStatus}
            onValueChange={setFilterOrderStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="order_placed">Order Placed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="payment_failed">Payment Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Transaction Listing</CardTitle>
          <CardDescription>
            View all transaction records with payment and order details. Latest
            transactions appear first.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table className="custom-table-header">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">No.</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-center text-sm">
                        {(currentPage - 1) * transactionsPerPage + index + 1}
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {transaction.transactionId}
                        </code>
                      </TableCell>

                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {transaction.orderId}
                        </code>
                      </TableCell>

                      <TableCell>{transaction.invoiceId}</TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentStatusClasses(
                            transaction.paymentStatus,
                          )}`}
                        >
                          {transaction.paymentStatus}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getOrderStatusClasses(
                            transaction.orderStatus,
                          )}`}
                        >
                          {transaction.orderStatus.replace("_", " ")}
                        </span>
                      </TableCell>

                      <TableCell>${transaction.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>${transaction.paidAmount.toFixed(2)}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {transaction.customerName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{transaction.paymentDate}</TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(transaction)}
                            title="View Transaction Details"
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
                      colSpan={11}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="h-8 w-8 opacity-50" />
                        <p>No transactions found</p>
                        {(search ||
                          filterPaymentStatus !== "all" ||
                          filterOrderStatus !== "all") && (
                          <Button
                            variant="link"
                            onClick={handleRefresh}
                            className="text-sm"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * transactionsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * transactionsPerPage,
                    filteredTransactions.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredTransactions.length}
                </span>{" "}
                transactions
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

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  if (
                    totalPages <= 7 ||
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
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
                  } else if (page === currentPage - 2 && currentPage > 3) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  } else if (
                    page === currentPage + 2 &&
                    currentPage < totalPages - 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="modal-scroll max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete payment, order, and customer information.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h3>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.transactionId}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Order ID
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.orderId}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Invoice ID
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.invoiceId}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Payment Method
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.paymentMethod.toUpperCase()}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-sm font-medium">
                        ${selectedTransaction.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Paid Amount
                      </p>
                      <p className="text-sm font-medium">
                        ${selectedTransaction.paidAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Payment Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusClasses(
                          selectedTransaction.paymentStatus,
                        )}`}
                      >
                        {selectedTransaction.paymentStatus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Payment Date
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.paymentDate}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTransaction.items &&
                  selectedTransaction.items.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                        <ShoppingCart className="h-4 w-4" />
                        Order Items
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2 text-left">Product</th>
                              <th className="py-2 text-center">Quantity</th>
                              <th className="py-2 text-right">Unit Price</th>
                              <th className="py-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTransaction.items.map((item) => (
                              <tr key={item.order_item_id} className="border-b">
                                <td className="py-2">{item.product_name}</td>
                                <td className="py-2 text-center">
                                  {item.quantity}
                                </td>
                                <td className="py-2 text-right">
                                  ${item.order_price.toFixed(2)}
                                </td>
                                <td className="py-2 text-right">
                                  ${item.subtotal.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                            <tr className="font-semibold">
                              <td colSpan={3} className="py-2 text-right">
                                Total:
                              </td>
                              <td className="py-2 text-right">
                                ${selectedTransaction.totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h3>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Order Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusClasses(
                          selectedTransaction.orderStatus,
                        )}`}
                      >
                        {selectedTransaction.orderStatus.replace("_", " ")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Order Total
                      </p>
                      <p className="text-sm font-medium">
                        ${selectedTransaction.orderTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Created At
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.createdAt}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Customer Name
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.customerName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.customerEmail}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {selectedTransaction.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedTransaction.viewUrl ||
                selectedTransaction.downloadUrl) && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <FileText className="h-4 w-4" />
                    Invoice Links
                  </h3>

                  <div className="flex gap-4">
                    {selectedTransaction.viewUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={selectedTransaction.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Invoice
                        </a>
                      </Button>
                    )}

                    {selectedTransaction.downloadUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={selectedTransaction.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Download Invoice
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}