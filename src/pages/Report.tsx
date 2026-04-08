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
  FileText,
  CalendarDays,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Users,
  Package,
  Tag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileJson,
  File,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Report Types
type ReportDataType =
  | "categories"
  | "products"
  | "orders"
  | "transactions"
  | "customers";
type ReportFilterType = "all" | "year" | "month" | "date" | "range";

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getStatusClasses = (status: string): string => {
  const value = status?.toLowerCase?.() || "";

  if (
    ["completed", "paid", "success", "delivered", "active"].includes(value)
  ) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (
    ["pending", "processing", "inactive", "draft", "proccessing"].includes(
      value,
    )
  ) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (["failed", "cancelled", "refunded", "deleted"].includes(value)) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-muted text-muted-foreground border-border";
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export default function BusinessReports() {
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState<ReportDataType>("orders");
  const [filterType, setFilterType] = useState<ReportFilterType>("all");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const showAlert = useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    filterType,
    selectedYear,
    selectedMonth,
    selectedDate,
    startDate,
    endDate,
    reportType,
  ]);

  const reportConfig = useMemo(
    () => ({
      categories: {
        title: "Categories Report",
        description: "View and analyze product categories with product counts",
        icon: Tag,
        columns: [
          { key: "no", label: "No" },
          { key: "name", label: "Category Name" },
          { key: "description", label: "Description" },
          {
            key: "productCount",
            label: "Total Products",
            format: (v: any) => v?.toString() || "0",
          },
          {
            key: "activeProducts",
            label: "Active Products",
            format: (v: any) => v?.toString() || "0",
          },
          {
            key: "inactiveProducts",
            label: "Inactive Products",
            format: (v: any) => v?.toString() || "0",
          },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created Date" },
        ],
        transformData: (item: any, index: number) => {
          const productsInCategory = productsData.filter((product: any) => {
            const categoryId = product.c_id || product.category_id;
            const itemId = item.c_id || item.id;
            return categoryId === itemId;
          });

          const activeProducts = productsInCategory.filter((product: any) => {
            const status = product.product_status || product.status;
            return status === "active" || status === "Active";
          }).length;

          const inactiveProducts = productsInCategory.filter((product: any) => {
            const status = product.product_status || product.status;
            return (
              status === "inactive" ||
              status === "Inactive" ||
              status === "draft"
            );
          }).length;

          return {
            no: index + 1,
            name: item.category_name || item.name,
            description: item.category_description || item.description || "-",
            productCount: productsInCategory.length,
            activeProducts,
            inactiveProducts,
            status: item.status || "active",
            createdAt: item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "-",
            sourceType: "Category",
            sourceId: item.c_id || item.id,
            sourceDate: item.created_at,
            sourceName: item.category_name || item.name,
            sourceStatus: item.status || "active",
          };
        },
        summaryFields: [
          {
            key: "totalCategories",
            label: "Total Categories",
            icon: Tag,
            color: "text-purple-700 bg-purple-100",
          },
          {
            key: "totalProducts",
            label: "Total Products",
            icon: Package,
            color: "text-blue-700 bg-blue-100",
          },
          {
            key: "activeCategories",
            label: "Active Categories",
            icon: FileText,
            color: "text-green-700 bg-green-100",
          },
        ],
      },
      products: {
        title: "Products Report",
        description: "View and analyze product inventory",
        icon: Package,
        columns: [
          { key: "no", label: "No" },
          { key: "name", label: "Product Name" },
          { key: "category", label: "Category" },
          {
            key: "buyPrice",
            label: "Buy Price",
            format: (v: any) => `$${Number(v).toFixed(2)}`,
          },
          {
            key: "sellPrice",
            label: "Sell Price",
            format: (v: any) => `$${Number(v).toFixed(2)}`,
          },
          {
            key: "discount",
            label: "Discount",
            format: (v: any) => (v ? `$${Number(v).toFixed(2)}` : "-"),
          },
          { key: "stock", label: "Stock" },
          { key: "description", label: "Description" },
          { key: "specifications", label: "Specifications" },
          { key: "status", label: "Status" },
        ],
        transformData: (item: any, index: number) => ({
          no: index + 1,
          name: item.product_name || item.name,
          category: item.category?.category_name || item.category_name || "-",
          buyPrice: parseFloat(item.buy_price) || 0,
          sellPrice: parseFloat(item.sell_price) || parseFloat(item.price) || 0,
          discount: item.discount ? parseFloat(item.discount) : null,
          stock: item.quantity || item.stock || 0,
          description: item.description || "-",
          specifications: item.specification || "-",
          status: item.product_status || item.status || "active",
          sourceType: "Product",
          sourceId: item.product_id || item.p_id || item.id,
          sourceDate: item.created_at,
          sourceName: item.product_name || item.name,
          sourceStatus: item.product_status || item.status || "active",
          sourceAmount:
            parseFloat(item.sell_price) || parseFloat(item.price) || 0,
        }),
        summaryFields: [
          {
            key: "totalProducts",
            label: "Total Products",
            icon: Package,
            color: "text-blue-700 bg-blue-100",
          },
          {
            key: "totalStock",
            label: "Total Stock",
            icon: Package,
            color: "text-indigo-700 bg-indigo-100",
          },
          {
            key: "totalValue",
            label: "Total Inventory Value",
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-100",
          },
          {
            key: "activeProducts",
            label: "Active Products",
            icon: FileText,
            color: "text-green-700 bg-green-100",
          },
        ],
      },
      orders: {
        title: "Orders Report",
        description: "View and analyze customer orders",
        icon: ShoppingCart,
        columns: [
          { key: "no", label: "No" },
          { key: "orderId", label: "Order ID" },
          { key: "customer", label: "Customer Name" },
          {
            key: "total",
            label: "Total Amount",
            format: (v: any) => `$${Number(v).toFixed(2)}`,
          },
          { key: "orderStatus", label: "Order Status" },
          { key: "paymentStatus", label: "Payment Status" },
          { key: "orderDate", label: "Order Date" },
        ],
        transformData: (item: any, index: number) => {
          let customerName = "-";
          if (item.customer) {
            customerName =
              item.customer.full_name ||
              item.customer.name ||
              item.customer.customer_name ||
              item.customer.userName ||
              JSON.stringify(item.customer);
          } else if (item.customer_name) {
            customerName = item.customer_name;
          } else if (item.full_name) {
            customerName = item.full_name;
          } else if (item.userName) {
            customerName = item.userName;
          } else if (item.name) {
            customerName = item.name;
          }

          let totalAmount = 0;
          if (item.total_amount) totalAmount = parseFloat(item.total_amount);
          else if (item.total) totalAmount = parseFloat(item.total);
          else if (item.amount) totalAmount = parseFloat(item.amount);

          if (totalAmount === 0 && item.items && Array.isArray(item.items)) {
            totalAmount = item.items.reduce((sum: number, orderItem: any) => {
              const price = parseFloat(
                orderItem.order_price ||
                  orderItem.price ||
                  orderItem.unit_price ||
                  orderItem.product_price ||
                  0,
              );
              const quantity = parseInt(
                orderItem.quantity ||
                  orderItem.qty ||
                  orderItem.quantity_ordered ||
                  0,
              );
              return sum + price * quantity;
            }, 0);
          }

          if (totalAmount === 0 && item.transaction) {
            if (item.transaction.amount) {
              totalAmount = parseFloat(item.transaction.amount);
            } else if (item.transaction.total) {
              totalAmount = parseFloat(item.transaction.total);
            }
          }

          let orderDate = "-";
          const dateValue =
            item.order_date || item.orderDate || item.created_at || item.date;
          if (dateValue) {
            try {
              orderDate = new Date(dateValue).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            } catch {
              orderDate = dateValue;
            }
          }

          let orderId = "-";
          if (item.order_number) orderId = item.order_number;
          else if (item.order_id) orderId = item.order_id;
          else if (item.o_id) orderId = `ORD-${item.o_id}`;
          else if (item.id) orderId = `ORD-${item.id}`;

          return {
            no: index + 1,
            orderId,
            customer: customerName,
            total: totalAmount,
            orderStatus: item.order_status || item.status || "pending",
            paymentStatus: item.payment_status || "N/A",
            orderDate,
            sourceType: "Order",
            sourceId: item.o_id || item.id,
            sourceDate: item.order_date || item.orderDate || item.created_at,
            sourceName: customerName,
            sourceStatus: item.order_status || item.status || "pending",
            sourceAmount: totalAmount,
          };
        },
        summaryFields: [
          {
            key: "totalOrders",
            label: "Total Orders",
            icon: ShoppingCart,
            color: "text-blue-700 bg-blue-100",
          },
          {
            key: "totalRevenue",
            label: "Total Revenue",
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-100",
          },
          {
            key: "avgOrderValue",
            label: "Avg Order Value",
            icon: TrendingUp,
            color: "text-purple-700 bg-purple-100",
          },
          {
            key: "pendingOrders",
            label: "Pending Orders",
            icon: Clock,
            color: "text-yellow-700 bg-yellow-100",
          },
        ],
      },
      transactions: {
        title: "Transactions Report",
        description: "View and analyze financial transactions",
        icon: CreditCard,
        columns: [
          { key: "no", label: "No" },
          { key: "transactionId", label: "Transaction ID" },
          { key: "customer", label: "Customer" },
          {
            key: "amount",
            label: "Amount",
            format: (v: any) => `$${Number(v).toFixed(2)}`,
          },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date" },
        ],
        transformData: (item: any, index: number) => {
          let transactionId = "-";
          if (item.trans_number) transactionId = item.trans_number;
          else if (item.transaction_number)
            transactionId = item.transaction_number;
          else if (item.t_id) transactionId = `TXN-${item.t_id}`;
          else if (item.id) transactionId = `TXN-${item.id}`;

          let customerName = "-";
          if (item.order?.customer) {
            customerName =
              item.order.customer.full_name ||
              item.order.customer.name ||
              item.order.customer.customer_name ||
              "-";
          } else if (item.customer) {
            customerName =
              item.customer.full_name ||
              item.customer.name ||
              item.customer.customer_name ||
              "-";
          } else if (item.customer_name) {
            customerName = item.customer_name;
          } else if (item.full_name) {
            customerName = item.full_name;
          }

          let amount = 0;
          if (item.amount) amount = parseFloat(item.amount);
          else if (item.total_amount) amount = parseFloat(item.total_amount);
          else if (item.total) amount = parseFloat(item.total);

          if (amount === 0 && item.order) {
            if (item.order.total_amount) {
              amount = parseFloat(item.order.total_amount);
            } else if (item.order.items) {
              amount = item.order.items.reduce(
                (sum: number, i: any) =>
                  sum + (i.order_price || i.price || 0) * (i.quantity || 0),
                0,
              );
            }
          }

          let paymentType = "N/A";
          if (item.payment_method) paymentType = item.payment_method;
          else if (item.type) paymentType = item.type;
          else if (item.payment_type) paymentType = item.payment_type;

          let paymentStatus = "pending";
          if (item.payment_status) paymentStatus = item.payment_status;
          else if (item.status) paymentStatus = item.status;

          let transactionDate = "-";
          const dateValue =
            item.created_at || item.transaction_date || item.date;
          if (dateValue) {
            try {
              transactionDate = new Date(dateValue).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              );
            } catch {
              transactionDate = dateValue;
            }
          }

          return {
            no: index + 1,
            transactionId,
            customer: customerName,
            amount,
            type: paymentType,
            status: paymentStatus,
            date: transactionDate,
            sourceType: "Transaction",
            sourceId: item.t_id || item.id,
            sourceDate: item.created_at || item.transaction_date,
            sourceName: customerName,
            sourceStatus: paymentStatus,
            sourceAmount: amount,
          };
        },
        summaryFields: [
          {
            key: "totalTransactions",
            label: "Total Transactions",
            icon: CreditCard,
            color: "text-violet-700 bg-violet-100",
          },
          {
            key: "totalAmount",
            label: "Total Amount",
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-100",
          },
          {
            key: "completedAmount",
            label: "Completed Amount",
            icon: TrendingUp,
            color: "text-green-700 bg-green-100",
          },
          {
            key: "pendingAmount",
            label: "Pending Amount",
            icon: Clock,
            color: "text-yellow-700 bg-yellow-100",
          },
        ],
      },
      customers: {
        title: "Customers Report",
        description:
          "View and analyze customer data with order statistics",
        icon: Users,
        columns: [
          { key: "no", label: "No" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone Number" },
          {
            key: "totalSpent",
            label: "Total Spent",
            format: (v: any) => `$${Number(v).toFixed(2)}`,
          },
          { key: "ordersCount", label: "Total Orders" },
          { key: "completedOrders", label: "Completed Orders" },
          { key: "pendingOrders", label: "Pending Orders" },
          { key: "status", label: "Status" },
          { key: "registeredDate", label: "Registered Date" },
        ],
        transformData: (item: any, index: number) => {
          let totalSpent = 0;
          let totalOrders = 0;
          let completedOrders = 0;
          let pendingOrders = 0;

          if (item.orders && Array.isArray(item.orders)) {
            totalOrders = item.orders.length;

            item.orders.forEach((order: any) => {
              let orderTotal = 0;

              if (order.total_amount) {
                orderTotal = parseFloat(order.total_amount);
              } else if (order.total) {
                orderTotal = parseFloat(order.total);
              } else if (order.amount) {
                orderTotal = parseFloat(order.amount);
              }

              if (orderTotal === 0 && order.items && Array.isArray(order.items)) {
                orderTotal = order.items.reduce((sum: number, orderItem: any) => {
                  const price = parseFloat(orderItem.order_price || orderItem.price || 0);
                  const quantity = parseInt(orderItem.quantity || 0);
                  return sum + price * quantity;
                }, 0);
              }

              totalSpent += orderTotal;

              const orderStatus = order.order_status || order.status;
              if (
                orderStatus === "completed" ||
                orderStatus === "delivered" ||
                orderStatus === "paid" ||
                orderStatus === "success"
              ) {
                completedOrders++;
              } else if (
                orderStatus === "pending" ||
                orderStatus === "processing" ||
                orderStatus === "proccessing"
              ) {
                pendingOrders++;
              }
            });
          }

          let phoneNumber = "-";
          if (item.ph_number) phoneNumber = item.ph_number;
          else if (item.phone) phoneNumber = item.phone;
          else if (item.phone_number) phoneNumber = item.phone_number;

          let registeredDate = "-";
          const dateValue = item.created_at || item.registered_at;
          if (dateValue) {
            try {
              registeredDate = new Date(dateValue).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
            } catch {
              registeredDate = dateValue;
            }
          }

          let customerStatus = "inactive";
          if (item.status) customerStatus = item.status;
          else if (item.is_active !== undefined)
            customerStatus = item.is_active ? "active" : "inactive";
          else if (totalOrders > 0) customerStatus = "active";

          return {
            no: index + 1,
            name: item.full_name || item.name || item.userName || "-",
            email: item.email || "-",
            phone: phoneNumber,
            totalSpent,
            ordersCount: totalOrders,
            completedOrders,
            pendingOrders,
            status: customerStatus,
            registeredDate,
            sourceType: "Customer",
            sourceId: item.customer_id || item.id,
            sourceDate: item.created_at,
            sourceName: item.full_name || item.name || item.userName || "-",
            sourceStatus: customerStatus,
            sourceAmount: totalSpent,
          };
        },
        summaryFields: [
          {
            key: "totalCustomers",
            label: "Total Customers",
            icon: Users,
            color: "text-blue-700 bg-blue-100",
          },
          {
            key: "totalRevenue",
            label: "Total Revenue",
            icon: DollarSign,
            color: "text-emerald-700 bg-emerald-100",
          },
          {
            key: "avgSpent",
            label: "Avg Customer Spent",
            icon: TrendingUp,
            color: "text-purple-700 bg-purple-100",
          },
          {
            key: "activeCustomers",
            label: "Active Customers",
            icon: FileText,
            color: "text-green-700 bg-green-100",
          },
        ],
      },
    }),
    [productsData],
  );

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        categoriesRes,
        productsRes,
        ordersRes,
        transactionsRes,
        customersRes,
      ] = await Promise.allSettled([
        api.get("/categories"),
        api.get("/products"),
        api.get("/orders"),
        api.get("/transactions"),
        api.get("/customers"),
      ]);

      let hasErrors = false;
      const failedEndpoints: string[] = [];

      if (categoriesRes.status === "fulfilled") {
        let result = [];
        if (categoriesRes.value.data?.data) result = categoriesRes.value.data.data;
        else if (Array.isArray(categoriesRes.value.data)) result = categoriesRes.value.data;
        else if (categoriesRes.value.data?.categories) result = categoriesRes.value.data.categories;
        setCategoriesData(result);
      } else {
        setCategoriesData([]);
        hasErrors = true;
        failedEndpoints.push("Categories");
      }

      if (productsRes.status === "fulfilled") {
        let result = [];
        if (productsRes.value.data?.data) result = productsRes.value.data.data;
        else if (Array.isArray(productsRes.value.data)) result = productsRes.value.data;
        else if (productsRes.value.data?.products) result = productsRes.value.data.products;
        setProductsData(result);
      } else {
        setProductsData([]);
        hasErrors = true;
        failedEndpoints.push("Products");
      }

      if (ordersRes.status === "fulfilled") {
        let result = [];
        if (ordersRes.value.data?.data) result = ordersRes.value.data.data;
        else if (Array.isArray(ordersRes.value.data)) result = ordersRes.value.data;
        else if (ordersRes.value.data?.orders) result = ordersRes.value.data.orders;
        setOrdersData(result);
      } else {
        setOrdersData([]);
        hasErrors = true;
        failedEndpoints.push("Orders");
      }

      if (transactionsRes.status === "fulfilled") {
        let result = [];
        if (transactionsRes.value.data?.data) result = transactionsRes.value.data.data;
        else if (Array.isArray(transactionsRes.value.data)) result = transactionsRes.value.data;
        else if (transactionsRes.value.data?.transactions) result = transactionsRes.value.data.transactions;
        setTransactionsData(result);
      } else {
        setTransactionsData([]);
        hasErrors = true;
        failedEndpoints.push("Transactions");
      }

      if (customersRes.status === "fulfilled") {
        let result = [];
        if (customersRes.value.data?.data) result = customersRes.value.data.data;
        else if (Array.isArray(customersRes.value.data)) result = customersRes.value.data;
        else if (customersRes.value.data?.customers) result = customersRes.value.data.customers;
        setCustomersData(result);
      } else {
        setCustomersData([]);
        hasErrors = true;
        failedEndpoints.push("Customers");
      }

      setLastRefreshTime(new Date());

      if (hasErrors) {
        const errorMessage = `Failed to fetch: ${failedEndpoints.join(", ")}. Please try again.`;
        showAlert("error", errorMessage);
        setError(errorMessage);
      } else {
        showAlert("success", "All data refreshed successfully!");
      }
    } catch {
      const errorMessage = "Failed to load report data. Please try again.";
      showAlert("error", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterType("all");
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAllData();
    clearFilters();
    setIsRefreshing(false);
  }, [fetchAllData, clearFilters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const currentData = useMemo(() => {
    let rawData: any[] = [];

    switch (reportType) {
      case "categories":
        rawData = categoriesData;
        break;
      case "products":
        rawData = productsData;
        break;
      case "orders":
        rawData = ordersData;
        break;
      case "transactions":
        rawData = transactionsData;
        break;
      case "customers":
        rawData = customersData;
        break;
    }

    return rawData.map((item: any, index: number) => ({
      ...reportConfig[reportType].transformData(item, index),
      originalIndex: index,
    }));
  }, [
    reportType,
    categoriesData,
    productsData,
    ordersData,
    transactionsData,
    customersData,
    reportConfig,
  ]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return currentData.filter((item: any) => {
      const itemDate = item.sourceDate ? new Date(item.sourceDate) : null;
      const itemYear =
        itemDate && !isNaN(itemDate.getTime())
          ? String(itemDate.getFullYear())
          : "";
      const itemMonth =
        itemDate && !isNaN(itemDate.getTime())
          ? String(itemDate.getMonth() + 1).padStart(2, "0")
          : "";
      const itemDateString =
        itemDate && !isNaN(itemDate.getTime())
          ? itemDate.toISOString().split("T")[0]
          : "";

      let matchesSearch = true;
      if (q) {
        matchesSearch = Object.values(item).some(
          (value) => value && value.toString().toLowerCase().includes(q),
        );
      }

      let matchesFilter = true;

      if (filterType === "year") {
        matchesFilter = selectedYear ? itemYear === selectedYear : true;
      }

      if (filterType === "month") {
        matchesFilter =
          (selectedYear ? itemYear === selectedYear : true) &&
          (selectedMonth ? itemMonth === selectedMonth : true);
      }

      if (filterType === "date") {
        matchesFilter = selectedDate ? itemDateString === selectedDate : true;
      }

      if (filterType === "range") {
        matchesFilter =
          (!startDate || (itemDateString && itemDateString >= startDate)) &&
          (!endDate || (itemDateString && itemDateString <= endDate));
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    currentData,
    search,
    filterType,
    selectedYear,
    selectedMonth,
    selectedDate,
    startDate,
    endDate,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const summaryMetrics = useMemo(() => {
    const metrics: Record<string, number> = {};

    switch (reportType) {
      case "categories":
        metrics.totalCategories = currentData.length;
        metrics.totalProducts = currentData.reduce(
          (sum, item) => sum + (item.productCount || 0),
          0,
        );
        metrics.activeCategories = currentData.filter(
          (item) => item.status === "active",
        ).length;
        break;

      case "products":
        metrics.totalProducts = currentData.length;
        metrics.totalStock = currentData.reduce(
          (sum, item) => sum + (item.stock || 0),
          0,
        );
        metrics.totalValue = currentData.reduce(
          (sum, item) => sum + (item.sellPrice || 0) * (item.stock || 0),
          0,
        );
        metrics.activeProducts = currentData.filter(
          (item) => item.status === "active",
        ).length;
        break;

      case "orders":
        metrics.totalOrders = currentData.length;
        metrics.totalRevenue = currentData.reduce(
          (sum, item) => sum + (item.total || 0),
          0,
        );
        metrics.avgOrderValue =
          metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0;
        metrics.pendingOrders = currentData.filter(
          (item) => item.orderStatus === "pending",
        ).length;
        break;

      case "transactions":
        metrics.totalTransactions = currentData.length;
        metrics.totalAmount = currentData.reduce(
          (sum, item) => sum + (item.amount || 0),
          0,
        );
        metrics.completedAmount = currentData
          .filter(
            (item) =>
              item.status === "completed" ||
              item.status === "success" ||
              item.status === "paid",
          )
          .reduce((sum, item) => sum + (item.amount || 0), 0);
        metrics.pendingAmount = currentData
          .filter((item) => item.status === "pending")
          .reduce((sum, item) => sum + (item.amount || 0), 0);
        break;

      case "customers":
        metrics.totalCustomers = currentData.length;
        metrics.totalRevenue = currentData.reduce(
          (sum, item) => sum + (item.totalSpent || 0),
          0,
        );
        metrics.avgSpent =
          metrics.totalCustomers > 0
            ? metrics.totalRevenue / metrics.totalCustomers
            : 0;
        metrics.activeCustomers = currentData.filter(
          (item) => item.status === "active",
        ).length;
        break;
    }

    return metrics;
  }, [currentData, reportType]);

  const prepareExportData = () => {
    const config = reportConfig[reportType];
    return filteredData.map((item: any) => {
      const row: Record<string, any> = {};
      config.columns.forEach((col) => {
        let value = item[col.key];
        if (col.format && value !== undefined) {
          value = col.format(value);
        }
        row[col.label] =
          value !== undefined && value !== null ? value : "-";
      });
      return row;
    });
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      const exportData = prepareExportData();

      if (exportData.length === 0) {
        showAlert("error", "No data to export");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const maxWidths = Object.keys(exportData[0] || {}).reduce(
        (acc: any, key) => {
          const maxLength = Math.max(
            key.length,
            ...exportData.map((row) => String(row[key]).length),
          );
          acc[key] = { wch: Math.min(maxLength + 2, 50) };
          return acc;
        },
        {},
      );
      worksheet["!cols"] = Object.values(maxWidths);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType}_report`);
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      XLSX.writeFile(workbook, `${reportType}_report_${timestamp}.xlsx`);

      showAlert(
        "success",
        `Exported ${exportData.length} records to Excel successfully!`,
      );
    } catch {
      showAlert("error", "Failed to export to Excel. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      const exportData = prepareExportData();

      if (exportData.length === 0) {
        showAlert("error", "No data to export");
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              if (
                typeof value === "string" &&
                (value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n"))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");

      link.setAttribute("href", url);
      link.setAttribute("download", `${reportType}_report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showAlert(
        "success",
        `Exported ${exportData.length} records to CSV successfully!`,
      );
    } catch {
      showAlert("error", "Failed to export to CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      const exportData = prepareExportData();

      if (exportData.length === 0) {
        showAlert("error", "No data to export");
        return;
      }

      const doc = new jsPDF("landscape", "mm", "a4");
      const config = reportConfig[reportType];
      const timestamp = new Date().toLocaleString();

      doc.setFontSize(18);
      doc.text(config.title, 14, 15);

      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 14, 25);
      doc.text(`Report Type: ${config.title}`, 14, 30);
      doc.text(`Total Records: ${exportData.length}`, 14, 35);

      let filterInfo = "";
      if (filterType === "year" && selectedYear)
        filterInfo = `Year: ${selectedYear}`;
      else if (filterType === "month" && selectedYear && selectedMonth)
        filterInfo = `Month: ${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`;
      else if (filterType === "date" && selectedDate)
        filterInfo = `Date: ${selectedDate}`;
      else if (filterType === "range" && startDate && endDate)
        filterInfo = `Range: ${startDate} to ${endDate}`;
      else if (filterType === "all") filterInfo = "All Records";

      if (filterInfo) doc.text(`Filters: ${filterInfo}`, 14, 40);

      const headers = config.columns.map((col) => col.label);
      const tableData = exportData.map((row) =>
        headers.map((header) => String(row[header])),
      );

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 45, left: 10, right: 10 },
      });

      const finalY =
        (doc as any).lastAutoTable.finalY || 45 + tableData.length * 10;

      doc.setFontSize(10);
      doc.text("Summary Metrics:", 14, finalY + 10);

      let summaryY = finalY + 15;
      config.summaryFields.forEach((field) => {
        let value = summaryMetrics[field.key];
        let formattedValue: string | number = value;

        if (
          field.key === "avgOrderValue" ||
          field.key === "avgSpent" ||
          field.key === "totalValue"
        ) {
          formattedValue = `$${value?.toFixed(2) || 0}`;
        } else if (
          field.key === "totalAmount" ||
          field.key === "totalRevenue" ||
          field.key === "completedAmount" ||
          field.key === "pendingAmount"
        ) {
          formattedValue = `$${value?.toLocaleString() || 0}`;
        } else {
          formattedValue = value?.toLocaleString() || 0;
        }

        doc.text(`${field.label}: ${formattedValue}`, 14, summaryY);
        summaryY += 5;
      });

      const timestampFormatted = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      doc.save(`${reportType}_report_${timestampFormatted}.pdf`);

      showAlert(
        "success",
        `Exported ${exportData.length} records to PDF successfully!`,
      );
    } catch {
      showAlert("error", "Failed to export to PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const config = reportConfig[reportType];
  const Icon = config.icon;

  if (isLoading && currentData.length === 0) {
    return (
      <div className="space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
        {alert.show && (
          <div className="fixed right-3 top-16 z-50 w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
            <Alert
              variant={alert.type === "success" ? "success" : "error"}
            >
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
          <Alert variant={alert.type === "success" ? "success" : "error"}>
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

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                {config.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>

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
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={filteredData.length === 0 || isExporting}
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={exportToExcel}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                <span>Export as Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToCSV}
                className="cursor-pointer"
              >
                <FileJson className="mr-2 h-4 w-4 text-blue-600" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToPDF}
                className="cursor-pointer"
              >
                <File className="mr-2 h-4 w-4 text-red-600" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.summaryFields.map((field) => (
          <Card key={field.key} className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <h3 className="mt-1 text-2xl font-bold">
                  {field.key === "avgOrderValue" ||
                  field.key === "avgSpent" ||
                  field.key === "totalValue"
                    ? `$${summaryMetrics[field.key]?.toFixed(2) || 0}`
                    : summaryMetrics[field.key]?.toLocaleString() || 0}
                </h3>
              </div>
              <div className={cn("rounded-2xl p-3", field.color)}>
                <field.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter panel */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Filter reports by type, date range, and search criteria.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value as ReportDataType)
                }
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="categories">Categories</option>
                <option value="products">Products</option>
                <option value="orders">Orders</option>
                <option value="transactions">Transactions</option>
                <option value="customers">Customers</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${reportType}...`}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter Mode</label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as ReportFilterType)
                }
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Data</option>
                <option value="year">Year Wise</option>
                <option value="month">Month Wise</option>
                <option value="date">Date Wise</option>
                <option value="range">Date Range</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                placeholder="2024"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!(filterType === "year" || filterType === "month")}
              />
            </div>

            {filterType === "month" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filterType === "date" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {filterType === "range" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result table/card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle>Generated Report</CardTitle>
            <CardDescription>{filteredData.length} records found</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {filterType === "all" && "Showing all records"}
            {filterType === "year" && `Year: ${selectedYear || "All"}`}
            {filterType === "month" &&
              `Year: ${selectedYear || "All"} / Month: ${
                months.find((m) => m.value === selectedMonth)?.label || "All"
              }`}
            {filterType === "date" &&
              `Date: ${selectedDate || "Not selected"}`}
            {filterType === "range" &&
              `Range: ${startDate || "Start"} to ${endDate || "End"}`}
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedData.length > 0 ? (
              paginatedData.map((item: any, index: number) => (
                <div
                  key={`${reportType}-${item.sourceId || item.id}-${index}`}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        #{item.no}
                      </p>
                      <p className="break-words font-medium">
                        {item.sourceName || item.name || item.orderId || item.transactionId || "-"}
                      </p>
                    </div>

                    {(item.status || item.orderStatus || item.paymentStatus) && (
                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                          getStatusClasses(
                            item.status || item.orderStatus || item.paymentStatus,
                          ),
                        )}
                      >
                        {item.status || item.orderStatus || item.paymentStatus}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {config.columns
                      .filter((col) => col.key !== "no")
                      .map((col) => (
                        <div
                          key={col.key}
                          className="rounded-lg bg-muted/40 p-3"
                        >
                          <p className="text-xs text-muted-foreground">
                            {col.label}
                          </p>
                          <p className="mt-1 break-words text-sm text-muted-foreground">
                            {col.key === "orderStatus" ||
                            col.key === "paymentStatus" ||
                            col.key === "status" ? (
                              <span
                                className={cn(
                                  "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                                  getStatusClasses(item[col.key]),
                                )}
                              >
                                {item[col.key] || "-"}
                              </span>
                            ) : col.format ? (
                              col.format(item[col.key])
                            ) : item[col.key] !== undefined &&
                              item[col.key] !== null ? (
                              String(item[col.key])
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8 opacity-50" />
                  <p>No data found for the selected filters.</p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item: any, index: number) => (
                    <TableRow
                      key={`${reportType}-${item.sourceId || item.id}-${index}`}
                    >
                      {config.columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.key === "orderStatus" ||
                          col.key === "paymentStatus" ||
                          col.key === "status" ? (
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                                getStatusClasses(item[col.key]),
                              )}
                            >
                              {item[col.key] || "-"}
                            </span>
                          ) : col.format ? (
                            col.format(item[col.key])
                          ) : item[col.key] !== undefined &&
                            item[col.key] !== null ? (
                            item[col.key]
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={config.columns.length}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No data found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span>{" "}
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      page = currentPage - 2 + i;
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
    </div>
  );
}