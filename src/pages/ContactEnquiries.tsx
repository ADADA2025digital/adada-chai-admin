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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  Loader2,
  User,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ContactMessage {
  contact_id: number;
  sender_name: string;
  sender_email: string;
  sender_ph_no: string | null;
  sender_message: string;
  created_at: string;
  updated_at: string;
}

type LoadingState = {
  fetching: boolean;
  refreshing: boolean;
  deleting: boolean;
};

interface AlertState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

export default function ContactEnquiries() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    fetching: true,
    refreshing: false,
    deleting: false,
  });
  const [error, setError] = useState<string | null>(null);

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<number | null>(null);
  const [deleteMessagePreview, setDeleteMessagePreview] = useState<{
    name: string;
    message: string;
    date: string;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 15;

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });

      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const fetchMessages = useCallback(
    async (showLoading = true, showSuccessAlert = false) => {
      try {
        if (showLoading) {
          setLoading((prev) => ({ ...prev, fetching: true }));
        }

        setError(null);

        const response = await api.get("/contacts");

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          setMessages(response.data.data);
          setLastRefreshTime(new Date());

          if (showSuccessAlert) {
            showAlert("success", "Messages refreshed successfully!");
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
        console.error("Error fetching messages:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch contact messages";

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

  const handleDeleteMessage = useCallback(async () => {
    if (!deleteMessageId) return;

    setLoading((prev) => ({ ...prev, deleting: true }));

    try {
      const response = await api.delete(`/contacts/${deleteMessageId}`);

      if (response.data.status === "success") {
        showAlert("success", "Message deleted successfully!");

        const remainingMessages = messages.filter(
          (msg) => msg.contact_id !== deleteMessageId,
        );

        setMessages(remainingMessages);
        setIsDeleteOpen(false);
        setDeleteMessageId(null);
        setDeleteMessagePreview(null);

        if (remainingMessages.length === 0 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete message";

      showAlert("error", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, deleting: false }));
    }
  }, [deleteMessageId, messages, currentPage, showAlert]);

  useEffect(() => {
    fetchMessages(true, false);
  }, [fetchMessages]);

  const formatDateTime = useCallback((date: Date): string => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const formatMessageDate = useCallback(
    (dateString: string): string => {
      const date = new Date(dateString);
      return formatDateTime(date);
    },
    [formatDateTime],
  );

  const filteredMessages = useMemo(() => {
    const q = search.toLowerCase().trim();

    let filtered = messages;

    if (q) {
      filtered = messages.filter((message) => {
        return (
          message.contact_id.toString().includes(q) ||
          message.sender_name.toLowerCase().includes(q) ||
          message.sender_email.toLowerCase().includes(q) ||
          (message.sender_ph_no && message.sender_ph_no.includes(q)) ||
          message.sender_message.toLowerCase().includes(q)
        );
      });
    }

    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [messages, search]);

  const totalMessages = messages.length;

  const recentMessages = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return messages.filter((msg) => new Date(msg.created_at) >= oneWeekAgo)
      .length;
  }, [messages]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMessages.length / messagesPerPage),
  );

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    return filteredMessages.slice(startIndex, endIndex);
  }, [filteredMessages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRefresh = useCallback(async () => {
    setLoading((prev) => ({ ...prev, refreshing: true }));
    await fetchMessages(false, true);
    setSearch("");
    setCurrentPage(1);
    setLoading((prev) => ({ ...prev, refreshing: false }));
  }, [fetchMessages]);

  const handleViewClick = (message: ContactMessage) => {
    setViewMessage(message);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (message: ContactMessage) => {
    if (!message.contact_id) {
      setError("Cannot delete message: Invalid message ID");
      return;
    }

    setDeleteMessageId(message.contact_id);
    setDeleteMessagePreview({
      name: message.sender_name,
      message: message.sender_message,
      date: formatMessageDate(message.created_at),
    });
    setIsDeleteOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading.fetching && messages.length === 0) {
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
            Customer Enquiries
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and respond to customer contact messages and inquiries.
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <h3 className="mt-1 text-2xl font-bold">{totalMessages}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
              <Mail className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Last 7 Days</p>
              <h3 className="mt-1 text-2xl font-bold">{recentMessages}</h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-blue-100 p-3">
              <Calendar className="h-5 w-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">With Phone Number</p>
              <h3 className="mt-1 text-2xl font-bold">
                {messages.filter((msg) => msg.sender_ph_no).length}
              </h3>
            </div>
            <div className="shrink-0 rounded-2xl bg-green-100 p-3">
              <Phone className="h-5 w-5 text-green-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>
              View and manage all customer inquiries.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or message..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="min-w-0">
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedMessages.length > 0 ? (
              paginatedMessages.map((message, index) => (
                <div
                  key={message.contact_id}
                  className="min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        No. {(currentPage - 1) * messagesPerPage + index + 1}
                      </p>
                      <p className="break-words font-medium">
                        {message.sender_name}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewClick(message)}
                        className="h-8 w-8"
                        title="View Full Message"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(message)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Delete Message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {message.sender_email}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {message.sender_ph_no || "—"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Received</p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {formatMessageDate(message.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Message</p>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {message.sender_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8 opacity-50" />
                  <p>No messages found</p>
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
                  <TableHead className="w-20 text-center">No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedMessages.length > 0 ? (
                  paginatedMessages.map((message, index) => (
                    <TableRow key={message.contact_id} className="group">
                      <TableCell className="text-center font-mono text-sm">
                        {(currentPage - 1) * messagesPerPage + index + 1}
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{message.sender_name}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{message.sender_email}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {message.sender_ph_no ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {message.sender_ph_no}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="max-w-[200px] truncate text-sm">
                            {message.sender_message.length > 50
                              ? `${message.sender_message.substring(0, 50)}...`
                              : message.sender_message}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatMessageDate(message.created_at)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(message)}
                            title="View Full Message"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(message)}
                            title="Delete Message"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-8 w-8 opacity-50" />
                        <p>No messages found</p>
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

          {filteredMessages.length > 0 && (
            <div className="mt-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="min-w-0 break-words text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * messagesPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * messagesPerPage,
                    filteredMessages.length,
                  )}
                </span>{" "}
                of <span className="font-medium">{filteredMessages.length}</span>{" "}
                messages
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

      {/* View message dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-x-hidden overflow-y-auto rounded-2xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Complete customer message information.
            </DialogDescription>
          </DialogHeader>

          {viewMessage && (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4" />
                  Sender Information
                </h3>

                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Name
                    </p>
                    <p className="flex items-center gap-2 break-words text-sm font-medium">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {viewMessage.sender_name}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>
                    <p className="flex items-center gap-2 break-all text-sm font-medium">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {viewMessage.sender_email}
                    </p>
                  </div>

                  {viewMessage.sender_ph_no && (
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="flex items-center gap-2 break-words text-sm font-medium">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {viewMessage.sender_ph_no}
                      </p>
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Received Date
                    </p>
                    <p className="flex items-center gap-2 break-words text-sm font-medium">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {formatMessageDate(viewMessage.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <MessageSquare className="h-4 w-4" />
                  Message Content
                </h3>

                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {viewMessage.sender_message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Confirm Delete</DialogTitle>
            </div>

            <DialogDescription className="pt-4 break-words">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteMessagePreview && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium break-words">
                {deleteMessagePreview.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {deleteMessagePreview.date}
              </p>
              <p className="mt-3 text-sm text-muted-foreground break-words line-clamp-3">
                {deleteMessagePreview.message}
              </p>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteMessageId(null);
                setDeleteMessagePreview(null);
              }}
              disabled={loading.deleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={loading.deleting || !deleteMessageId}
              className="w-full sm:w-auto"
            >
              {loading.deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}