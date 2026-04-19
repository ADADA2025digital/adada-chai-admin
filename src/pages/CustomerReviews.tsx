import { useEffect, useMemo, useState, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Star,
  Search,
  Eye,
  MessageSquareText,
  Users,
  CheckCircle,
  XCircle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ImageIcon,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ApiReview {
  re_id: number;
  order_number: string;
  product_id: number;
  rating: number;
  review_comment: string;
  review_images: string[];
  review_status: "approved" | "pending" | "rejected";
  product?: {
    product_id: number;
    product_name: string;
  };
}

interface CustomerReview {
  id: number;
  reviewId: string;
  orderId: string;
  customerName: string;
  email: string;
  productName: string;
  rating: number;
  comment: string;
  images: string[];
  status: "approved" | "pending" | "rejected";
  date: string;
  adminNote?: string;
}

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

const getStatusClasses = (status: string): string => {
  switch (status) {
    case "approved":
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
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "pending":
      return <Clock3 className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewReview, setViewReview] = useState<CustomerReview | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 15;

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });

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

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });

      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const fetchReviews = useCallback(
    async (showSuccessAlert = false) => {
      try {
        setIsRefreshing(true);

        const response = await api.get("/reviews");

        if (response.data.status === "success") {
          const apiReviews: ApiReview[] = response.data.data || [];

          const sortedReviews = [...apiReviews].sort(
            (a, b) => b.re_id - a.re_id,
          );

          const transformedReviews: CustomerReview[] = sortedReviews.map(
            (review) => ({
              id: review.re_id,
              reviewId: `REV-${review.re_id.toString().padStart(4, "0")}`,
              orderId: review.order_number,
              customerName: "Customer",
              email: "customer@example.com",
              productName:
                review.product?.product_name || `Product ${review.product_id}`,
              rating: review.rating,
              comment: review.review_comment,
              images: review.review_images || [],
              status: review.review_status,
              date: new Date().toISOString(),
              adminNote: "",
            }),
          );

          setReviews(transformedReviews);
          setLastRefreshTime(new Date());

          if (showSuccessAlert) {
            showAlert("success", "Reviews refreshed successfully!");
          }
        }
      } catch (error: any) {
        console.error("Error fetching reviews:", error);

        const errorMessage =
          error?.response?.data?.message || "Failed to fetch reviews";

        if (showSuccessAlert) {
          showAlert("error", errorMessage);
        }
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [showAlert],
  );

  const updateReviewStatus = useCallback(
    async (reviewId: number, status: "approved" | "rejected") => {
      try {
        setIsUpdating(true);

        const response = await api.put(`/reviews/${reviewId}/status`, {
          review_status: status,
        });

        if (response.data.status === "success") {
          showAlert("success", `Review ${status} successfully`);
          await fetchReviews(false);
          return true;
        }

        return false;
      } catch (error: any) {
        console.error("Error updating review status:", error);
        showAlert(
          "error",
          error?.response?.data?.message || "Failed to update review status",
        );
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchReviews, showAlert],
  );

  useEffect(() => {
    fetchReviews(false);
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return reviews;

    return reviews.filter((review) => {
      return (
        review.reviewId.toLowerCase().includes(q) ||
        review.orderId.toLowerCase().includes(q) ||
        review.customerName.toLowerCase().includes(q) ||
        review.productName.toLowerCase().includes(q) ||
        review.comment.toLowerCase().includes(q)
      );
    });
  }, [reviews, search]);

  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(
    (item) => item.status === "approved",
  ).length;
  const pendingReviews = reviews.filter(
    (item) => item.status === "pending",
  ).length;
  const rejectedReviews = reviews.filter(
    (item) => item.status === "rejected",
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / reviewsPerPage),
  );

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = useCallback(async () => {
    await fetchReviews(true);
  }, [fetchReviews]);

  const handleViewClick = (review: CustomerReview) => {
    setViewReview(review);
    setIsViewOpen(true);
  };

  const handleApproveReview = async () => {
    if (!viewReview) return;

    const success = await updateReviewStatus(viewReview.id, "approved");
    if (success) {
      setIsViewOpen(false);
      setViewReview(null);
    }
  };

  const handleRejectReview = async () => {
    if (!viewReview) return;

    const success = await updateReviewStatus(viewReview.id, "rejected");
    if (success) {
      setIsViewOpen(false);
      setViewReview(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 shrink-0 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
    <div className="relative min-w-0 overflow-x-hidden space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      {alert.show && (
        <div className="animate-in slide-in-from-top-2 fade-in fixed right-3 top-16 z-[9999] w-[calc(100%-1.5rem)] max-w-sm duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
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
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer feedback, ratings, and review approvals.
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <h3 className="mt-1 text-2xl font-bold">{totalReviews}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
              <MessageSquareText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Approved</p>
              <h3 className="mt-1 text-2xl font-bold">{approvedReviews}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-green-100 p-3">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="mt-1 text-2xl font-bold">{pendingReviews}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-yellow-100 p-3">
              <Clock3 className="h-5 w-5 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <h3 className="mt-1 text-2xl font-bold">{averageRating}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-yellow-100 p-3">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle>Review Listing</CardTitle>
            <CardDescription>
              View and manage all customer reviews.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by review ID, order ID, customer..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0">
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {review.reviewId}
                      </p>
                      <p className="break-words font-medium">
                        {review.productName}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewClick(review)}
                        className="h-8 w-8"
                        title="View Review Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="mt-1 break-words text-sm font-medium">
                        {review.orderId}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="mt-1 break-words text-sm font-medium">
                        {review.customerName}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {review.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <div className="mt-1 space-y-1">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1">
                          <span
                            className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              review.status,
                            )}`}
                          >
                            {getStatusIcon(review.status)}
                            <span className="break-words">
                              {getStatusText(review.status)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Comment</p>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Images</p>
                      <div className="mt-1">
                        {review.images.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-xs">
                              {review.images.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <MessageSquareText className="h-8 w-8 opacity-50" />
                  <p>No reviews found</p>
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
                  <TableHead className="text-center">Review ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((review) => (
                    <TableRow key={review.id} className="group">
                      <TableCell className="text-center font-mono text-sm">
                        {review.reviewId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {review.orderId}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{review.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.email}
                        </p>
                      </TableCell>
                      <TableCell>{review.productName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm">{review.comment}</p>
                      </TableCell>
                      <TableCell>
                        {review.images.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-xs">
                              {review.images.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            review.status,
                          )}`}
                        >
                          {getStatusIcon(review.status)}
                          {getStatusText(review.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(review)}
                            title="View Review Details"
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
                        <MessageSquareText className="h-8 w-8 opacity-50" />
                        <p>No reviews found</p>
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

          {filteredReviews.length > 0 && (
            <div className="mt-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="min-w-0 break-words text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * reviewsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * reviewsPerPage,
                    filteredReviews.length,
                  )}
                </span>{" "}
                of <span className="font-medium">{filteredReviews.length}</span>{" "}
                reviews
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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Complete review information and management.
            </DialogDescription>
          </DialogHeader>

          {viewReview && (
            <div className="space-y-6">
              <div className="rounded-xl border p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <MessageSquareText className="h-5 w-5" />
                  Review Information
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Review ID</p>
                    <p className="break-words font-mono text-sm font-medium">
                      {viewReview.reviewId}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="break-words font-mono text-sm font-medium">
                      {viewReview.orderId}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="break-words font-medium">
                      {viewReview.productName}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StarRating rating={viewReview.rating} />
                      <span className="text-sm font-medium">
                        ({viewReview.rating}/5)
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        viewReview.status,
                      )}`}
                    >
                      {getStatusIcon(viewReview.status)}
                      {getStatusText(viewReview.status)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="break-words font-medium">
                      {formatDate(viewReview.date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5" />
                    User Information
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="break-words font-medium">
                        {viewReview.customerName}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="break-all font-medium">
                        {viewReview.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                    <MessageSquareText className="h-5 w-5" />
                    Customer Comment
                  </h3>
                  <p className="break-words text-sm leading-relaxed">
                    {viewReview.comment}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {viewReview.images.length > 0 && (
                  <div className="rounded-xl border p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <ImageIcon className="h-5 w-5" />
                      Review Images
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {viewReview.images.map((image, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="h-32 w-full cursor-pointer rounded-lg border object-cover transition-opacity hover:opacity-90"
                            onClick={() => window.open(image, "_blank")}
                          />
                          <p className="mt-1 text-center text-xs text-muted-foreground">
                            Review image {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <ThumbsUp className="h-5 w-5" />
                    Review Actions
                  </h3>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleApproveReview}
                      disabled={viewReview.status === "approved" || isUpdating}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isUpdating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve Review
                    </Button>

                    <Button
                      onClick={handleRejectReview}
                      disabled={viewReview.status === "rejected" || isUpdating}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isUpdating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject Review
                    </Button>
                  </div>

                  {viewReview.status === "approved" && (
                    <p className="mt-3 flex items-start gap-1 text-sm text-green-600">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        This review has been approved and is visible to customers
                      </span>
                    </p>
                  )}

                  {viewReview.status === "rejected" && (
                    <p className="mt-3 flex items-start gap-1 text-sm text-red-600">
                      <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        This review has been rejected and is hidden from customers
                      </span>
                    </p>
                  )}

                  {viewReview.status === "pending" && (
                    <p className="mt-3 flex items-start gap-1 text-sm text-yellow-600">
                      <Clock3 className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>This review is pending approval</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}