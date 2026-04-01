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
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions
type Category = {
  c_id: number;
  category_name: string;
  category_description: string;
  created_at?: string;
  updated_at?: string;
};

type CategoryForm = {
  name: string;
  description: string;
};

type ValidationErrors = {
  category_name?: string[];
  category_description?: string[];
};

type AlertType = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
};

export default function CategoryPage() {
  // State declarations
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
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

  const [formData, setFormData] = useState<CategoryForm>(emptyForm);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const categoriesPerPage = 15;

  // Format date and time
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

  // Show alert
  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  // Fetch all categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/categories");

      if (response.data.status === "success") {
        setCategories(response.data.data);
        setLastRefreshTime(new Date());
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return categories;

    return categories.filter((category) => {
      return (
        category.c_id.toString().includes(q) ||
        category.category_name.toLowerCase().includes(q) ||
        (category.category_description &&
          category.category_description.toLowerCase().includes(q))
      );
    });
  }, [categories, search]);

  const totalCategories = categories.length;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / categoriesPerPage),
  );

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Adjust current page if it exceeds total pages
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
      // Clear validation error for this field when user starts typing
      if (name === "name" && validationErrors.category_name) {
        setValidationErrors((prev) => ({
          ...prev,
          category_name: undefined,
        }));
      }
      if (name === "description" && validationErrors.category_description) {
        setValidationErrors((prev) => ({
          ...prev,
          category_description: undefined,
        }));
      }
    },
    [validationErrors],
  );

  const resetForm = useCallback(() => {
    setFormData(emptyForm);
    setEditCategoryId(null);
    setValidationErrors({});
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCategories();
    setSearch("");
    setCurrentPage(1);
    setIsRefreshing(false);
    showAlert("success", "Categories refreshed successfully");
  }, [fetchCategories, showAlert]);

  // CREATE CATEGORY
  const handleAddCategory = useCallback(async () => {
    const errors: ValidationErrors = {};

    // Validate category name
    if (!formData.name.trim()) {
      errors.category_name = ["Category name is required"];
    } else if (formData.name.trim().length < 3) {
      errors.category_name = ["Category name must be at least 3 characters"];
    }

    // Validate category description
    if (!formData.description.trim()) {
      errors.category_description = ["Category description is required"];
    } else if (formData.description.trim().length < 10) {
      errors.category_description = [
        "Category description must be at least 10 characters",
      ];
    }

    // If there are validation errors, display them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show first error in alert
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) {
        showAlert("error", firstError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/categories", {
        category_name: formData.name.trim(),
        category_description: formData.description.trim(),
      });

      if (response.data.status === "success") {
        await fetchCategories();
        resetForm();
        setIsAddOpen(false);
        setCurrentPage(1);
        showAlert(
          "success",
          response.data.message || "Category created successfully",
        );
      }
    } catch (err: any) {
      console.error("Error adding category:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        if (firstError) {
          showAlert("error", firstError);
        }
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to add category",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, fetchCategories, resetForm, showAlert]);

  // EDIT CATEGORY - Open edit modal
  const handleEditClick = useCallback((category: Category) => {
    setEditCategoryId(category.c_id);
    setFormData({
      name: category.category_name,
      description: category.category_description || "",
    });
    setValidationErrors({});
    setIsEditOpen(true);
  }, []);

  // UPDATE CATEGORY - Submit edit
  const handleUpdateCategory = useCallback(async () => {
    if (editCategoryId === null) return;

    const errors: ValidationErrors = {};

    // Validate category name
    if (!formData.name.trim()) {
      errors.category_name = ["Category name is required"];
    } else if (formData.name.trim().length < 3) {
      errors.category_name = ["Category name must be at least 3 characters"];
    }

    // Validate category description
    if (!formData.description.trim()) {
      errors.category_description = ["Category description is required"];
    } else if (formData.description.trim().length < 10) {
      errors.category_description = [
        "Category description must be at least 10 characters",
      ];
    }

    // If there are validation errors, display them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show first error in alert
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) {
        showAlert("error", firstError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put(`/categories/${editCategoryId}`, {
        category_name: formData.name.trim(),
        category_description: formData.description.trim(),
      });

      if (response.data.status === "success") {
        await fetchCategories();
        resetForm();
        setIsEditOpen(false);
        showAlert(
          "success",
          response.data.message || "Category updated successfully",
        );
      }
    } catch (err: any) {
      console.error("Error updating category:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        if (firstError) {
          showAlert("error", firstError);
        }
      } else if (err.response?.status === 404) {
        showAlert("error", "Category not found");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to update category",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editCategoryId, formData, fetchCategories, resetForm, showAlert]);

  // DELETE CATEGORY - Open delete confirmation
  const handleDeleteClick = useCallback((category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  }, []);

  // DELETE CATEGORY - Confirm deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await api.delete(`/categories/${categoryToDelete.c_id}`);

      if (response.data.status === "success") {
        await fetchCategories();
        setIsDeleteOpen(false);
        setCategoryToDelete(null);
        showAlert(
          "success",
          response.data.message || "Category deleted successfully",
        );

        // Adjust current page if needed
        const newTotalPages = Math.ceil(
          (categories.length - 1) / categoriesPerPage,
        );
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }
    } catch (err: any) {
      console.error("Error deleting category:", err);
      if (err.response?.status === 404) {
        showAlert("error", "Category not found");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to delete category",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    categoryToDelete,
    fetchCategories,
    currentPage,
    categories.length,
    categoriesPerPage,
    showAlert,
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  // Form fields component with validation errors
  const CategoryFormFields = useMemo(() => {
    return (
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="name">
            Category Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter category name"
            autoComplete="off"
            autoFocus
            className={
              validationErrors.category_name ? "border-destructive" : ""
            }
          />
          {validationErrors.category_name && (
            <p className="text-sm text-destructive">
              {validationErrors.category_name[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter category description"
            className={cn(
              "min-h-[120px] resize-y",
              validationErrors.category_description && "border-destructive",
            )}
          />
          {validationErrors.category_description && (
            <p className="text-sm text-destructive">
              {validationErrors.category_description[0]}
            </p>
          )}
        </div>
      </div>
    );
  }, [
    formData.name,
    formData.description,
    handleInputChange,
    validationErrors,
  ]);

  // Loading skeleton for categories
  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="mt-2 h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <Separator />

        {/* Stats loading skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && categories.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchCategories}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 relative">
      {/* Alert Component - Positioned at top center */}
      {alert.show && (
        <div className="fixed top-16 right-4 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
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

      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage category records with full CRUD operations
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
            Add Category
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <h3 className="mt-1 text-2xl font-bold">{totalCategories}</h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <Tags className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Filtered Records</p>
              <h3 className="mt-1 text-2xl font-bold">
                {filteredCategories.length}
              </h3>
            </div>
            <div className="rounded-2xl bg-blue-100 p-3">
              <Tags className="h-5 w-5 text-blue-700" />
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
              <Tags className="h-5 w-5 text-purple-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Category Listing</CardTitle>
            <CardDescription>
              View, add, edit, and delete all category records
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, or description..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table className="custom-table-header">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead className="min-w-[200px]">Category Name</TableHead>
                  <TableHead className="min-w-[300px]">Description</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.c_id}>
                      <TableCell className="font-mono text-sm text-center">
                        {category.c_id}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{category.category_name}</p>
                      </TableCell>
                      <TableCell className="max-w-[500px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.category_description || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(category)}
                            className="h-8 w-8"
                            title="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(category)}
                            className="h-8 w-8 hover:text-destructive"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Tags className="h-8 w-8 opacity-50" />
                        <p>No categories found</p>
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
          {filteredCategories.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * categoriesPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * categoriesPerPage,
                    filteredCategories.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredCategories.length}</span>{" "}
                categories
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

      {/* Add Category Modal */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new category. Category name
              must be at least 3 characters and description must be at least 10
              characters.
            </DialogDescription>
          </DialogHeader>

          {CategoryFormFields}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details below. Category name must be at least
              3 characters and description must be at least 10 characters.
            </DialogDescription>
          </DialogHeader>

          {CategoryFormFields}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
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
              Are you sure you want to delete the category "
              {categoryToDelete?.category_name}"? This action cannot be undone.
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
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
