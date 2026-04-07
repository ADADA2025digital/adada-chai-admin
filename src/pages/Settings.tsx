import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Store, CreditCard, Truck, Bell, Shield, Palette, Save } from "lucide-react";

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

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border bg-muted/30 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your store preferences, payments, shipping, notifications, and security.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">Admin</Badge>
            <Button className="rounded-2xl gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 md:grid-cols-6">
            <TabsTrigger value="general" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              Payments
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              Shipping
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-2xl border bg-muted/80 py-3 data-[state=active]:shadow-sm">
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-3xl lg:col-span-2 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Store Information</CardTitle>
                      <CardDescription>Update your core store details.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-email">Support Email</Label>
                      <Input id="store-email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-phone">Phone Number</Label>
                      <Input id="store-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LKR">LKR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Colombo">Asia/Colombo</SelectItem>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-description">Store Description</Label>
                    <Textarea
                      id="store-description"
                      className="min-h-[120px] rounded-2xl"
                      placeholder="Write a short description about your store"
                      defaultValue="YTE Commerce is a modern online store offering quality products with fast delivery and easy payments."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Status</CardTitle>
                  <CardDescription>Overview of your store settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <span className="text-sm font-medium">Store Status</span>
                    <Badge className="rounded-full">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <span className="text-sm font-medium">Guest Checkout</span>
                    <Badge variant="secondary" className="rounded-full">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <span className="text-sm font-medium">Default Currency</span>
                    <Badge variant="outline" className="rounded-full">{currency}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-4">
                    <span className="text-sm font-medium">Timezone</span>
                    <Badge variant="outline" className="rounded-full">{timezone}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Choose and configure available payment options.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Allow customers to pay when they receive the order.</p>
                  </div>
                  <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Stripe</p>
                    <p className="text-sm text-muted-foreground">Accept debit and credit card payments securely.</p>
                  </div>
                  <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Enable PayPal checkout for international orders.</p>
                  </div>
                  <Switch checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Stripe Publishable Key</Label>
                    <Input className="rounded-2xl" placeholder="pk_test_xxxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stripe Secret Key</Label>
                    <Input className="rounded-2xl" placeholder="sk_test_xxxxxxxxx" type="password" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Shipping Settings</CardTitle>
                    <CardDescription>Control delivery zones, fees, and checkout rules.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default Shipping Fee</Label>
                    <Input className="rounded-2xl" placeholder="500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Free Shipping Threshold</Label>
                    <Input className="rounded-2xl" placeholder="10000" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Guest Checkout</p>
                    <p className="text-sm text-muted-foreground">Allow customers to place orders without creating an account.</p>
                  </div>
                  <Switch checked={guestCheckout} onCheckedChange={setGuestCheckout} />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Notes</Label>
                  <Textarea className="min-h-[120px] rounded-2xl" placeholder="Add shipping policies or special delivery notes here" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what alerts and updates you want to receive.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">New Order Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive an alert every time a new order is placed.</p>
                  </div>
                  <Switch checked={orderAlerts} onCheckedChange={setOrderAlerts} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when product stock runs low.</p>
                  </div>
                  <Switch checked={stockAlerts} onCheckedChange={setStockAlerts} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive feature updates, offers, and platform tips.</p>
                  </div>
                  <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Security & Access</CardTitle>
                    <CardDescription>Protect your admin panel and control system access.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Admin Login Email</Label>
                    <Input className="rounded-2xl" defaultValue="owner@ytecommerce.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <Input className="rounded-2xl" type="password" placeholder="Enter new password" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Temporarily disable storefront access for customers.</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="mt-1 text-sm text-muted-foreground">Add an extra security layer for admin logins.</p>
                  <Button variant="outline" className="mt-4 rounded-2xl">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the admin experience and dashboard feel.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">Dark Dashboard Mode</p>
                    <p className="text-sm text-muted-foreground">Switch the admin interface to a dark theme.</p>
                  </div>
                  <Switch checked={darkDashboard} onCheckedChange={setDarkDashboard} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <button className="rounded-3xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1">
                    <div className="mb-4 h-20 rounded-2xl border bg-muted" />
                    <p className="font-medium">Default Theme</p>
                    <p className="text-sm text-muted-foreground">Clean and minimal layout.</p>
                  </button>
                  <button className="rounded-3xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1">
                    <div className="mb-4 h-20 rounded-2xl bg-slate-900" />
                    <p className="font-medium">Dark Theme</p>
                    <p className="text-sm text-muted-foreground">Better for low-light work sessions.</p>
                  </button>
                  <button className="rounded-3xl border bg-background p-5 text-left shadow-sm transition hover:-translate-y-1">
                    <div className="mb-4 h-20 rounded-2xl bg-gradient-to-r from-muted to-background border" />
                    <p className="font-medium">Soft Theme</p>
                    <p className="text-sm text-muted-foreground">A softer visual style for admins.</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
