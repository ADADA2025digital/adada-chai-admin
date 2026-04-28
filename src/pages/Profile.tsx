import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/config/axiosConfig";
import getCroppedImg, {
  type CroppedAreaPixels,
  flipImageSource,
} from "@/lib/cropImage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import ProfileAnimatedTabs from "@/components/ui/profile-animated-tabs";

import {
  User,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Fingerprint,
  Upload,
  Pencil,
  RotateCw,
  ZoomIn,
  FlipHorizontal,
} from "lucide-react";

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

interface SessionData {
  browserName: string;
  browserVersion: string;
  deviceType: string;
  operatingSystem: string;
  timeZone: string;
  screenSize: string;
  touchSupport: string;
  userAgent: string;
}

const PROFILE_TABS = [
  { value: "user-profile", label: "User Profile" },
  { value: "profile-picture", label: "Profile Picture" },
  { value: "user-session", label: "User Session" },
];

const LOCAL_PROFILE_IMAGE_KEY = "admin_profile_preview";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, fetchUserProfile, updateUserProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("user-profile");

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isMirroring, setIsMirroring] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [sessionData, setSessionData] = useState<SessionData>({
    browserName: "",
    browserVersion: "",
    deviceType: "",
    operatingSystem: "",
    timeZone: "",
    screenSize: "",
    touchSupport: "",
    userAgent: "",
  });

  const [selectedImage, setSelectedImage] = useState("");
  const [rawImage, setRawImage] = useState("");
  const [baseImage, setBaseImage] = useState("");
  const [isMirrored, setIsMirrored] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const outlineButtonClass =
    "border border-zinc-300 bg-transparent text-zinc-900 shadow-none transition-colors hover:bg-zinc-100/60 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed";

  const dangerOutlineButtonClass =
    "border border-red-400 bg-transparent text-red-500 shadow-none transition-colors hover:bg-red-100/40 dark:border-red-400/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed";

  const neutralCardClass =
    "rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b0b0d]";

  const neutralSubCardClass =
    "rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/8 dark:bg-white/[0.02]";

  const neutralIconClass = "text-black dark:text-white";

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Edg/")) {
      return {
        name: "Microsoft Edge",
        version: ua.match(/Edg\/([\d.]+)/)?.[1] || "Unknown",
      };
    }

    if (ua.includes("OPR/") || ua.includes("Opera/")) {
      return {
        name: "Opera",
        version:
          ua.match(/OPR\/([\d.]+)/)?.[1] ||
          ua.match(/Opera\/([\d.]+)/)?.[1] ||
          "Unknown",
      };
    }

    if (
      ua.includes("Chrome/") &&
      !ua.includes("Edg/") &&
      !ua.includes("OPR/")
    ) {
      return {
        name: "Chrome",
        version: ua.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown",
      };
    }

    if (ua.includes("Firefox/")) {
      return {
        name: "Firefox",
        version: ua.match(/Firefox\/([\d.]+)/)?.[1] || "Unknown",
      };
    }

    if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
      return {
        name: "Safari",
        version: ua.match(/Version\/([\d.]+)/)?.[1] || "Unknown",
      };
    }

    return { name: "Unknown Browser", version: "Unknown" };
  };

  const getOperatingSystem = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    if (/iPhone/.test(ua)) return "iPhone (iOS)";
    if (/iPad/.test(ua)) return "iPad (iPadOS)";
    if (/Android/.test(ua)) return "Android";
    if (/Win/.test(platform)) return "Windows";
    if (/Mac/.test(platform)) return "macOS";
    if (/Linux/.test(platform)) return "Linux";

    return "Unknown OS";
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    const isTablet =
      /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua) ||
      (navigator.maxTouchPoints > 1 && width >= 768 && width <= 1024);

    const isMobile =
      /mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua) &&
      !isTablet;

    if (isTablet) return "Tablet";
    if (isMobile) return "Mobile";
    return "Desktop";
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "Mobile":
        return <Smartphone className={`h-5 w-5 ${neutralIconClass}`} />;
      case "Tablet":
        return <Tablet className={`h-5 w-5 ${neutralIconClass}`} />;
      default:
        return <Monitor className={`h-5 w-5 ${neutralIconClass}`} />;
    }
  };

  useEffect(() => {
    const savedProfileImage = localStorage.getItem(LOCAL_PROFILE_IMAGE_KEY);
    if (savedProfileImage) {
      setSelectedImage(savedProfileImage);
    }
  }, []);

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
            )}&background=111111&color=ffffff&bold=true`;

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

          const savedProfileImage = localStorage.getItem(
            LOCAL_PROFILE_IMAGE_KEY,
          );
          setSelectedImage(savedProfileImage || avatarUrl);

          setFormData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            department: userData.department,
          });
        } else {
          setProfileError("Unable to load profile. Please login again.");
          setTimeout(() => navigate("/admin/login"), 2000);
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

  useEffect(() => {
    const updateSessionInfo = () => {
      const browser = getBrowserInfo();

      setSessionData({
        browserName: browser.name,
        browserVersion: browser.version,
        deviceType: getDeviceType(),
        operatingSystem: getOperatingSystem(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
        screenSize: `${window.screen.width} × ${window.screen.height}`,
        touchSupport:
          "ontouchstart" in window || navigator.maxTouchPoints > 0
            ? "Yes"
            : "No",
        userAgent: navigator.userAgent,
      });
    };

    updateSessionInfo();
    window.addEventListener("resize", updateSessionInfo);

    return () => window.removeEventListener("resize", updateSessionInfo);
  }, []);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  const resetCropState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setIsMirrored(false);
  };

  const revokeIfBlobUrl = (url: string) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMirrorHorizontal = async () => {
    if (!baseImage) return;

    try {
      setIsMirroring(true);
      setProfileError("");

      if (isMirrored) {
        if (rawImage !== baseImage) {
          revokeIfBlobUrl(rawImage);
        }
        setRawImage(baseImage);
        setIsMirrored(false);
        return;
      }

      const mirroredUrl = await flipImageSource(baseImage, {
        horizontal: true,
        vertical: false,
      });

      if (rawImage && rawImage !== baseImage) {
        revokeIfBlobUrl(rawImage);
      }

      setRawImage(mirroredUrl);
      setIsMirrored(true);
    } catch (error) {
      console.error("Mirror error:", error);
      setProfileError("Failed to mirror image. Please try again.");
    } finally {
      setIsMirroring(false);
    }
  };

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
            name: updatedUser.name || prev.name,
            email: updatedUser.email || prev.email,
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setBaseImage(previewUrl);
    setRawImage(previewUrl);
    resetCropState();
    setShowCropDialog(true);

    e.target.value = "";
  };

  const handleApplyCrop = async () => {
    if (!rawImage || !croppedAreaPixels) return;

    try {
      setIsCropping(true);
      setProfileError("");
      setProfileSuccess("");

      const croppedBlob = await getCroppedImg(
        rawImage,
        croppedAreaPixels,
        rotation,
      );

      const reader = new FileReader();

      reader.onloadend = () => {
        const finalImage = reader.result as string;

        if (!finalImage) {
          setProfileError("Failed to process image.");
          setIsCropping(false);
          return;
        }

        setSelectedImage(finalImage);

        setProfile((prev) => ({
          ...prev,
          avatar: finalImage,
        }));

        localStorage.setItem(LOCAL_PROFILE_IMAGE_KEY, finalImage);

        if (rawImage && rawImage.startsWith("blob:")) {
          URL.revokeObjectURL(rawImage);
        }
        if (
          baseImage &&
          baseImage.startsWith("blob:") &&
          baseImage !== rawImage
        ) {
          URL.revokeObjectURL(baseImage);
        }

        setBaseImage(finalImage);
        setRawImage(finalImage);
        setIsMirrored(false);
        setShowCropDialog(false);
        resetCropState();

        setProfileSuccess("Profile picture updated successfully!");
        setTimeout(() => setProfileSuccess(""), 3000);
        setIsCropping(false);
      };

      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error("Crop error:", error);
      setProfileError("Failed to crop image. Please try again.");
      setIsCropping(false);
    }
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-black dark:text-white" />
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (profileError && !profile.id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 dark:text-red-400" />
          <p className="mt-3 text-sm text-red-600 dark:text-red-300">
            {profileError || "Profile not found"}
          </p>
          <Button
            className={`mt-5 ${outlineButtonClass}`}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-black dark:text-white">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Admin Profile
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Manage your account settings, profile picture, and current session
            details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className={`min-w-[170px] ${outlineButtonClass}`}
              disabled={isLoggingOut}
            >
              <Edit className="h-4 w-4 shrink-0" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                disabled={isUpdating || isLoggingOut}
                className={outlineButtonClass}
              >
                <X className="h-4 w-4 shrink-0" />
                Cancel
              </Button>

              <Button
                onClick={handleEditToggle}
                disabled={isUpdating || isLoggingOut}
                className={`min-w-[180px] ${outlineButtonClass}`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 shrink-0" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator className="bg-zinc-200 dark:bg-white/10" />

      {profileSuccess && (
        <Alert className="border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{profileSuccess}</AlertDescription>
        </Alert>
      )}

      {profileError && profile.id && (
        <Alert className="border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b0b0d]">
            <CardContent className="relative p-6">
              <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),transparent)] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />

              <div className="relative flex flex-col items-center text-center">
                <div className="group relative mb-5">
                  <Avatar className="h-28 w-28 ring-4 ring-zinc-200 shadow-sm dark:ring-white/10 dark:shadow-[0_0_40px_rgba(0,0,0,0.35)]">
                    <AvatarImage
                      src={selectedImage || profile.avatar}
                      alt={profile.name}
                    />
                    <AvatarFallback className="bg-zinc-200 text-2xl font-semibold text-black dark:bg-zinc-800 dark:text-white">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>

                  <label
                    htmlFor="profileImage"
                    className="absolute -bottom-2 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-900 backdrop-blur-md hover:bg-zinc-100 dark:border-white/15 dark:bg-black/70 dark:text-white dark:hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {profile.name || "User"}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {profile.email}
                </p>
              </div>

              <div className="mt-3 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="rounded-xl bg-white p-2.5 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">
                    <Calendar className={`h-4 w-4 ${neutralIconClass}`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                      Joined
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {profile.joinDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="rounded-xl bg-white p-2.5 ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">
                    <Clock className={`h-4 w-4 ${neutralIconClass}`} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                      Last Login
                    </p>
                    <p className="break-all text-sm font-medium text-zinc-900 dark:text-white">
                      {profile.lastLogin}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  disabled={isLoggingOut}
                  className={`w-full rounded-2xl py-7 ${outlineButtonClass}`}
                >
                  <Lock className="h-4 w-4 shrink-0" />
                  Change Password
                </Button>

                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="
    w-full rounded-2xl py-7 shadow-none
    border border-red-200 bg-red-50 text-red-700
    hover:bg-red-100
    disabled:cursor-not-allowed disabled:opacity-50

    dark:border-red-900/70
    dark:bg-gradient-to-r dark:from-[#220203] dark:to-[#2b0305]
    dark:text-red-400
    dark:hover:from-[#2a0304] dark:hover:to-[#340406]
  "
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 shrink-0" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-5">
              <ProfileAnimatedTabs
                tabs={PROFILE_TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <TabsList className="hidden">
              {PROFILE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="user-profile" className="mt-0">
              <Card className={neutralCardClass}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-zinc-600 dark:text-zinc-400">
                        {isEditing
                          ? "Edit your personal details"
                          : "Your personal information"}
                      </CardDescription>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleEditToggle}
                      disabled={isUpdating || isLoggingOut}
                      className={`min-w-[140px] ${outlineButtonClass}`}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        <>
                          <Save className="h-4 w-4 shrink-0" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 shrink-0" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={isEditing ? formData.name : profile.name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating || isLoggingOut}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={isEditing ? formData.email : profile.email}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating || isLoggingOut}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={isEditing ? formData.phone : profile.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating || isLoggingOut}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={
                          isEditing ? formData.department : profile.department
                        }
                        onChange={handleInputChange}
                        disabled={!isEditing || isUpdating || isLoggingOut}
                        placeholder="Enter your department"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile-picture" className="mt-0">
              <Card className={neutralCardClass}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                    <Camera className={`h-5 w-5 ${neutralIconClass}`} />
                    Profile Picture
                  </CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Upload, crop, zoom, rotate, and mirror your profile photo
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="rounded-[24px] border border-zinc-200 border-dashed bg-zinc-50/60 p-4 sm:p-6 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                      <div className="flex justify-center lg:justify-start">
                        <div className="w-full max-w-[260px]">
                          <div className="aspect-square overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                            <img
                              src={selectedImage || profile.avatar}
                              alt={profile.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Update Profile Picture
                          </h3>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Select an image, then crop, zoom, rotate, and mirror
                            it like a messaging app profile editor.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="profileImageTab"
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
                          >
                            <Upload className="h-4 w-4" />
                            Choose Image
                          </Label>

                          <Input
                            id="profileImageTab"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                          />

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Button
                              className={`w-full ${outlineButtonClass}`}
                              onClick={() => {
                                localStorage.removeItem(
                                  LOCAL_PROFILE_IMAGE_KEY,
                                );
                                setSelectedImage(profile.avatar);
                                setBaseImage(profile.avatar);
                                setRawImage(profile.avatar);
                                setIsMirrored(false);
                                setProfileSuccess(
                                  "Profile picture reset successfully!",
                                );
                                setTimeout(() => setProfileSuccess(""), 3000);
                              }}
                            >
                              Reset
                            </Button>

                            <Button
                              className={`w-full ${outlineButtonClass}`}
                              onClick={() => {
                                const imageToAdjust =
                                  selectedImage || profile.avatar;
                                if (!imageToAdjust) return;

                                setBaseImage(imageToAdjust);
                                setRawImage(imageToAdjust);
                                setIsMirrored(false);
                                resetCropState();
                                setShowCropDialog(true);
                              }}
                              disabled={!selectedImage && !profile.avatar}
                            >
                              Adjust
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-session" className="mt-0">
              <Card className={neutralCardClass}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                    User Session
                  </CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Current browser and device information
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <Globe className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Browser Name
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.browserName}
                      </p>
                    </div>

                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <Eye className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Browser Version
                        </p>
                      </div>
                      <p className="break-all text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.browserVersion}
                      </p>
                    </div>

                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <Smartphone className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Device Type
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.deviceType}
                      </p>
                    </div>

                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <User className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Operating System
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.operatingSystem}
                      </p>
                    </div>

                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Time Zone
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.timeZone}
                      </p>
                    </div>

                    <div className={neutralSubCardClass}>
                      <div className="mb-2 flex items-center gap-2">
                        <Monitor className={`h-4 w-4 ${neutralIconClass}`} />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Screen Size
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.screenSize}
                      </p>
                    </div>

                    <div className={`${neutralSubCardClass} md:col-span-2`}>
                      <div className="mb-2 flex items-center gap-2">
                        <Fingerprint
                          className={`h-4 w-4 ${neutralIconClass}`}
                        />
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Touch Support
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {sessionData.touchSupport}
                      </p>
                    </div>
                  </div>

                  <div className={neutralSubCardClass}>
                    <div className="mb-2 flex items-center gap-2">
                      {getDeviceIcon(sessionData.deviceType)}
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        User Agent Details
                      </p>
                    </div>
                    <p className="break-all text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {sessionData.userAgent}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={showCropDialog}
        onOpenChange={(open) => {
          setShowCropDialog(open);
          if (!open) {
            resetCropState();
            if (rawImage && baseImage && rawImage !== baseImage) {
              revokeIfBlobUrl(rawImage);
              setRawImage(baseImage);
            }
          }
        }}
      >
        <DialogContent className="max-h-[95vh] w-[50vw] !max-w-6xl overflow-y-auto border-zinc-200 bg-white p-4 text-zinc-900 sm:rounded-[28px] sm:p-6 dark:border-white/10 dark:bg-[#0b0b0d] dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Adjust Profile Picture
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Drag to move, zoom in, mirror, and rotate your image.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] py-5">
            <div className="relative h-[300px] overflow-hidden rounded-2xl bg-zinc-900">
              {rawImage && (
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ZoomIn className={`h-4 w-4 ${neutralIconClass}`} />
                    Zoom
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setZoom(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <RotateCw className={`h-4 w-4 ${neutralIconClass}`} />
                    Rotate
                  </div>
                  <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(value) => setRotation(value[0])}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  size="icon"
                  onClick={handleMirrorHorizontal}
                  className={outlineButtonClass}
                  disabled={isCropping || isMirroring}
                >
                  {isMirroring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FlipHorizontal className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  type="button"
                  size="icon"
                  onClick={handleRotateLeft}
                  className={outlineButtonClass}
                  disabled={isCropping || isMirroring}
                >
                  <RotateCw className="h-4 w-4 rotate-180" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  onClick={handleRotateRight}
                  className={outlineButtonClass}
                  disabled={isCropping || isMirroring}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="w-full">
            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                onClick={() => setShowCropDialog(false)}
                className={outlineButtonClass}
                disabled={isCropping || isMirroring}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              <Button
                onClick={handleApplyCrop}
                className={outlineButtonClass}
                disabled={isCropping || isMirroring}
              >
                {isCropping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Apply
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) resetPasswordDialogState();
        }}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[95vw] overflow-x-hidden overflow-y-auto border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm sm:max-w-lg sm:rounded-[28px] sm:p-6 dark:border-white/10 dark:bg-[#0b0b0d] dark:text-white dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle className="text-xl text-zinc-900 dark:text-white">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 sm:py-4">
            {passwordError && (
              <Alert className="border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
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
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
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
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
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

          <DialogFooter className="w-full">
            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={() => {
                  setShowPasswordDialog(false);
                  resetPasswordDialogState();
                }}
                className={`w-full sm:w-auto ${outlineButtonClass}`}
                disabled={isChangingPassword || isLoggingOut}
              >
                <X className="h-4 w-4 shrink-0" />
                Cancel
              </Button>

              <Button
                onClick={handlePasswordSubmit}
                disabled={isChangingPassword || isLoggingOut}
                className={`w-full sm:min-w-[190px] sm:w-auto ${outlineButtonClass}`}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 shrink-0" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
