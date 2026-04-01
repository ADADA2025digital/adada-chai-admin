import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { authApi } from "@/config/axiosConfig";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  joinDate: string;
  lastLogin: string;
  department: string;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, fetchUserProfile, updateUserProfile, logout } = useAuth();

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data States
  const [profile, setProfile] = useState<ProfileData>({
    id: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "",
    joinDate: "",
    lastLogin: "",
    department: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Message States
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Fetch user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      setProfileError("");

      try {
        let currentUser = user;

        if (!currentUser) {
          currentUser = await fetchUserProfile();
        }

        if (currentUser) {
          const joinDate = currentUser.created_at
            ? new Date(currentUser.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not available";

          const avatarUrl =
            currentUser.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              currentUser.name || "User",
            )}&background=6366f1&color=fff&bold=true`;

          const userData: ProfileData = {
            id: currentUser.id?.toString() || "",
            name: currentUser.name || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            avatar: avatarUrl,
            role: currentUser.role || "Admin",
            joinDate,
            lastLogin: currentUser.lastLogin || new Date().toLocaleString(),
            department: currentUser.department || "",
          };

          setProfile(userData);
          setFormData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            department: userData.department,
          });
        } else {
          setProfileError("Unable to load profile. Please login again.");
          setTimeout(() => {
            navigate("/admin/login");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Error loading profile:", error);
        setProfileError(error.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user, fetchUserProfile, navigate]);

  const handleEditToggle = async () => {
    if (isEditing) {
      setIsUpdating(true);
      setProfileError("");
      setProfileSuccess("");

      try {
        const updatedUser = await updateUserProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
        });

        if (updatedUser) {
          setProfile((prev) => ({
            ...prev,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || prev.phone,
            department: updatedUser.department || prev.department,
            avatar: updatedUser.avatar || prev.avatar,
          }));

          setProfileSuccess("Profile updated successfully!");
          setIsEditing(false);

          setTimeout(() => setProfileSuccess(""), 3000);
        } else {
          setProfileError("Failed to update profile. Please try again.");
        }
      } catch (error: any) {
        console.error("Update error:", error);
        setProfileError(error.message || "Failed to update profile");
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsEditing(true);
      setProfileError("");
      setProfileSuccess("");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      department: profile.department,
    });
    setIsEditing(false);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetPasswordDialogState = () => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await authApi.post("/update-password", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });

      if (response.data.status === "success") {
        setPasswordSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          setShowPasswordDialog(false);
          resetPasswordDialogState();
        }, 2000);
      } else {
        setPasswordError(response.data.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      setPasswordError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while changing password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and security
          </p>
        </div>

        {profileError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{profileError}</AlertDescription>
          </Alert>
        )}

        {profileSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{profileSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>

                    {isEditing && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">{profile.name}</h2>

                  <Badge variant="secondary" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role}
                  </Badge>

                  <Separator className="my-4" />

                  <div className="w-full space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>

                    {profile.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{profile.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span>Administrator</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Joined {profile.joinDate}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="w-full space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowPasswordDialog(true)}
                      disabled={isLoggingOut}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Admin Details
                    </CardTitle>
                    <CardDescription>
                      Your personal information and contact details
                    </CardDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={true}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Edit className="mr-2 h-4 w-4" />
                    )}
                    {isUpdating ? "Saving..." : isEditing ? "Save" : "Edit"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={isEditing ? formData.name : profile.name}
                      onChange={handleInputChange}
                      disabled={!isEditing || isUpdating || isLoggingOut}
                      className={!isEditing ? "bg-muted/50" : ""}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={isEditing ? formData.email : profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing || isUpdating || isLoggingOut}
                      className={!isEditing ? "bg-muted/50" : ""}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={isEditing ? formData.phone : profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing || isUpdating || isLoggingOut}
                      className={!isEditing ? "bg-muted/50" : ""}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={isEditing ? formData.department : profile.department}
                      onChange={handleInputChange}
                      disabled={!isEditing || isUpdating || isLoggingOut}
                      className={!isEditing ? "bg-muted/50" : ""}
                      placeholder="Enter your department"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <Input
                    value={profile.lastLogin}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isUpdating || isLoggingOut}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      onClick={handleEditToggle}
                      disabled={isUpdating || isLoggingOut}
                    >
                      {isUpdating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            resetPasswordDialogState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  disabled={isChangingPassword || isLoggingOut}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isChangingPassword || isLoggingOut}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password (min. 6 characters)"
                  disabled={isChangingPassword || isLoggingOut}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isChangingPassword || isLoggingOut}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  disabled={isChangingPassword || isLoggingOut}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isChangingPassword || isLoggingOut}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                resetPasswordDialogState();
              }}
              disabled={isChangingPassword || isLoggingOut}
            >
              Cancel
            </Button>

            <Button
              onClick={handlePasswordSubmit}
              disabled={isChangingPassword || isLoggingOut}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}