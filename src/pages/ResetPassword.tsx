import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

export function ResetPasswordPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const email = sessionStorage.getItem("resetEmail")
  const otp = sessionStorage.getItem("resetOTP")
  const otpVerified = sessionStorage.getItem("otpVerified") === "true"

  useEffect(() => {
    if (!email || !otp || !otpVerified) {
      navigate("/forgot-password", { replace: true })
    }
  }, [email, otp, otpVerified, navigate])

  const checkPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++
    if (pass.match(/[0-9]/)) strength++
    if (pass.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-blue-500"
      case 4:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return ""
    }
  }

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(pass)) {
      return "Password must contain at least one number"
    }
    if (!/(?=.*[@$!%*?&])/.test(pass)) {
      return "Password must contain at least one special character (@$!%*?&)"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !otp) {
      setError("Session expired. Please start over.")
      navigate("/forgot-password", { replace: true })
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const success = await resetPassword(email, password, otp)
      if (success) {
        // Clear session storage BEFORE navigation
        sessionStorage.removeItem("resetEmail")
        sessionStorage.removeItem("resetOTP")
        sessionStorage.removeItem("otpVerified")
        
        // Use replace to prevent going back to reset page
        navigate("/login", { 
          replace: true,
          state: {
            message: "Password reset successfully! Please login with your new password.",
          }
        })
      } else {
        setError("Failed to reset password. Please try again.")
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // If no valid session, don't render the form
  if (!email || !otp || !otpVerified) {
    return null
  }

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground text-balance">
                  Create a new password for your account
                </p>
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex h-1 gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all ${
                            i < passwordStrength
                              ? getStrengthColor()
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Password strength: {getStrengthText()}
                    </p>
                  </div>
                )}

                <p className="text-muted-foreground mt-2 text-xs">
                  Password must contain at least 8 characters, including
                  uppercase, lowercase, numbers, and special characters.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login", { replace: true })}
                  className="text-primary hover:underline"
                >
                  Back to login
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}