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
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function VerifyOTPPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()
  const timerRef = useRef<NodeJS.Timeout>()

  const email = sessionStorage.getItem("resetEmail")

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password")
      return
    }

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [email, navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code")
      setIsLoading(false)
      return
    }

    try {
      // Store the OTP for use in reset password
      sessionStorage.setItem("resetOTP", otpValue)
      // Store that OTP is verified (we'll use this to skip verification in reset)
      sessionStorage.setItem("otpVerified", "true")
      
      // Navigate to reset password page
      navigate("/reset-password")
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await forgotPassword(email)
      if (result.success) {
        setTimeLeft(300)
        setCanResend(false)
        setOtp(["", "", "", "", "", ""])
        
        // Reset timer
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
        // Focus on first input
        document.getElementById("otp-0")?.focus()
      } else {
        setError("Failed to resend code. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Verify Your Email</h1>
                <p className="text-muted-foreground text-balance">
                  We've sent a verification code to
                </p>
                <p className="text-sm font-medium bg-muted px-3 py-1 rounded">
                  {email}
                </p>
              </div>
              
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel>Verification Code</FieldLabel>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {!canResend ? (
                  <span className="text-muted-foreground">
                    Resend code in {formatTime(timeLeft)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend verification code
                  </button>
                )}
              </FieldDescription>

              <FieldDescription className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  Use different email
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}