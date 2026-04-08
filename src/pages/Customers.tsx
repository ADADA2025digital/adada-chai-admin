import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  useCallback,
} from "react";
import {
  formatCurrency,
  formatDate,
  type Customer,
  type Order,
} from "../constant/data";
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
  Users,
  Search,
  Eye,
  MapPin,
  ShoppingBag,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  XCircle,
  Repeat,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type LoadingState = {
  fetching: boolean;
  refreshing: boolean;
  adding: boolean;
};

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

interface RentRequest {
  rent_id: number;
  customer_id: number;
  product_id: number;
  query: string;
  rent_note: string;
  rent_status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
  product: {
    product_id: number;
    product_name: string;
    sku: string;
    sell_price: string;
    buy_price: string;
    description: string;
    specification: string;
    quantity: number;
    product_status: string;
    assets: Array<{
      asset_id: number;
      asset_type: string;
      asset_url: string;
    }>;
    category: {
      c_id: number;
      category_name: string;
    };
  };
}

const transformCustomerData = (apiCustomer: any): Customer => {
  const primaryAddress = apiCustomer.addresses?.[0] || {
    address_line1: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  };

  const orders: Order[] =
    apiCustomer.orders?.map((order: any) => {
      const orderTotal =
        order.items?.reduce((sum: number, item: any) => {
          const itemPrice = parseFloat(item.order_price || 0);
          const quantity = item.quantity || 1;
          const itemTotal = itemPrice * quantity;
          return sum + itemTotal;
        }, 0) || 0;

      const items =
        order.items?.map((item: any) => ({
          productName: item.product?.product_name || "Product",
          quantity: item.quantity,
          price: parseFloat(item.order_price || 0),
        })) || [];

      return {
        id: order.o_id || order.id,
        orderNumber: order.order_number || `#${order.id}`,
        date: order.order_date || order.created_at || order.date,
        status: order.order_status || "Processing",
        total: orderTotal,
        items: items,
        transaction: order.transaction,
      };
    }) || [];

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const nameParts = apiCustomer.full_name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: apiCustomer.customer_id || apiCustomer.id,
    firstName,
    lastName,
    email: apiCustomer.email || "",
    phone: apiCustomer.ph_number || apiCustomer.phone || "",
    createdAt:
      apiCustomer.created_at ||
      apiCustomer.createdAt ||
      new Date().toISOString(),
    status: "Active",
    address: {
      street: primaryAddress.address_line1 || "",
      city: primaryAddress.city || "",
      state: primaryAddress.state || "",
      country: primaryAddress.country || "",
      zipCode: primaryAddress.postal_code || "",
    },
    totalSpent,
    notes: apiCustomer.notes || "",
    orders,
  };
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  notes: string;
};

const emptyForm: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  notes: "",
};

const getStatusClasses = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border-green-200";
    case "Inactive":
      return "bg-red-100 text-red-700 border-red-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getOrderStatusClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getRentStatusClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "completed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const formatDateOnly = (dateString: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFullImageUrl = (assetUrl: string): string => {
  if (!assetUrl) return "";
  if (assetUrl.startsWith("http")) return assetUrl;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${baseUrl}${assetUrl}`;
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    fetching: true,
    refreshing: false,
    adding: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number>(0);

  const [rentRequests, setRentRequests] = useState<RentRequest[]>([]);
  const [rentRequestsLoading, setRentRequestsLoading] =
    useState<boolean>(false);

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CustomerForm>(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 15;

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const fetchTotalCustomersCount = useCallback(async () => {
    try {
      const response = await api.get("/customers");
      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        const count = response.data.data.length;
        setTotalCustomersCount(count);
        return count;
      }
      return 0;
    } catch (err: any) {
      console.error("❌ Error fetching total customers count:", err);
      return 0;
    }
  }, []);

  const fetchCustomers = useCallback(
    async (showLoading = true, showSuccessAlert = false) => {
      try {
        if (showLoading) {
          setLoading((prev) => ({ ...prev, fetching: true }));
        }
        setError(null);

        const response = await api.get("/customers");

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          const transformedCustomers = response.data.data.map(
            (customer: any) => transformCustomerData(customer),
          );

          setCustomers(transformedCustomers);
          setLastRefreshTime(new Date());
          setTotalCustomersCount(transformedCustomers.length);

          if (showSuccessAlert) {
            showAlert("success", "Customers refreshed successfully!");
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
        console.error("❌ Error fetching customers:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch customers";
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

  const fetchCustomerDetails = useCallback(
    async (customerId: number): Promise<Customer | null> => {
      try {
        const response = await api.get(`/customers/${customerId}`);

        if (response.data.status === "success" && response.data.data) {
          return transformCustomerData(response.data.data);
        }
        return null;
      } catch (err: any) {
        console.error(`❌ Error fetching customer ${customerId}:`, err);
        setError(
          err.response?.data?.message || "Failed to fetch customer details",
        );
        return null;
      }
    },
    [],
  );

  const fetchRentRequests = useCallback(async (email: string) => {
    if (!email) return [];

    setRentRequestsLoading(true);
    try {
      const response = await api.get("/rent/customer-requests", {
        params: { email },
      });

      if (response.data.status === "success" && response.data.data) {
        const requests = response.data.data.rent_requests || [];
        setRentRequests(requests);
        return requests;
      } else {
        setRentRequests([]);
        return [];
      }
    } catch (err: any) {
      console.error("❌ Error fetching rent requests:", err);
      setRentRequests([]);
      return [];
    } finally {
      setRentRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(true, false);
    fetchTotalCustomersCount();
  }, [fetchCustomers, fetchTotalCustomersCount]);

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

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return customers;

    return customers.filter((customer) => {
      return (
        customer.id.toString().includes(q) ||
        customer.firstName.toLowerCase().includes(q) ||
        customer.lastName.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  const repeatCustomers = useMemo(() => {
    return customers.filter((customer) => customer.orders.length > 1);
  }, [customers]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / customersPerPage),
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
  };

  const handleRefresh = useCallback(async () => {
    setLoading((prev) => ({ ...prev, refreshing: true }));
    await fetchCustomers(false, true);
    await fetchTotalCustomersCount();
    setSearch("");
    setCurrentPage(1);
    setLoading((prev) => ({ ...prev, refreshing: false }));
  }, [fetchCustomers, fetchTotalCustomersCount]);

  const handleAddCustomer = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showAlert("error", "Please fill in all required fields");
      return;
    }

    setLoading((prev) => ({ ...prev, adding: true }));

    try {
      const customerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          country: formData.address.country,
          zip_code: formData.address.zipCode,
        },
      };

      const response = await api.post("/customers", customerData);

      if (response.data.status === "success") {
        showAlert("success", "Customer added successfully!");
        await fetchCustomers(false, false);
        await fetchTotalCustomersCount();
        resetForm();
        setIsAddOpen(false);
        setCurrentPage(1);
      } else {
        throw new Error("Failed to add customer");
      }
    } catch (err: any) {
      console.error("❌ Error adding customer:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add customer";
      showAlert("error", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleViewClick = async (customer: Customer) => {
    setViewCustomer(customer);
    setIsViewOpen(true);
    setRentRequests([]);

    const detailedCustomer = await fetchCustomerDetails(customer.id);

    if (detailedCustomer) {
      setViewCustomer(detailedCustomer);
      await fetchRentRequests(detailedCustomer.email);
    } else {
      await fetchRentRequests(customer.email);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const CustomerFormFields = () => (
    <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-1 py-2">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Address Information</h3>
        <div className="grid gap-2">
          <Label htmlFor="address.street">Street Address</Label>
          <Input
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={handleInputChange}
            placeholder="Enter street address"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address.state">State</Label>
            <Input
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              placeholder="Enter state"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="address.country">Country</Label>
            <Input
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              placeholder="Enter country"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address.zipCode">ZIP Code</Label>
            <Input
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter customer notes"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );

  if (loading.fetching && customers.length === 0) {
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
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 overflow-x-hidden space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      {/* Alert Notification */}
      {alert.show && (
        <div className="fixed right-3 top-16 z-[9999] w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
          <Alert variant={alert.type}>
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

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">All Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer records, contact details, and order history.
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
            disabled={loading.refreshing}
            className="w-full sm:w-auto"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <h3 className="mt-1 text-2xl font-bold">{totalCustomersCount}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Repeat Customers</p>
              <h3 className="mt-1 text-2xl font-bold">
                {repeatCustomers.length}
              </h3>
              {customers.length > 0 && (
                <p className="mt-1 break-words text-xs text-muted-foreground">
                  {((repeatCustomers.length / customers.length) * 100).toFixed(
                    1,
                  )}
                  % of total
                </p>
              )}
            </div>
            <div className="shrink-0 rounded-2xl bg-blue-100 p-3">
              <Repeat className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle>Customer Listing</CardTitle>
            <CardDescription>
              View and manage all customer records.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0">
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        ID #{customer.id}
                      </p>
                      <p className="break-words font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewClick(customer)}
                        className="h-8 w-8"
                        title="View Customer Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {customer.phone || "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">
                          Created At
                        </p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 opacity-50" />
                  <p>No customers found</p>
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
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="group">
                      <TableCell className="text-center font-mono text-sm">
                        {customer.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.firstName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.lastName}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(customer)}
                            title="View Customer Details"
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
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-50" />
                        <p>No customers found</p>
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

          {filteredCustomers.length > 0 && (
            <div className="mt-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="min-w-0 break-words text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * customersPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * customersPerPage,
                    filteredCustomers.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredCustomers.length}</span>{" "}
                customers
              </p>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
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
                </div>
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

      {/* Add Customer Modal */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new customer.
            </DialogDescription>
          </DialogHeader>
          <CustomerFormFields />
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomer}
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                loading.adding
              }
              className="w-full sm:w-auto"
            >
              {loading.adding && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loading.adding ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete customer information and order history.
            </DialogDescription>
          </DialogHeader>

          {viewCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Basic Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <Users className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Full Name
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.firstName} {viewCustomer.lastName}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <p className="break-all text-sm font-medium">
                        {viewCustomer.email}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.phone || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Joined Date
                      </p>
                      <p className="break-words text-sm font-medium">
                        {formatDate(viewCustomer.createdAt)}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(viewCustomer.status)}`}
                      >
                        {viewCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Street Address
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.address.street || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        City
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.address.city || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        State
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.address.state || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        ZIP Code
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.address.zipCode || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Country
                      </p>
                      <p className="break-words text-sm font-medium">
                        {viewCustomer.address.country || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold">
                        {viewCustomer.orders.length}
                      </p>
                    </div>
                    <ShoppingBag className="h-8 w-8 shrink-0 text-primary opacity-50" />
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Spent
                      </p>
                      <p className="break-words text-2xl font-bold">
                        {formatCurrency(viewCustomer.totalSpent)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 shrink-0 text-primary opacity-50" />
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {viewCustomer.notes && (
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    Notes
                  </h3>
                  <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {viewCustomer.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Rent & Lease Requests Section */}
                <div className="flex max-h-[300px] flex-col rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex shrink-0 items-center gap-2 text-base font-semibold">
                    <Calendar className="h-4 w-4" />
                    Rent & Lease Requests
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2">
                    {rentRequestsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading rent requests...
                        </span>
                      </div>
                    ) : rentRequests.length > 0 ? (
                      <div className="space-y-4">
                        {rentRequests.map((request) => (
                          <div
                            key={request.rent_id}
                            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="mb-3 flex gap-4">
                              {request.product?.assets &&
                                request.product.assets.length > 0 && (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getFullImageUrl(
                                        request.product.assets[0].asset_url,
                                      )}
                                      alt={request.product.product_name}
                                      className="h-20 w-20 rounded-lg border object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/placeholder-image.png";
                                      }}
                                    />
                                  </div>
                                )}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="break-words text-base font-semibold">
                                      {request.product?.product_name ||
                                        "Product"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      SKU: {request.product?.sku || "N/A"}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRentStatusClasses(request.rent_status)}`}
                                  >
                                    {request.rent_status
                                      .charAt(0)
                                      .toUpperCase() +
                                      request.rent_status.slice(1)}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                  {request.product?.sell_price && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">
                                        Price:
                                      </span>
                                      <span className="font-medium">
                                        {formatCurrency(
                                          parseFloat(
                                            request.product.sell_price,
                                          ),
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="my-3 border-t" />

                            <div className="mb-3">
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Request Notes
                              </p>
                              <p className="rounded-md bg-muted/30 p-3 text-sm break-words">
                                {request.query ||
                                  request.rent_note ||
                                  "No notes provided"}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Requested on:{" "}
                                  {formatDateOnly(request.created_at)}
                                </span>
                              </div>
                              {request.updated_at !== request.created_at && (
                                <div className="flex items-center gap-2">
                                  <span>
                                    Last updated:{" "}
                                    {formatDateOnly(request.updated_at)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No rent or lease requests found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          This customer hasn't made any rental or lease requests
                          yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order History Section */}
                <div className="flex max-h-[320px] flex-col rounded-lg border bg-card p-6">
                  <h3 className="mb-4 flex shrink-0 items-center gap-2 text-base font-semibold">
                    <Package className="h-4 w-4" />
                    Order History
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2">
                    {viewCustomer.orders.length > 0 ? (
                      <div className="space-y-4">
                        {viewCustomer.orders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-semibold">
                                  {order.orderNumber}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.date)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusClasses(order.status)}`}
                                >
                                  {order.status}
                                </span>
                                <p className="text-lg font-bold">
                                  {formatCurrency(order.total)}
                                </p>
                              </div>
                            </div>

                            <div className="my-3 border-t" />

                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-3 text-sm"
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Package className="h-3 w-3 shrink-0 text-muted-foreground" />
                                    <span className="break-words">
                                      {item.productName}
                                    </span>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-4">
                                    <span className="text-muted-foreground">
                                      x{item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(
                                        item.price * item.quantity,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {(order.transaction?.view_url ||
                              order.transaction?.download_url) && (
                              <div className="mt-4 flex flex-col justify-end gap-2 border-t pt-3 sm:flex-row">
                                {order.transaction.view_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      window.open(
                                        order.transaction.view_url,
                                        "_blank",
                                      );
                                    }}
                                    className="text-sm"
                                  >
                                    <Eye className="mr-1 h-3 w-3" />
                                    View Receipt
                                  </Button>
                                )}
                                {order.transaction.download_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      window.open(
                                        order.transaction.download_url,
                                        "_blank",
                                      );
                                    }}
                                    className="text-sm"
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    Download Invoice
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No orders yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}