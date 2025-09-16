"use client";
import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Button,
  PinInput,
  Card,
  Alert,
  Modal,
  Group,
  TextInput,
} from "@mantine/core";
import { Shield, RefreshCw, Mail, MessageSquare } from "lucide-react";
import { sendOTP, confirmOTP } from "@/api/wallet";
import { notify } from "@/lib/notifications";

interface OTPInputProps {
  phoneNumber?: string;
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: string) => void;
}

export default function OTPInput({
  phoneNumber,
  onVerificationSuccess,
  onVerificationError,
}: OTPInputProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState("");
  const [showResendModal, setShowResendModal] = useState(false);
  const [phone, setphone] = useState(phoneNumber);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOTPSubmit = async () => {
    if (otp.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await confirmOTP(phoneNumber ?? "", otp);

      if (response.success) {
        notify.success("OTP verified successfully!");
        onVerificationSuccess?.();
      } else {
        const errorMessage = response.error || "Invalid OTP. Please try again.";
        setError(errorMessage);
        onVerificationError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = "Failed to verify OTP. Please try again.";
      setError(errorMessage);
      console.error(error);
      onVerificationError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (otpType: "email" | "sms") => {
    setResendLoading(true);
    setError("");
    setShowResendModal(false);

    try {
      const response = await sendOTP(phoneNumber ?? (phone as string), otpType);

      if (response.success) {
        notify.success(`OTP sent successfully via ${otpType.toUpperCase()}!`);
        setResendCountdown(30); // 30 second countdown
        setOtp(""); // Clear previous OTP
      } else {
        notify.error(response?.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      notify.error("Failed to send OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-md mx-auto bg-green-50 border border-green-200"
      radius="md"
      p="xl"
    >
      <Stack gap="lg" align="center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <Shield size={32} className="text-[#3D6B2C]" />
        </div>

        <div className="text-center">
          <Text
            size="lg"
            fw={600}
            style={{ color: "#3D6B2C" }}
            className="mb-2"
          >
            Verify Your Account
          </Text>
          <Text size="sm" c="dimmed">
            {"We've sent a 4-digit verification code "}
            <Text component="span" fw={500}>
              {phoneNumber}
            </Text>
          </Text>
        </div>

        <Stack gap="md" className="w-full">
          <div className="flex justify-center">
            <PinInput
              length={4}
              value={otp}
              onChange={setOtp}
              size="lg"
              type="number"
              placeholder="•"
              style={{ gap: "12px" }}
              styles={{
                input: {
                  borderColor: error ? "#fa5252" : "#ced4da",
                  "&:focus": {
                    borderColor: "#3D6B2C",
                  },
                },
              }}
            />
          </div>

          {error && (
            <Alert color="red" variant="light" className="text-center">
              {error}
            </Alert>
          )}

          <Button
            size="lg"
            onClick={handleOTPSubmit}
            loading={loading}
            disabled={otp.length !== 4}
            style={{ backgroundColor: "#3D6B2C" }}
            className="hover:opacity-90 w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            <div>
              {showPhone && (
                <TextInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setphone(e.target.value)}
                />
              )}
            </div>
            <Text size="xs" c="dimmed" className="mb-2">
              {`Didn't receive the code?`}
            </Text>

            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                if (!phone) setShowPhone(true);
                else {
                  setShowResendModal(true);
                }
              }}
              loading={resendLoading}
              disabled={resendCountdown > 0}
              leftSection={<RefreshCw size={14} />}
              style={{ color: "#3D6B2C" }}
            >
              {resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : resendLoading
                ? "Sending..."
                : "Resend OTP"}
            </Button>
          </div>
        </Stack>
      </Stack>

      {/* Resend OTP Type Selection Modal */}
      <Modal
        opened={showResendModal}
        onClose={() => setShowResendModal(false)}
        title="Choose OTP Delivery Method"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            How would you like to receive your verification code?
          </Text>

          <Group grow>
            <Button
              variant="light"
              onClick={() => handleResendOTP("email")}
              leftSection={<Mail size={16} />}
              style={{ backgroundColor: "#3D6B2C20", color: "#3D6B2C" }}
              className="hover:opacity-80"
            >
              Email
            </Button>

            <Button
              variant="light"
              onClick={() => handleResendOTP("sms")}
              leftSection={<MessageSquare size={16} />}
              style={{ backgroundColor: "#F08C2320", color: "#F08C23" }}
              className="hover:opacity-80"
            >
              SMS
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
