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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BadgePercent,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  CalendarDays,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
type Product = {
  product_id: number;
  product_name?: string;
};

type Discount = {
  discount_id: number;
  discount_name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  products?: Product[];
};

type DiscountForm = {
  discount_name: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
};

type ValidationErrors = {
  discount_name?: string[];
  discount_percentage?: string[];
  start_date?: string[];
  end_date?: string[];
};

type AlertType = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

const emptyForm: DiscountForm = {
  discount_name: "",
  discount_percentage: "",
  start_date: "",
  end_date: "",
};

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [alert, setAlert] = useState<AlertType>({
    show: false,
    type: "success",
    message: "",
  });

  const [formData, setFormData] = useState<DiscountForm>(emptyForm);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const discountsPerPage = 10;

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

  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const getDiscountStatus = useCallback((startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    if (today < start) return "Upcoming";
    if (today > end) return "Expired";
    return "Active";
  }, []);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/discounts");

      if (response.data.status === "success") {
        setDiscounts(response.data.data || []);
        setLastRefreshTime(new Date());
      } else {
        setError("Failed to fetch discounts");
      }
    } catch (err: any) {
      console.error("Error fetching discounts:", err);
      setError(err.response?.data?.message || "Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const filteredDiscounts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return discounts;

    return discounts.filter((discount) => {
      const status = getDiscountStatus(
        discount.start_date,
        discount.end_date,
      ).toLowerCase();

      return (
        discount.discount_id.toString().includes(q) ||
        discount.discount_name.toLowerCase().includes(q) ||
        discount.discount_percentage.toString().includes(q) ||
        status.includes(q)
      );
    });
  }, [discounts, search, getDiscountStatus]);

  const totalDiscounts = discounts.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDiscounts.length / discountsPerPage),
  );

  const paginatedDiscounts = useMemo(() => {
    const startIndex = (currentPage - 1) * discountsPerPage;
    const endIndex = startIndex + discountsPerPage;
    return filteredDiscounts.slice(startIndex, endIndex);
  }, [filteredDiscounts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (validationErrors[name as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [validationErrors],
  );

  const resetForm = useCallback(() => {
    setFormData(emptyForm);
    setValidationErrors({});
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDiscounts();
    setSearch("");
    setCurrentPage(1);
    setIsRefreshing(false);
    showAlert("success", "Discounts refreshed successfully");
  }, [fetchDiscounts, showAlert]);

  const handleAddDiscount = useCallback(async () => {
    const errors: ValidationErrors = {};

    if (!formData.discount_name.trim()) {
      errors.discount_name = ["Discount name is required"];
    } else if (formData.discount_name.trim().length < 3) {
      errors.discount_name = ["Discount name must be at least 3 characters"];
    }

    if (!formData.discount_percentage.trim()) {
      errors.discount_percentage = ["Discount percentage is required"];
    } else {
      const percentage = Number(formData.discount_percentage);
      if (Number.isNaN(percentage)) {
        errors.discount_percentage = ["Discount percentage must be a number"];
      } else if (percentage < 0 || percentage > 100) {
        errors.discount_percentage = [
          "Discount percentage must be between 0 and 100",
        ];
      }
    }

    if (!formData.start_date) {
      errors.start_date = ["Start date is required"];
    }

    if (!formData.end_date) {
      errors.end_date = ["End date is required"];
    } else if (
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      errors.end_date = ["End date must be after or equal to start date"];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) showAlert("error", firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/discounts", {
        discount_name: formData.discount_name.trim(),
        discount_percentage: Number(formData.discount_percentage),
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      if (response.data.status === "success") {
        await fetchDiscounts();
        resetForm();
        setIsAddOpen(false);
        setCurrentPage(1);
        showAlert(
          "success",
          response.data.message || "Discount created successfully",
        );
      }
    } catch (err: any) {
      console.error("Error adding discount:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        if (firstError) showAlert("error", firstError);
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to add discount",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, fetchDiscounts, resetForm, showAlert]);

  const handleDeleteClick = useCallback((discount: Discount) => {
    setDiscountToDelete(discount);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!discountToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await api.delete(
        `/discounts/${discountToDelete.discount_id}`,
      );

      if (response.data.status === "success") {
        await fetchDiscounts();
        setIsDeleteOpen(false);
        setDiscountToDelete(null);
        showAlert(
          "success",
          response.data.message || "Discount deleted successfully",
        );

        const newTotalPages = Math.ceil(
          (discounts.length - 1) / discountsPerPage,
        );
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }
    } catch (err: any) {
      console.error("Error deleting discount:", err);
      if (err.response?.status === 404) {
        showAlert("error", "Discount not found");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to delete discount",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    discountToDelete,
    fetchDiscounts,
    discounts.length,
    currentPage,
    showAlert,
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  const activeCount = useMemo(() => {
    return discounts.filter(
      (discount) =>
        getDiscountStatus(discount.start_date, discount.end_date) === "Active",
    ).length;
  }, [discounts, getDiscountStatus]);

  const expiredCount = useMemo(() => {
    return discounts.filter(
      (discount) =>
        getDiscountStatus(discount.start_date, discount.end_date) === "Expired",
    ).length;
  }, [discounts, getDiscountStatus]);

  const DiscountFormFields = useMemo(() => {
    return (
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="discount_name">
            Discount Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discount_name"
            name="discount_name"
            value={formData.discount_name}
            onChange={handleInputChange}
            placeholder="Enter discount name"
            autoComplete="off"
            autoFocus
            className={
              validationErrors.discount_name ? "border-destructive" : ""
            }
          />
          {validationErrors.discount_name && (
            <p className="text-sm text-destructive">
              {validationErrors.discount_name[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="discount_percentage">
            Discount Percentage <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.discount_percentage}
            onChange={handleInputChange}
            placeholder="Enter discount percentage"
            className={
              validationErrors.discount_percentage ? "border-destructive" : ""
            }
          />
          {validationErrors.discount_percentage && (
            <p className="text-sm text-destructive">
              {validationErrors.discount_percentage[0]}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="start_date">
              Start Date <span className="text-destructive">*</span>
            </Label>

            <div className="relative">
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={cn(
                  "pr-10 [color-scheme:light] dark:text-white dark:bg-zinc-950 dark:border-zinc-800",
                  "[&::-webkit-calendar-picker-indicator]:opacity-0",
                  "[&::-webkit-calendar-picker-indicator]:absolute",
                  "[&::-webkit-calendar-picker-indicator]:right-0",
                  "[&::-webkit-calendar-picker-indicator]:top-0",
                  "[&::-webkit-calendar-picker-indicator]:h-full",
                  "[&::-webkit-calendar-picker-indicator]:w-10",
                  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  validationErrors.start_date ? "border-destructive" : "",
                )}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-200" />
            </div>

            {validationErrors.start_date && (
              <p className="text-sm text-destructive">
                {validationErrors.start_date[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end_date">
              End Date <span className="text-destructive">*</span>
            </Label>

            <div className="relative">
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={cn(
                  "pr-10 [color-scheme:light] dark:text-white dark:bg-zinc-950 dark:border-zinc-800",
                  "[&::-webkit-calendar-picker-indicator]:opacity-0",
                  "[&::-webkit-calendar-picker-indicator]:absolute",
                  "[&::-webkit-calendar-picker-indicator]:right-0",
                  "[&::-webkit-calendar-picker-indicator]:top-0",
                  "[&::-webkit-calendar-picker-indicator]:h-full",
                  "[&::-webkit-calendar-picker-indicator]:w-10",
                  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  validationErrors.end_date ? "border-destructive" : "",
                )}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-200" />
            </div>

            {validationErrors.end_date && (
              <p className="text-sm text-destructive">
                {validationErrors.end_date[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }, [formData, handleInputChange, validationErrors]);

  if (loading && discounts.length === 0) {
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
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-muted-foreground">Loading discounts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && discounts.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchDiscounts}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 p-6">
      {alert.show && (
        <div className="animate-in slide-in-from-top-2 fade-in fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm duration-300">
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
          <h1 className="text-2xl font-bold tracking-tight">
            Discount Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all discounts and promotional offers
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
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
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Discount
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Discounts</p>
              <h3 className="mt-1 text-2xl font-bold">{totalDiscounts}</h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <BadgePercent className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Active Discounts</p>
              <h3 className="mt-1 text-2xl font-bold">{activeCount}</h3>
            </div>
            <div className="rounded-2xl bg-green-100 p-3">
              <CalendarDays className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Expired Discounts</p>
              <h3 className="mt-1 text-2xl font-bold">{expiredCount}</h3>
            </div>
            <div className="rounded-2xl bg-red-100 p-3">
              <AlertTriangle className="h-5 w-5 text-red-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Current Page</p>
              <h3 className="mt-1 text-2xl font-bold">
                {currentPage} / {totalPages}
              </h3>
            </div>
            <div className="rounded-2xl bg-purple-100 p-3">
              <Package className="h-5 w-5 text-purple-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Discount Listing</CardTitle>
            <CardDescription>
              View and manage all available discounts
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, percentage, or status..."
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
                  <TableHead className="min-w-[220px]">Discount Name</TableHead>
                  <TableHead className="w-32 text-center">Percentage</TableHead>
                  <TableHead className="w-40 text-center">Start Date</TableHead>
                  <TableHead className="w-40 text-center">End Date</TableHead>
                  <TableHead className="w-32 text-center">Status</TableHead>
                  <TableHead className="w-32 text-center">Products</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedDiscounts.length > 0 ? (
                  paginatedDiscounts.map((discount) => {
                    const status = getDiscountStatus(
                      discount.start_date,
                      discount.end_date,
                    );

                    return (
                      <TableRow key={discount.discount_id}>
                        <TableCell className="text-center font-mono text-sm">
                          {discount.discount_id}
                        </TableCell>

                        <TableCell>
                          <p className="font-medium">{discount.discount_name}</p>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="font-semibold text-primary">
                            {discount.discount_percentage}%
                          </span>
                        </TableCell>

                        <TableCell className="text-center text-sm text-muted-foreground">
                          {formatDate(discount.start_date)}
                        </TableCell>

                        <TableCell className="text-center text-sm text-muted-foreground">
                          {formatDate(discount.end_date)}
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                              status === "Active" &&
                                "bg-green-100 text-green-700",
                              status === "Upcoming" &&
                                "bg-yellow-100 text-yellow-700",
                              status === "Expired" && "bg-red-100 text-red-700",
                            )}
                          >
                            {status}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {discount.products?.length || 0}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(discount)}
                              className="h-8 w-8 hover:text-destructive"
                              title="Delete discount"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <BadgePercent className="h-8 w-8 opacity-50" />
                        <p>No discounts found</p>
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

          {filteredDiscounts.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * discountsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * discountsPerPage,
                    filteredDiscounts.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredDiscounts.length}</span>{" "}
                discounts
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

                <div className="flex items-center gap-1">
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
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Discount</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new discount.
            </DialogDescription>
          </DialogHeader>

          {DiscountFormFields}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDiscount} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Confirm Delete</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              Are you sure you want to delete the discount "
              {discountToDelete?.discount_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}