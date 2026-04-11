import {
  useMemo,
  useState,
  type ChangeEvent,
  useCallback,
  useEffect,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/config/axiosConfig";

type DeliveryCharge = {
  option_id: number;
  delivery_title: string;
  delivery_price: string | number;
  deleivery_description: string;
  weight_range: string;
  created_at?: string;
  updated_at?: string;
};

type DeliveryChargeForm = {
  delivery_title: string;
  delivery_price: string;
  deleivery_description: string;
  weight_range: string;
};

type ValidationErrors = {
  delivery_title?: string[];
  delivery_price?: string[];
  deleivery_description?: string[];
  weight_range?: string[];
};

type AlertType = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

const emptyForm: DeliveryChargeForm = {
  delivery_title: "",
  delivery_price: "",
  deleivery_description: "",
  weight_range: "",
};

const weightRangeOptions = [
  "0 - 500g",
  "1kg - 3kg",
  "3kg - 5kg",
  "5kg - 10kg",
  "Other",
] as const;

const WEIGHT_RANGE_REGEX =
  /^\s*(\d+(?:\.\d+)?)\s*(kg|g)\s*-\s*(\d+(?:\.\d+)?)\s*(kg|g)\s*$/i;

const toGrams = (value: number, unit: string): number => {
  return unit.toLowerCase() === "kg" ? value * 1000 : value;
};

const validateCustomWeightRange = (
  value: string,
): { valid: boolean; message?: string } => {
  const trimmed = value.trim();
  const match = trimmed.match(WEIGHT_RANGE_REGEX);

  if (!match) {
    return {
      valid: false,
      message: "Enter weight range like 500g - 1kg or 1kg - 3kg",
    };
  }

  const firstValue = parseFloat(match[1]);
  const firstUnit = match[2].toLowerCase();
  const secondValue = parseFloat(match[3]);
  const secondUnit = match[4].toLowerCase();

  if (firstValue <= 0 || secondValue <= 0) {
    return {
      valid: false,
      message: "Weight values must be greater than 0",
    };
  }

  // Do not allow kg -> g format
  if (firstUnit === "kg" && secondUnit === "g") {
    return {
      valid: false,
      message:
        "If the first weight is in kg, the second weight must also be in kg",
    };
  }

  const firstInGrams = toGrams(firstValue, firstUnit);
  const secondInGrams = toGrams(secondValue, secondUnit);

  if (firstInGrams >= secondInGrams) {
    return {
      valid: false,
      message: "The second weight must be greater than the first weight",
    };
  }

  return { valid: true };
};

export default function DeliveryChargePage() {
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [alert, setAlert] = useState<AlertType>({
    show: false,
    type: "success",
    message: "",
  });

  const [formData, setFormData] = useState<DeliveryChargeForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [selectedWeightRange, setSelectedWeightRange] = useState<string>("");
  const [customWeightRange, setCustomWeightRange] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 4000);
    },
    [],
  );

  const fetchDeliveryCharges = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/delivery-options");

      if (response.data.status === "success") {
        setDeliveryCharges(response.data.data || []);
        setLastRefreshTime(new Date());
      } else {
        showAlert("error", "Failed to fetch delivery charges");
      }
    } catch (error: any) {
      console.error("Error fetching delivery charges:", error);
      showAlert(
        "error",
        error.response?.data?.message || "Failed to fetch delivery charges",
      );
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const createDeliveryCharge = useCallback(
    async (data: DeliveryChargeForm) => {
      try {
        const response = await api.post("/delivery-options", {
          delivery_title: data.delivery_title.trim(),
          deleivery_description: data.deleivery_description.trim(),
          delivery_price: parseFloat(data.delivery_price),
          weight_range: data.weight_range.trim(),
        });

        if (response.data.status === "success") {
          await fetchDeliveryCharges();
          showAlert("success", "Delivery charge created successfully");
          return true;
        } else {
          showAlert(
            "error",
            response.data.message || "Failed to create delivery charge",
          );
          return false;
        }
      } catch (error: any) {
        console.error("Error creating delivery charge:", error);

        if (error.response?.status === 422 && error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
          const firstError = Object.values(error.response.data.errors)[0]?.[0];
          if (firstError) showAlert("error", String(firstError));
        } else {
          showAlert(
            "error",
            error.response?.data?.message || "Failed to create delivery charge",
          );
        }
        return false;
      }
    },
    [fetchDeliveryCharges, showAlert],
  );

  const updateDeliveryCharge = useCallback(
    async (id: number, data: DeliveryChargeForm) => {
      try {
        const response = await api.put(`/delivery-options/${id}`, {
          delivery_title: data.delivery_title.trim(),
          deleivery_description: data.deleivery_description.trim(),
          delivery_price: parseFloat(data.delivery_price),
          weight_range: data.weight_range.trim(),
        });

        if (response.data.status === "success") {
          await fetchDeliveryCharges();
          showAlert("success", "Delivery charge updated successfully");
          return true;
        } else {
          showAlert(
            "error",
            response.data.message || "Failed to update delivery charge",
          );
          return false;
        }
      } catch (error: any) {
        console.error("Error updating delivery charge:", error);

        if (error.response?.status === 422 && error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
          const firstError = Object.values(error.response.data.errors)[0]?.[0];
          if (firstError) showAlert("error", String(firstError));
        } else if (error.response?.status === 404) {
          showAlert("error", "Delivery charge not found");
        } else {
          showAlert(
            "error",
            error.response?.data?.message || "Failed to update delivery charge",
          );
        }
        return false;
      }
    },
    [fetchDeliveryCharges, showAlert],
  );

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDeliveryCharges();
    setSearch("");
    setCurrentPage(1);
    setLastRefreshTime(new Date());
    setIsRefreshing(false);
    showAlert("success", "Data refreshed successfully");
  }, [fetchDeliveryCharges, showAlert]);

  const filteredDeliveryCharges = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return deliveryCharges;

    return deliveryCharges.filter((item) => {
      return (
        item.option_id.toString().includes(q) ||
        item.delivery_title.toLowerCase().includes(q) ||
        item.delivery_price.toString().includes(q) ||
        item.deleivery_description.toLowerCase().includes(q) ||
        item.weight_range.toLowerCase().includes(q)
      );
    });
  }, [deliveryCharges, search]);

  const totalRecords = deliveryCharges.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDeliveryCharges.length / itemsPerPage),
  );

  const paginatedDeliveryCharges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDeliveryCharges.slice(startIndex, endIndex);
  }, [filteredDeliveryCharges, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setEditId(null);
    setValidationErrors({});
    setSelectedWeightRange("");
    setCustomWeightRange("");
  }, []);

  const validateForm = useCallback(() => {
    const errors: ValidationErrors = {};

    if (!formData.delivery_title.trim()) {
      errors.delivery_title = ["Delivery title is required"];
    } else if (formData.delivery_title.trim().length < 2) {
      errors.delivery_title = ["Delivery title must be at least 2 characters"];
    }

    if (!formData.delivery_price.trim()) {
      errors.delivery_price = ["Delivery price is required"];
    } else if (isNaN(parseFloat(formData.delivery_price))) {
      errors.delivery_price = ["Please enter a valid number"];
    } else if (parseFloat(formData.delivery_price) <= 0) {
      errors.delivery_price = ["Delivery price must be greater than 0"];
    }

    if (!formData.deleivery_description.trim()) {
      errors.deleivery_description = ["Delivery description is required"];
    } else if (formData.deleivery_description.trim().length < 10) {
      errors.deleivery_description = [
        "Delivery description must be at least 10 characters",
      ];
    }

    if (!formData.weight_range.trim()) {
      errors.weight_range = ["Weight range is required"];
    } else if (selectedWeightRange === "Other") {
      if (!customWeightRange.trim()) {
        errors.weight_range = ["Please enter a custom weight range"];
      } else {
        const customValidation = validateCustomWeightRange(customWeightRange);
        if (!customValidation.valid) {
          errors.weight_range = [
            customValidation.message || "Invalid weight range",
          ];
        }
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) showAlert("error", String(firstError));
      return false;
    }

    return true;
  }, [formData, showAlert, selectedWeightRange, customWeightRange]);

  const handleAddItem = useCallback(async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const success = await createDeliveryCharge(formData);
    if (success) {
      setIsAddOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  }, [validateForm, createDeliveryCharge, formData, resetForm]);

  const handleEditClick = useCallback((item: DeliveryCharge) => {
    const existingWeightRange = item.weight_range || "";
    const isPreset = weightRangeOptions.includes(
      existingWeightRange as (typeof weightRangeOptions)[number],
    );

    setEditId(item.option_id);
    setFormData({
      delivery_title: item.delivery_title,
      delivery_price: item.delivery_price.toString(),
      deleivery_description: item.deleivery_description || "",
      weight_range: existingWeightRange,
    });

    if (isPreset && existingWeightRange !== "Other") {
      setSelectedWeightRange(existingWeightRange);
      setCustomWeightRange("");
    } else {
      setSelectedWeightRange("Other");
      setCustomWeightRange(existingWeightRange);
    }

    setValidationErrors({});
    setIsEditOpen(true);
  }, []);

  const handleUpdateItem = useCallback(async () => {
    if (editId === null) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    const success = await updateDeliveryCharge(editId, formData);
    if (success) {
      setIsEditOpen(false);
      resetForm();
    }
    setIsSubmitting(false);
  }, [editId, validateForm, updateDeliveryCharge, formData, resetForm]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  useEffect(() => {
    fetchDeliveryCharges();
  }, [fetchDeliveryCharges]);

  const DeliveryChargeFormFields = useMemo(() => {
    return (
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="delivery_title">
            Delivery Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="delivery_title"
            name="delivery_title"
            value={formData.delivery_title}
            onChange={handleInputChange}
            placeholder="Enter delivery title"
            autoComplete="off"
            autoFocus
            className={
              validationErrors.delivery_title ? "border-destructive" : ""
            }
          />
          {validationErrors.delivery_title && (
            <p className="text-sm text-destructive">
              {validationErrors.delivery_title[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="delivery_price">
            Delivery Price ($) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="delivery_price"
            name="delivery_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.delivery_price}
            onChange={handleInputChange}
            placeholder="Enter delivery price"
            className={
              validationErrors.delivery_price ? "border-destructive" : ""
            }
          />
          {validationErrors.delivery_price && (
            <p className="text-sm text-destructive">
              {validationErrors.delivery_price[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight_range">
            Weight Range <span className="text-destructive">*</span>
          </Label>

          <Select
            value={selectedWeightRange}
            onValueChange={(value) => {
              setSelectedWeightRange(value);

              if (value === "Other") {
                setFormData((prev) => ({
                  ...prev,
                  weight_range: customWeightRange,
                }));
              } else {
                setCustomWeightRange("");
                setFormData((prev) => ({
                  ...prev,
                  weight_range: value,
                }));
              }

              if (validationErrors.weight_range) {
                setValidationErrors((prev) => ({
                  ...prev,
                  weight_range: undefined,
                }));
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                validationErrors.weight_range && "border-destructive",
              )}
            >
              <SelectValue placeholder="Select weight range" />
            </SelectTrigger>
            <SelectContent>
              {weightRangeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedWeightRange === "Other" && (
            <Input
              id="custom_weight_range"
              value={customWeightRange}
              onChange={(e) => {
                const value = e.target.value;
                setCustomWeightRange(value);
                setFormData((prev) => ({
                  ...prev,
                  weight_range: value,
                }));

                if (!value.trim()) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    weight_range: undefined,
                  }));
                  return;
                }

                const result = validateCustomWeightRange(value);

                setValidationErrors((prev) => ({
                  ...prev,
                  weight_range: result.valid
                    ? undefined
                    : [result.message || "Invalid weight range"],
                }));
              }}
              placeholder="Enter custom weight range (e.g. 500g - 1kg)"
              className={
                validationErrors.weight_range ? "border-destructive" : ""
              }
            />
          )}

          {validationErrors.weight_range && (
            <p className="text-sm text-destructive">
              {validationErrors.weight_range[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="deleivery_description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="deleivery_description"
            name="deleivery_description"
            value={formData.deleivery_description}
            onChange={handleInputChange}
            placeholder="Enter delivery description"
            className={cn(
              "min-h-[120px] resize-y",
              validationErrors.deleivery_description && "border-destructive",
            )}
          />
          {validationErrors.deleivery_description && (
            <p className="text-sm text-destructive">
              {validationErrors.deleivery_description[0]}
            </p>
          )}
        </div>
      </div>
    );
  }, [
    formData,
    handleInputChange,
    validationErrors,
    selectedWeightRange,
    customWeightRange,
  ]);

  if (isLoading) {
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
    <div className="relative space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      {alert.show && (
        <div className="fixed right-3 top-16 z-50 w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
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
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            Delivery Charges
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage delivery charge records with full CRUD operations
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
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
          <Button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery Charge
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <h3 className="mt-1 text-2xl font-bold">{totalRecords}</h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Filtered Records</p>
              <h3 className="mt-1 text-2xl font-bold">
                {filteredDeliveryCharges.length}
              </h3>
            </div>
            <div className="rounded-2xl bg-blue-100 p-3">
              <Truck className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Current Page</p>
              <h3 className="mt-1 text-2xl font-bold">
                {currentPage} / {totalPages}
              </h3>
            </div>
            <div className="rounded-2xl bg-purple-100 p-3">
              <Truck className="h-5 w-5 text-purple-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle>Delivery Charge Listing</CardTitle>
            <CardDescription>
              View, add, and edit delivery charges
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, price, description, or weight range..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 md:hidden">
            {paginatedDeliveryCharges.length > 0 ? (
              paginatedDeliveryCharges.map((item) => (
                <div
                  key={item.option_id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        ID #{item.option_id}
                      </p>
                      <p className="break-words font-medium">
                        {item.delivery_title}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(item)}
                        className="h-8 w-8"
                        title="Edit delivery charge"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        ${parseFloat(item.delivery_price.toString()).toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Weight Range
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.weight_range || "—"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {item.deleivery_description || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Truck className="h-8 w-8 opacity-50" />
                  <p>No delivery charges found</p>
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

          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <Table className="custom-table-header">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead className="min-w-[200px]">
                    Delivery Title
                  </TableHead>
                  <TableHead className="w-40 text-center">Price ($)</TableHead>
                  <TableHead className="w-40">Weight Range</TableHead>
                  <TableHead className="min-w-[300px]">Description</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedDeliveryCharges.length > 0 ? (
                  paginatedDeliveryCharges.map((item) => (
                    <TableRow key={item.option_id}>
                      <TableCell className="text-center font-mono text-sm">
                        {item.option_id}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.delivery_title}</p>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        ${parseFloat(item.delivery_price.toString()).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {item.weight_range || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[500px]">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.deleivery_description || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="h-8 w-8"
                            title="Edit delivery charge"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Truck className="h-8 w-8 opacity-50" />
                        <p>No delivery charges found</p>
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

          {filteredDeliveryCharges.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredDeliveryCharges.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredDeliveryCharges.length}
                </span>{" "}
                records
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>

                <div className="flex flex-wrap items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, index) => {
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
                    },
                  )}

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
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Delivery Charge</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new delivery charge.
            </DialogDescription>
          </DialogHeader>

          {DeliveryChargeFormFields}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Delivery Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Delivery Charge</DialogTitle>
            <DialogDescription>
              Update the delivery charge details below.
            </DialogDescription>
          </DialogHeader>

          {DeliveryChargeFormFields}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Delivery Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}