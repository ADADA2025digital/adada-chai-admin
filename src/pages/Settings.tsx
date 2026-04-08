import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Palette,
  Save,
} from "lucide-react";

export default function Settings() {
  const [storeName, setStoreName] = useState("YTE Commerce");
  const [email, setEmail] = useState("admin@ytecommerce.com");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [currency, setCurrency] = useState("LKR");
  const [timezone, setTimezone] = useState("Asia/Colombo");
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [darkDashboard, setDarkDashboard] = useState(false);
  const [storeDescription, setStoreDescription] = useState(
    "YTE Commerce is a modern online store offering quality products with fast delivery and easy payments.",
  );
  const [defaultShippingFee, setDefaultShippingFee] = useState("500");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("10000");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [adminLoginEmail, setAdminLoginEmail] = useState(
    "owner@ytecommerce.com",
  );
  const [newPassword, setNewPassword] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [theme, setTheme] = useState("default");

  const tabTriggerClass =
    "h-11 min-w-[110px] flex-1 rounded-2xl border bg-muted/80 px-4 text-xs sm:flex-none sm:text-sm data-[state=active]:shadow-sm";

  const settingRowClass =
    "flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between";

  return (
    <div className="min-h-screen w-full overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">
              Manage your store preferences, payments, shipping, notifications,
              and security.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Badge
              variant="secondary"
              className="w-fit max-w-full rounded-full px-3 py-1 text-xs"
            >
              Admin
            </Badge>

            <Button className="w-full rounded-2xl sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="flex h-auto w-full flex-wrap items-stretch justify-start gap-2 rounded-2xl bg-transparent p-0">
            <TabsTrigger value="general" className={tabTriggerClass}>
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className={tabTriggerClass}>
              Payments
            </TabsTrigger>
            <TabsTrigger value="shipping" className={tabTriggerClass}>
              Shipping
            </TabsTrigger>
            <TabsTrigger value="notifications" className={tabTriggerClass}>
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className={tabTriggerClass}>
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className={tabTriggerClass}>
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="w-full">
            <div className="mt-12 sm:mt-8 lg:mt-4 grid w-full gap-4 sm:gap-6 lg:grid-cols-3">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl lg:col-span-2">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">
                        Store Information
                      </CardTitle>
                      <CardDescription className="break-words">
                        Update your core store details.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input
                        id="store-name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full rounded-2xl"
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="store-email">Support Email</Label>
                      <Input
                        id="store-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl"
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="store-phone">Phone Number</Label>
                      <Input
                        id="store-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-2xl"
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full rounded-2xl">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LKR">LKR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="min-w-0 space-y-2 md:col-span-2">
                      <Label>Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-full rounded-2xl">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Colombo">
                            Asia/Colombo
                          </SelectItem>
                          <SelectItem value="Asia/Kolkata">
                            Asia/Kolkata
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="store-description">Store Description</Label>
                    <Textarea
                      id="store-description"
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl"
                      placeholder="Write a short description about your store"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <CardTitle className="break-words">Quick Status</CardTitle>
                  <CardDescription className="break-words">
                    Overview of your store settings.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                    <span className="text-sm font-medium">Store Status</span>
                    <Badge className="rounded-full">Live</Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                    <span className="text-sm font-medium">Guest Checkout</span>
                    <Badge variant="secondary" className="rounded-full">
                      {guestCheckout ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                    <span className="text-sm font-medium">
                      Default Currency
                    </span>
                    <Badge variant="outline" className="rounded-full">
                      {currency}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                    <span className="text-sm font-medium">Timezone</span>
                    <Badge
                      variant="outline"
                      className="max-w-full rounded-full break-all text-xs"
                    >
                      {timezone}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="w-full">
            <div className="mt-6">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">
                        Payment Methods
                      </CardTitle>
                      <CardDescription className="break-words">
                        Choose and configure available payment options.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        Cash on Delivery
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Allow customers to pay when they receive the order.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={codEnabled}
                        onCheckedChange={setCodEnabled}
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">Stripe</p>
                      <p className="break-words text-sm text-muted-foreground">
                        Accept debit and credit card payments securely.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={stripeEnabled}
                        onCheckedChange={setStripeEnabled}
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">PayPal</p>
                      <p className="break-words text-sm text-muted-foreground">
                        Enable PayPal checkout for international orders.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={paypalEnabled}
                        onCheckedChange={setPaypalEnabled}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="stripe-publishable-key">
                        Stripe Publishable Key
                      </Label>
                      <Input
                        id="stripe-publishable-key"
                        className="w-full rounded-2xl"
                        placeholder="pk_test_xxxxxxxxx"
                        value={stripePublishableKey}
                        onChange={(e) =>
                          setStripePublishableKey(e.target.value)
                        }
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="stripe-secret-key">
                        Stripe Secret Key
                      </Label>
                      <Input
                        id="stripe-secret-key"
                        className="w-full rounded-2xl"
                        placeholder="sk_test_xxxxxxxxx"
                        type="password"
                        value={stripeSecretKey}
                        onChange={(e) => setStripeSecretKey(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shipping */}
          <TabsContent value="shipping" className="w-full">
            <div className="mt-6">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">
                        Shipping Settings
                      </CardTitle>
                      <CardDescription className="break-words">
                        Control delivery zones, fees, and checkout rules.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="default-shipping-fee">
                        Default Shipping Fee
                      </Label>
                      <Input
                        id="default-shipping-fee"
                        className="w-full rounded-2xl"
                        placeholder="500"
                        value={defaultShippingFee}
                        onChange={(e) => setDefaultShippingFee(e.target.value)}
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="free-shipping-threshold">
                        Free Shipping Threshold
                      </Label>
                      <Input
                        id="free-shipping-threshold"
                        className="w-full rounded-2xl"
                        placeholder="10000"
                        value={freeShippingThreshold}
                        onChange={(e) =>
                          setFreeShippingThreshold(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">Guest Checkout</p>
                      <p className="break-words text-sm text-muted-foreground">
                        Allow customers to place orders without creating an
                        account.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={guestCheckout}
                        onCheckedChange={setGuestCheckout}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="delivery-notes">Delivery Notes</Label>
                    <Textarea
                      id="delivery-notes"
                      className="min-h-[120px] w-full rounded-2xl"
                      placeholder="Add shipping policies or special delivery notes here"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="w-full">
            <div className="mt-6">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">
                        Notification Preferences
                      </CardTitle>
                      <CardDescription className="break-words">
                        Choose what alerts and updates you want to receive.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        New Order Alerts
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Receive an alert every time a new order is placed.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={orderAlerts}
                        onCheckedChange={setOrderAlerts}
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        Low Stock Alerts
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Get notified when product stock runs low.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={stockAlerts}
                        onCheckedChange={setStockAlerts}
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        Marketing Emails
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Receive feature updates, offers, and platform tips.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="w-full">
            <div className="mt-6">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">
                        Security & Access
                      </CardTitle>
                      <CardDescription className="break-words">
                        Protect your admin panel and control system access.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="admin-login-email">
                        Admin Login Email
                      </Label>
                      <Input
                        id="admin-login-email"
                        className="w-full rounded-2xl"
                        value={adminLoginEmail}
                        onChange={(e) => setAdminLoginEmail(e.target.value)}
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="change-password">Change Password</Label>
                      <Input
                        id="change-password"
                        className="w-full rounded-2xl"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        Maintenance Mode
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Temporarily disable storefront access for customers.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl border p-4">
                    <p className="break-words font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      Add an extra security layer for admin logins.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 w-full rounded-2xl sm:w-auto"
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="w-full">
            <div className="mt-6">
              <Card className="min-w-0 rounded-2xl shadow-sm sm:rounded-3xl">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-2xl bg-primary/10 p-3">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="break-words">Appearance</CardTitle>
                      <CardDescription className="break-words">
                        Customize the admin experience and dashboard feel.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className={settingRowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">
                        Dark Dashboard Mode
                      </p>
                      <p className="break-words text-sm text-muted-foreground">
                        Switch the admin interface to a dark theme.
                      </p>
                    </div>
                    <div className="self-start sm:self-center">
                      <Switch
                        checked={darkDashboard}
                        onCheckedChange={setDarkDashboard}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setTheme("default")}
                      className={`w-full rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1 sm:rounded-3xl ${
                        theme === "default" ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="mb-4 h-20 rounded-2xl border bg-muted" />
                      <p className="break-words font-medium">Default Theme</p>
                      <p className="break-words text-sm text-muted-foreground">
                        Clean and minimal layout.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`w-full rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1 sm:rounded-3xl ${
                        theme === "dark" ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="mb-4 h-20 rounded-2xl bg-slate-900" />
                      <p className="break-words font-medium">Dark Theme</p>
                      <p className="break-words text-sm text-muted-foreground">
                        Better for low-light work sessions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("soft")}
                      className={`w-full rounded-2xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1 sm:rounded-3xl sm:col-span-2 xl:col-span-1 ${
                        theme === "soft" ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="mb-4 h-20 rounded-2xl border bg-gradient-to-r from-muted to-background" />
                      <p className="break-words font-medium">Soft Theme</p>
                      <p className="break-words text-sm text-muted-foreground">
                        A softer visual style for admins.
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
