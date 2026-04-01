import { useState, useEffect, useRef } from "react";
import {
  Bell,
  BellOff,
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/config/axiosConfig";
import notificationSound from "@/assets/notification.mp3"; 

interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  status: "sent" | "delivered" | "read";
}

interface Sender {
  name: string;
  avatar: string;
  initials: string;
  email: string;
}

interface Notification {
  id: number;
  type: string;
  actor: string;
  action: string;
  target?: string;
  message?: string;
  category: string;
  time: string;
  read: boolean;
  sender: Sender;
  thread?: Message[];
  notification_data?: any;
  notification_type?: string;
}

function MessageThreadView({
  notification,
  onBack,
}: {
  notification: Notification;
  onBack: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const [thread, setThread] = useState<Message[]>(notification.thread || []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(
        `/notifications/${notification.id}/reply`,
        {
          message: newMessage,
        },
      );

      const newMsg: Message = {
        id: response.data.id,
        sender: "me",
        message: newMessage,
        time: "Just now",
        status: "sent",
      };

      setThread([...thread, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-[620px] flex-col bg-white dark:bg-[#0b0b0d]">
      <div className="flex items-center gap-3 border-b border-[#ececec] px-5 py-4 dark:border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.sender.avatar} />
          <AvatarFallback>{notification.sender.initials}</AvatarFallback>
        </Avatar>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreVertical className="h-4 w-4 text-[#6f6f6f] dark:text-zinc-400" />
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4 px-5 py-4 no-scrollbar">
          {thread.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                  message.sender === "me"
                    ? "bg-[#2f80ed] text-white"
                    : "border border-[#eceae6] bg-[#f7f7f7] text-[#2f2f2f] dark:border-white/10 dark:bg-white/5 dark:text-white"
                }`}
              >
                {message.sender !== "me" && (
                  <p className="mb-1 text-xs font-medium text-[#5d5d5d] dark:text-zinc-400">
                    {message.sender}
                  </p>
                )}

                <p className="text-sm leading-6">{message.message}</p>

                <div
                  className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${
                    message.sender === "me"
                      ? "text-white/80"
                      : "text-[#8b8b8b] dark:text-zinc-400"
                  }`}
                >
                  <span>{message.time}</span>
                  {message.sender === "me" && (
                    <>
                      {message.status === "read" ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : message.status === "delivered" ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-[#0b0b0d]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Paperclip className="h-4 w-4 text-[#6f6f6f] dark:text-zinc-400" />
          </Button>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="h-10 flex-1 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
          />

          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-4 border-b border-[#ececec] px-6 py-5 text-left transition-colors dark:border-white/10 ${
        !notification.read
          ? "bg-zinc-100 dark:bg-white/5"
          : "bg-white dark:bg-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={notification.sender.avatar} />
          <AvatarFallback className="bg-[#edf1f7] font-medium text-[#5b6470] dark:bg-white/10 dark:text-zinc-200">
            {notification.sender.initials}
          </AvatarFallback>
        </Avatar>

        {!notification.read && (
          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#21bfd0] dark:border-[#0b0b0d]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-7 text-[#4b4b4b] dark:text-zinc-300">
          <span className="font-semibold text-[#2f2f2f] dark:text-white">
            {notification.actor}
          </span>{" "}
          {notification.action}{" "}
          {notification.target && (
            <span className="font-semibold text-[#2f2f2f] dark:text-white">
              {notification.target}
            </span>
          )}
        </p>

        {notification.message && (
          <p className="mt-1 text-[13px] text-[#6f6f6f] dark:text-zinc-400">
            {notification.message}
          </p>
        )}

        <div className="mt-1 text-[14px] text-[#8d8d8d] dark:text-zinc-400">
          {notification.type} <span className="mx-1">•</span>{" "}
          {notification.time}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 shrink-0 rounded-full p-1 text-[#8f8f8f] hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 rounded-xl border border-zinc-200 bg-white p-1 shadow-md dark:border-white/10 dark:bg-[#111113]"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark as read
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}

export function NotificationToggle() {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [notificationsMuted, setNotificationsMuted] = useState(() => {
    // Load muted state from localStorage on initial render
    const savedMutedState = localStorage.getItem("notificationsMuted");
    return savedMutedState ? JSON.parse(savedMutedState) : false;
  });
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const soundRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousNotificationCount = useRef(0);
  const previousNotifications = useRef<Notification[]>([]);
  const mutedRef = useRef(notificationsMuted);

  // Keep ref in sync with state
  useEffect(() => {
    mutedRef.current = notificationsMuted;
    localStorage.setItem("notificationsMuted", JSON.stringify(notificationsMuted));
  }, [notificationsMuted]);

  const unreadCount = notificationList.filter((item) => !item.read).length;

  // Initialize sound and notification permissions
  useEffect(() => {
    // Initialize sound
    soundRef.current = new Audio(notificationSound);
    soundRef.current.volume = 0.3;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((err) => {
        console.error("Notification permission error:", err);
      });
    }

    // Start polling when component mounts
    startPolling();

    // Handle network changes
    const handleOnline = () => {
      console.log("Connection restored, restarting polling");
      startPolling();
    };

    const handleOffline = () => {
      console.log("Connection lost, pausing polling");
      stopPolling();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      stopPolling();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const startPolling = () => {
    // Clear existing interval if any
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Fetch immediately with background flag
    fetchNotifications(true);

    // Set up polling every 5 seconds
    pollingIntervalRef.current = setInterval(() => fetchNotifications(true), 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const playNotificationSound = () => {
    // Use ref to get current mute state
    if (mutedRef.current) {
      console.log("🔇 Notifications muted, sound disabled");
      return;
    }
    
    try {
      if (soundRef.current) {
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch((e) => {
          console.log("Audio play error:", e);
        });
        console.log("🔔 Playing notification sound");
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    // Use ref to get current mute state
    if (mutedRef.current) {
      console.log("🔇 Notifications muted, browser notification disabled");
      return;
    }
    
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const notificationTitle = notification.actor || "New notification";
        const notificationBody = notification.message || 
          `${notification.action} ${notification.target || ""}`.trim() ||
          "You have a new notification";
        
        const browserNotif = new Notification(notificationTitle, {
          body: notificationBody,
          icon: notification.sender.avatar || "/default-avatar.png",
          tag: `notification-${notification.id}`,
        });

        browserNotif.onclick = () => {
          window.focus();
        };

        setTimeout(() => browserNotif.close(), 5000);
        console.log("🔔 Showing browser notification");
      } catch (error) {
        console.error("Error showing browser notification:", error);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted" && !mutedRef.current) {
          const notificationTitle = notification.actor || "New notification";
          const notificationBody = notification.message || 
            `${notification.action} ${notification.target || ""}`.trim() ||
            "You have a new notification";
          
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: notification.sender.avatar || "/default-avatar.png",
          });
        }
      });
    }
  };

  const processNewNotifications = (newNotifications: Notification[]) => {
    // Check for new notifications that weren't in the previous list
    const previousIds = new Set(previousNotifications.current.map(n => n.id));
    const newNotifs = newNotifications.filter(n => !previousIds.has(n.id));
    
    // Check for unread notifications
    const previousUnreadIds = new Set(
      previousNotifications.current.filter(n => !n.read).map(n => n.id)
    );
    const newUnreadNotifs = newNotifications.filter(
      n => !n.read && !previousUnreadIds.has(n.id)
    );

    // Only play sound and show browser notification if not muted
    if (newUnreadNotifs.length > 0 && !mutedRef.current) {
      console.log(`🔔 ${newUnreadNotifs.length} new unread notifications detected`);
      playNotificationSound();
      
      const latestNotification = newUnreadNotifs[0];
      showBrowserNotification(latestNotification);
      
      if (newUnreadNotifs.length > 1) {
        setTimeout(() => {
          if (Notification.permission === "granted" && !mutedRef.current) {
            new Notification(`${newUnreadNotifs.length} new notifications`, {
              body: `You have ${newUnreadNotifs.length} unread notifications`,
              icon: "/default-avatar.png",
            });
          }
        }, 1000);
      }
    } else if (newUnreadNotifs.length > 0 && mutedRef.current) {
      console.log(`🔇 ${newUnreadNotifs.length} new notifications received but muted`);
    }

    // Update previous notifications reference
    previousNotifications.current = newNotifications;
    previousNotificationCount.current = newNotifications.length;
  };

  const fetchNotifications = async (isBackground = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetching) return;
    
    setIsFetching(true);
    
    // Only show loading spinner for initial load or manual refreshes
    if (!isBackground && !notificationList.length) {
      setLoading(true);
    }
    
    try {
      const response = await api.get("/notifications");

      const notifications = response.data.data.map((notif: any) => {
        const notifData = notif.notification_data || {};

        let actor = "System";
        let action = "sent a notification";
        let notificationType = "General";
        let target = "";
        let message = "";

        if (notif.notification_type === "OrderPlacedNotification") {
          actor = notifData.customer_name || notifData.user_name || notifData.actor || "Customer";
          action = "placed a new order";
          notificationType = "Order";
          target = notifData.order_number ? `Order #${notifData.order_number}` : "";
          message = notifData.message || `A new order has been placed successfully.`;
        } else if (
          notif.notification_type === "ReviewSubmittedNotification" ||
          notif.notification_type?.includes("Review")
        ) {
          actor = notifData.customer_name || notifData.reviewer_name || notifData.user_name || notifData.name || notifData.actor || "Customer";
          action = "submitted a new review";
          notificationType = "Review";
          target = notifData.product_name ? `for ${notifData.product_name}` : "";
          message = notifData.message || notifData.review_text || `A new product review has been submitted.`;
        } else if (notif.notification_type === "PaymentReceivedNotification") {
          actor = notifData.customer_name || notifData.user_name || notifData.actor || "Customer";
          action = "made a payment";
          notificationType = "Payment";
          target = notifData.order_number ? `for Order #${notifData.order_number}` : "";
          message = notifData.message || `Payment has been received successfully.`;
        } else if (notif.notification_type === "ShipmentStatusNotification") {
          actor = notifData.customer_name || notifData.user_name || notifData.actor || "Customer";
          action = "shipment status updated";
          notificationType = "Shipment";
          target = notifData.order_number ? `for Order #${notifData.order_number}` : "";
          message = notifData.message || `Your shipment status has been updated.`;
        } else {
          actor = notifData.customer_name || notifData.reviewer_name || notifData.user_name || notifData.name || notifData.actor || "System";
          action = notifData.action || "sent a notification";
          notificationType = notifData.type || notif.notification_type?.replace("Notification", "") || "General";
          target = notifData.target || "";
          message = notifData.message || notifData.description || "";
        }

        if (!actor || actor === "") {
          actor = "System";
        }

        return {
          id: notif.id,
          type: notificationType,
          actor: actor,
          action: action,
          target: target,
          message: message,
          category: notificationType,
          time: formatTime(notif.created_at),
          read: notif.read_at !== null,
          sender: {
            name: actor,
            avatar: "/avatars/default.png",
            initials: getInitials(actor),
            email: `${actor.toLowerCase().replace(/\s/g, ".")}@example.com`,
          },
          thread: [],
          notification_data: notifData,
          notification_type: notif.notification_type,
        };
      });

      // Only process notifications for background updates
      if (isBackground) {
        processNewNotifications(notifications);
      }
      
      setNotificationList(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    if (!name || name === "System") return "SY";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification.id}/read`);
        // Optimistically update the UI
        setNotificationList((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Revert on error by refreshing
        fetchNotifications(true);
      }
    }
  };

  const handleToggleNotifications = () => {
    setNotificationsMuted((prev) => {
      const newState = !prev;
      console.log(`🔔 Notifications ${newState ? "🔇 MUTED" : "🔊 UNMUTED"}`);
      
      if (newState) {
        console.log("🔇 Notifications muted - click bell icon to unmute");
      } else {
        console.log("🔊 Notifications unmuted - click bell icon to mute");
      }
      
      return newState;
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      // Optimistically update all notifications to read
      setNotificationList((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        })),
      );
      setSelectedNotification((prev) =>
        prev ? { ...prev, read: true } : prev,
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Revert on error by refreshing
      fetchNotifications(true);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await api.delete("/notifications/delete-all");
      setNotificationList([]);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  const handleMarkSingleAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Optimistically update the specific notification
      setNotificationList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      setSelectedNotification((prev) =>
        prev && prev.id === id ? { ...prev, read: true } : prev,
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert on error by refreshing
      fetchNotifications(true);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      // Optimistically remove the notification
      setNotificationList((prev) => prev.filter((item) => item.id !== id));
      setSelectedNotification((prev) => (prev && prev.id === id ? null : prev));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Revert on error by refreshing
      fetchNotifications(true);
    }
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedNotification(null);
        } else {
          // Fetch with background false to show loading only when dropdown opens
          fetchNotifications(false);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          {notificationsMuted ? (
            <BellOff className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}

          {!notificationsMuted && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500/80 px-1 text-[10px] font-semibold text-white shadow-md">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          <span className="sr-only">
            {notificationsMuted ? "Unmute notifications" : "Mute notifications"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[500px] overflow-hidden rounded-[28px] border border-zinc-200 bg-white/95 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b0d]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        {selectedNotification ? (
          <MessageThreadView
            notification={selectedNotification}
            onBack={() => setSelectedNotification(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-8 py-6">
              <div>
                <p className="text-[24px] font-semibold text-zinc-900 dark:text-white">
                  Notifications
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {notificationsMuted
                    ? "Notifications are currently muted"
                    : "Stay updated with the latest activity"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAllAsRead}
                  className="h-11 w-11 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10"
                  title="Mark all as read"
                  disabled={notificationList.length === 0}
                >
                  <CheckCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteAll}
                  className="h-11 w-11 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10"
                  title="Delete all notifications"
                  disabled={notificationList.length === 0}
                >
                  <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
                </Button>

                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className="flex items-center rounded-full p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                  title={notificationsMuted ? "Unmute notifications" : "Mute notifications"}
                >
                  {notificationsMuted ? (
                    <BellOff className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                  ) : (
                    <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="mx-8 border-b border-zinc-200 dark:border-white/10" />

            <div className="h-[400px] overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex h-full min-h-[400px] items-center justify-center px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Loading notifications...
                </div>
              ) : notificationList.length > 0 ? (
                notificationList.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => handleMarkSingleAsRead(notification.id)}
                    onDelete={() => handleDeleteNotification(notification.id)}
                  />
                ))
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No notifications available
                </div>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}