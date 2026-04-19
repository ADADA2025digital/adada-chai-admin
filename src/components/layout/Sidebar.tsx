import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  ClipboardList,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  Gauge,
  List,
  Star,
  Phone,
  Landmark,
  RotateCcw,
  User2,
  CircleHelp,
  BadgePercent,
  CalendarRange,
  Truck,
} from "lucide-react";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import logo from "@/assets/logo.png";

interface SidebarProps {
  onMobileNavigate?: () => void;
}

interface NavItemType {
  name: string;
  icon: any;
  href?: string;
  submenu?: SubmenuItemType[];
}

interface SubmenuItemType {
  name: string;
  href: string;
  icon?: any;
}

interface CountData {
  categories: number;
  products: number;
  orders: number;
  discounts: number;
  transactions: number;
  customers: number;
  reviews: number;
  contacts: number;
  rentRequests: number;
}

const navigation: NavItemType[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    submenu: [{ name: "Overview", href: "/", icon: Gauge }],
  },
  {
    name: "Category",
    icon: Tags,
    submenu: [{ name: "All Category", href: "/admin/category", icon: Tags }],
  },
  {
    name: "Products",
    icon: Package,
    submenu: [
      { name: "All Products", href: "/admin/products", icon: List },
      {
        name: "Manage Discounts",
        href: "/admin/discounts",
        icon: BadgePercent,
      },
    ],
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    submenu: [
      { name: "All Orders", href: "/admin/orders", icon: ClipboardList },
      {
        name: "Product Rent & Lease",
        href: "/admin/rent-lease",
        icon: CalendarRange,
      },
    ],
  },
  {
    name: "Sales",
    icon: Phone,
    submenu: [
      { name: "Transaction", href: "/admin/transactions", icon: Phone },
      { name: "Refund", href: "/admin/refunds", icon: RotateCcw },
    ],
  },
  {
    name: "Customers",
    icon: Users,
    submenu: [
      { name: "All Customers", href: "/admin/customers", icon: Users },
      {
        name: "Customer Reviews",
        href: "/admin/customer-reviews",
        icon: Star,
      },
      {
        name: "Customer Enquiries",
        href: "/admin/contact-enquiries",
        icon: Star,
      },
    ],
  },
  {
    name: "Delivery Charges",
    icon: Truck,
    submenu: [
      {
        name: "Manage Delivery Charge",
        href: "/admin/delivery-charges",
        icon: Truck,
      },
    ],
  },
  {
    name: "Report",
    icon: FileText,
    submenu: [{ name: "All Report", href: "/admin/report", icon: FileText }],
  },
];

const secondaryNavigation: NavItemType[] = [];

function NavItem({
  item,
  isExpanded,
  openItem,
  setOpenItem,
  counts,
  setExpanded,
  autoExpanded,
  setAutoExpanded,
  onMobileNavigate,
}: {
  item: NavItemType;
  isExpanded: boolean;
  openItem: string | null;
  setOpenItem: (name: string | null) => void;
  counts: CountData;
  setExpanded: (expanded: boolean) => void;
  autoExpanded: boolean;
  setAutoExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  onMobileNavigate?: () => void;
}) {
  const location = useLocation();

  const getSubmenuCount = (submenuName: string): number | undefined => {
    switch (submenuName) {
      case "All Category":
        return counts.categories;
      case "All Products":
        return counts.products;
      case "Manage Discounts":
        return counts.discounts;
      case "All Orders":
        return counts.orders;
      case "Product Rent & Lease":
        return counts.rentRequests;
      case "Transaction":
        return counts.transactions;
      case "All Customers":
        return counts.customers;
      case "Customer Reviews":
        return counts.reviews;
      case "Customer Enquiries":
        return counts.contacts;
      default:
        return undefined;
    }
  };

  const getMainItemBadge = (itemName: string): number | undefined => {
    switch (itemName) {
      case "Category":
        return counts.categories;
      case "Products":
        return counts.products;
      case "Orders":
        return counts.orders;
      case "Sales":
        return counts.transactions;
      case "Customers":
        return counts.customers;
      default:
        return undefined;
    }
  };

  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = hasSubmenu
    ? item.submenu?.some((sub) => location.pathname === sub.href)
    : location.pathname === item.href;

  const isOpen = openItem === item.name;

  useEffect(() => {
    if (
      hasSubmenu &&
      item.submenu?.some((sub) => location.pathname === sub.href)
    ) {
      setOpenItem(item.name);
    }
  }, [location.pathname, hasSubmenu, item.submenu, item.name, setOpenItem]);

  const handleToggle = () => {
    if (isExpanded) {
      setOpenItem(isOpen ? null : item.name);
      return;
    }

    setExpanded(true);
    setAutoExpanded(true);
    setOpenItem(item.name);
  };

  if (!hasSubmenu) {
    const itemBadge = getMainItemBadge(item.name);

    return (
      <Link
        to={item.href!}
        onClick={() => {
          if (!isExpanded) {
            setExpanded(true);
            setAutoExpanded(true);
          } else if (autoExpanded) {
            setExpanded(false);
            setAutoExpanded(false);
            setOpenItem(null);
          }

          onMobileNavigate?.();
        }}
        className={cn(
          "group relative flex items-center px-4 py-3 text-[13px] font-medium transition-all duration-300 ease-out",
          isActive
            ? "rounded-full bg-zinc-100 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            : "rounded-2xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-white/65 dark:hover:bg-white/5 dark:hover:text-white",
          !isExpanded && "justify-center px-2 py-3",
        )}
      >
        <item.icon
          className={cn(
            "h-[17px] w-[17px] flex-shrink-0 transition-all duration-300 ease-out",
            isExpanded && "mr-3.5",
            isActive
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-400 group-hover:text-zinc-700 dark:text-white/45 dark:group-hover:text-white/75",
          )}
        />

        <div
          className={cn(
            "flex flex-1 items-center overflow-hidden transition-all duration-300 ease-out",
            isExpanded ? "ml-0 max-w-[220px] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          <span className="flex-1 truncate">{item.name}</span>

          {itemBadge !== undefined && (
            <span
              className={cn(
                "ml-auto px-2 py-0.5 text-[11px] font-medium transition-all duration-300",
                isActive
                  ? "rounded-full bg-zinc-200 text-zinc-700 dark:bg-white/12 dark:text-white/80"
                  : "rounded-md bg-zinc-100 text-zinc-600 dark:bg-white/8 dark:text-white/70",
              )}
            >
              {itemBadge}
            </span>
          )}
        </div>
      </Link>
    );
  }

  const mainBadge = getMainItemBadge(item.name);

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleToggle}
        className={cn(
          "group relative flex w-full items-center px-4 py-3 text-[13px] font-medium transition-all duration-300 ease-out",
          isActive || isOpen
            ? "rounded-full bg-zinc-100 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            : "rounded-2xl text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-white/65 dark:hover:bg-white/5 dark:hover:text-white",
          !isExpanded && "justify-center px-2 py-3",
        )}
      >
        <item.icon
          className={cn(
            "h-[17px] w-[17px] flex-shrink-0 transition-all duration-300 ease-out",
            isExpanded && "mr-3.5",
            isActive || isOpen
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-400 group-hover:text-zinc-700 dark:text-white/45 dark:group-hover:text-white/75",
          )}
        />

        <div
          className={cn(
            "flex flex-1 items-center overflow-hidden transition-all duration-300 ease-out",
            isExpanded ? "ml-0 max-w-[220px] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          <span className="flex-1 truncate text-left">{item.name}</span>

          {mainBadge !== undefined && (
            <span
              className={cn(
                "mr-2 px-2 py-0.5 text-[11px] font-medium transition-all duration-300",
                isActive || isOpen
                  ? "rounded-full bg-zinc-200 text-zinc-700 dark:bg-white/12 dark:text-white/80"
                  : "rounded-md bg-zinc-100 text-zinc-600 dark:bg-white/8 dark:text-white/70",
              )}
            >
              {mainBadge}
            </span>
          )}

          {isOpen ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-all duration-300 dark:text-white/70" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-400 transition-all duration-300 dark:text-white/40" />
          )}
        </div>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded && isOpen
            ? "mt-2 max-h-96 opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        {item.submenu && (
          <div className="relative ml-5 pl-5">
            <div className="absolute bottom-2 left-0 top-2 w-px bg-zinc-200 dark:bg-white/10" />

            <div className="space-y-2.5 pb-1">
              {item.submenu.map((subItem) => {
                const isSubActive = location.pathname === subItem.href;
                const subBadge = getSubmenuCount(subItem.name);

                return (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    onClick={() => {
                      if (autoExpanded) {
                        setExpanded(false);
                        setAutoExpanded(false);
                        setOpenItem(null);
                      }

                      onMobileNavigate?.();
                    }}
                    className={cn(
                      "group flex items-center px-4 py-3 text-[13px] font-medium transition-all duration-300 ease-out",
                      isSubActive
                        ? "rounded-full bg-zinc-100 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-white/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                        : "rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white/85",
                    )}
                  >
                    {subItem.icon && (
                      <subItem.icon
                        className={cn(
                          "mr-3 h-[15px] w-[15px] flex-shrink-0 transition-all duration-300 ease-out",
                          isSubActive
                            ? "text-zinc-900 dark:text-white"
                            : "text-zinc-400 dark:text-white/40",
                        )}
                      />
                    )}
                    <span className="flex-1 truncate">{subItem.name}</span>

                    {subBadge !== undefined && (
                      <span
                        className={cn(
                          "ml-auto px-2 py-0.5 text-[11px] font-medium transition-all duration-300",
                          isSubActive
                            ? "rounded-full bg-zinc-200 text-zinc-700 dark:bg-white/12 dark:text-white/80"
                            : "rounded-md bg-zinc-100 text-zinc-500 dark:bg-white/6 dark:text-white/55",
                        )}
                      >
                        {subBadge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ onMobileNavigate }: SidebarProps) {
  const { isExpanded, setExpanded } = useSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [openItem, setOpenItem] = useState<string | null>(null);
  const [autoExpanded, setAutoExpanded] = useState(false);

  const [counts, setCounts] = useState<CountData>({
    categories: 0,
    products: 0,
    orders: 0,
    discounts: 0,
    transactions: 0,
    customers: 0,
    reviews: 0,
    contacts: 0,
    rentRequests: 0,
  });

  const fetchRentRequestsCount = async (): Promise<number> => {
    try {
      const response = await api.get("/admin/rent/requests");
      const data = response.data;

      if (Array.isArray(data?.data?.rent_requests))
        return data.data.rent_requests.length;
      if (typeof data?.data?.total === "number") return data.data.total;
      if (Array.isArray(data?.rent_requests)) return data.rent_requests.length;
      if (Array.isArray(data?.data?.rentRequests))
        return data.data.rentRequests.length;
      if (Array.isArray(data?.rentRequests)) return data.rentRequests.length;
      if (Array.isArray(data?.data?.data)) return data.data.data.length;
      if (Array.isArray(data?.data?.items)) return data.data.items.length;
      if (Array.isArray(data?.data)) return data.data.length;
      if (typeof data?.total === "number") return data.total;

      return 0;
    } catch {
      return 0;
    }
  };

  const extractCount = (response: any): number => {
    try {
      if (!response) return 0;

      const data = response.data;

      if (Array.isArray(data)) return data.length;
      if (Array.isArray(response)) return response.length;

      if (data && typeof data === "object") {
        if (typeof data.count === "number") return data.count;
        if (typeof data.total === "number") return data.total;
        if (typeof data.totalCount === "number") return data.totalCount;
        if (typeof data.pagination?.total === "number")
          return data.pagination.total;
        if (typeof data.metadata?.total === "number")
          return data.metadata.total;
        if (Array.isArray(data.data)) return data.data.length;
        if (Array.isArray(data.items)) return data.items.length;
        if (Array.isArray(data.results)) return data.results.length;
        if (Array.isArray(data.requests)) return data.requests.length;
        if (Array.isArray(data.rentRequests)) return data.rentRequests.length;
        if (Array.isArray(data.rent_requests)) return data.rent_requests.length;
      }

      return 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const rentRequestsCount = await fetchRentRequestsCount();

      const endpoints = [
        { name: "categories", call: api.get("/categories") },
        { name: "products", call: api.get("/products") },
        { name: "orders", call: api.get("/orders") },
        { name: "discounts", call: api.get("/discounts") },
        { name: "transactions", call: api.get("/transactions") },
        { name: "customers", call: api.get("/customers") },
        { name: "reviews", call: api.get("/reviews") },
        { name: "contacts", call: api.get("/contacts") },
      ];

      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await endpoint.call;
            return { name: endpoint.name, count: extractCount(response) };
          } catch {
            return { name: endpoint.name, count: 0 };
          }
        }),
      );

      setCounts({
        categories: responses.find((r) => r.name === "categories")?.count || 0,
        products: responses.find((r) => r.name === "products")?.count || 0,
        orders: responses.find((r) => r.name === "orders")?.count || 0,
        discounts: responses.find((r) => r.name === "discounts")?.count || 0,
        transactions:
          responses.find((r) => r.name === "transactions")?.count || 0,
        customers: responses.find((r) => r.name === "customers")?.count || 0,
        reviews: responses.find((r) => r.name === "reviews")?.count || 0,
        contacts: responses.find((r) => r.name === "contacts")?.count || 0,
        rentRequests: rentRequestsCount,
      });
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    onMobileNavigate?.();
  };

  const handleProfileClick = () => {
    navigate("/admin/profile");
    onMobileNavigate?.();
  };

  const handleHelpClick = () => {
    navigate("/admin/help");
    onMobileNavigate?.();
  };

  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "No email available";
  const avatarSrc = user?.avatar || "";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden border-r border-zinc-200 bg-white text-zinc-900 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/5 dark:bg-sidebar dark:text-sidebar-foreground",
        isExpanded ? "w-64" : "w-16",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-zinc-200 transition-all duration-300 dark:border-white/5",
          isExpanded ? "px-4" : "justify-center px-2",
        )}
      >
        {isExpanded ? (
          <div className="flex items-center gap-2">
            {/* <Landmark className="h-6 w-6 text-zinc-700 transition-all duration-300 dark:text-white/90" /> */}
            <img src={logo} alt="ADADA Chai Admin" className="h-13 w-18" />

            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              ADADA Chai Admin
            </h2>
          </div>
        ) : (
          // <Landmark className="h-6 w-6 text-zinc-700 transition-all duration-300 dark:text-white/90" />
          <img src={logo} alt="ADADA Chai Admin" className="h-7 w-12" />
        )}
      </div>

      <div className="sidebar-scroll flex-1 overflow-y-auto py-5">
        <nav className={cn("space-y-3", isExpanded ? "px-3" : "px-2")}>
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isExpanded={isExpanded}
              openItem={openItem}
              setOpenItem={setOpenItem}
              counts={counts}
              setExpanded={setExpanded}
              autoExpanded={autoExpanded}
              setAutoExpanded={setAutoExpanded}
              onMobileNavigate={onMobileNavigate}
            />
          ))}
        </nav>

        {secondaryNavigation.length > 0 && (
          <>
            <Separator className="my-4 bg-zinc-200 dark:bg-white/10" />
            <nav className={cn("space-y-3", isExpanded ? "px-3" : "px-2")}>
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href!}
                  onClick={() => onMobileNavigate?.()}
                  className="group flex items-center px-4 py-3 text-[13px] font-medium"
                >
                  <item.icon className="h-[17px] w-[17px]" />
                  {isExpanded && <span className="ml-3">{item.name}</span>}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>

      <div
        className={cn(
          "border-t border-zinc-200 transition-all duration-300 dark:border-sidebar-border",
          isExpanded ? "p-4" : "flex items-center justify-center px-0 py-4",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "outline-none transition-all duration-500 ease-out focus:outline-none",
                isExpanded
                  ? "flex h-12 w-full items-center rounded-md border border-white/60 bg-white px-2 shadow-sm backdrop-blur-xl hover:border-white hover:bg-zinc-50 hover:shadow-md dark:border-white/20 dark:bg-[#1f2329]/95 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.45)] dark:hover:border-white/40 dark:hover:bg-[#22272e] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.52)]"
                  : "flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent",
              )}
            >
              <div
                className={cn(
                  "flex w-full items-center",
                  isExpanded ? "gap-3" : "justify-center",
                )}
              >
                <Avatar className="h-9 w-9 ring-2 ring-blue-200 transition-all duration-300 dark:ring-blue-400/30">
                  <AvatarImage src={avatarSrc} alt={displayName} />
                  <AvatarFallback className="bg-blue-100 text-base font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center overflow-hidden transition-all duration-300 ease-out",
                    isExpanded
                      ? "max-w-[180px] opacity-100"
                      : "max-w-0 opacity-0",
                  )}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="max-w-[120px] truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {displayName}
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 text-zinc-500 transition-all duration-300 dark:text-zinc-400" />
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="w-[280px] rounded-[22px] border border-zinc-200 bg-white/95 p-2 text-zinc-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-sidebar dark:text-white dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="mb-2 flex items-center gap-3 rounded-2xl px-3 py-3">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-400/30">
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className="bg-blue-100 text-base font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {displayEmail}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-2 bg-zinc-200 dark:bg-white/10" />

            <DropdownMenuItem
              onClick={handleProfileClick}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
            >
              <User2 className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleHelpClick}
              className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:text-white dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
            >
              <CircleHelp className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              <span>Help Center</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 bg-zinc-200 dark:bg-white/10" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex h-14 cursor-pointer items-center gap-3 rounded-xl border border-red-200/70 bg-red-50 px-3 text-[15px] font-medium text-red-600 outline-none data-[highlighted]:bg-red-100 data-[highlighted]:text-red-600 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:data-[highlighted]:bg-red-950/30 dark:data-[highlighted]:text-red-400"
            >
              <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
