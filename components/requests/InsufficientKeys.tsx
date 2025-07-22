import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Divider,
  Progress,
  Container,
} from "@mantine/core";
import {
  Key,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Zap,
  RefreshCw,
  Construction,
  TrendingUp,
} from "lucide-react";
import PaymentModal from "../Tokens";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

interface InsufficientKeysProps {
  currentKeys?: number;
  requiredKeys?: number;
  refetchBalance?: () => void;
  requestId?: string;
  userTier?: "starter" | "professional" | "enterprise";
}

const InsufficientKeys: React.FC<InsufficientKeysProps> = ({
  currentKeys = 0,
  requiredKeys = 1,
  requestId = "",
  refetchBalance = () => {},
  userTier = "starter",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    const pulseTimer = setInterval(() => {
      setShowPulse((prev) => !prev);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(pulseTimer);
    };
  }, []);

  const onTopUp = () => {
    setOpen(true);
  };
  const onBackToRequests = () => {
    navigateTo();
    router.push("/keyman/dashboard/requests");
  };

  const progressValue = (currentKeys / requiredKeys) * 100;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "professional":
        return "#F08C23";
      case "enterprise":
        return "#388E3C";
      default:
        return "#3D6B2C";
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case "professional":
        return { multiplier: "2x", bonus: "10% bonus coins" };
      case "enterprise":
        return { multiplier: "5x", bonus: "25% bonus coins" };
      default:
        return { multiplier: "1x", bonus: "Standard rate" };
    }
  };

  const tierBenefits = getTierBenefits(userTier);

  return (
    <Container size="sm" py="sm">
      <div
        className={`transform transition-all duration-1000 ease-out ${
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <PaymentModal
          isOpen={open}
          onClose={() => setOpen(false)}
          type="user"
          typeId={requestId}
          amount={0}
          description=""
          availablePaymentMethods={["mpesa", "airtel_money", "t_kash"]}
          onPaymentSuccess={() => {
            setOpen(false);
            refetchBalance();
            // Handle payment success logic here
          }}
        />
        <Card
          shadow="md"
          padding="md"
          radius="md"
          className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 transform rotate-12">
              <Construction size={120} className="text-gray-400" />
            </div>
            <div className="absolute bottom-4 left-4 transform -rotate-12">
              <Key size={80} className="text-gray-400" />
            </div>
          </div>

          {/* Header Section */}
          <div className="relative z-10 text-center mb-3">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transform transition-all duration-700 ${
                showPulse ? "scale-110 shadow-lg" : "scale-100 shadow-md"
              }`}
              style={{ backgroundColor: "#3D6B2C" }}
            >
              <AlertCircle size={32} className="text-white" />
            </div>

            <Text size="xl" fw="bold" className="text-gray-800 mb-2">
              Insufficient Keyman coins to make request
            </Text>

            <Text size="sm" className="text-gray-600 max-w-md mx-auto">
              You need more coins to submit this construction request. Coins
              ensure quality interactions between contractors and suppliers.
            </Text>
          </div>

          {/* Key Status Section */}
          <div className="mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
              <Group align="space-between" mb="sm">
                <Group gap="xs">
                  <Key size={18} style={{ color: "#3D6B2C" }} />
                  <Text fw="600" className="text-gray-700">
                    Current Coins
                  </Text>
                </Group>
                <Badge
                  size="lg"
                  variant="filled"
                  style={{
                    backgroundColor: currentKeys > 0 ? "#388E3C" : "#F08C23",
                  }}
                >
                  0
                </Badge>
              </Group>

              <Progress
                value={progressValue}
                size="lg"
                radius="xl"
                className="mb-3"
                styles={{
                  root: { backgroundColor: "#f3f4f6" },
                  section: { backgroundColor: "#3D6B2C" },
                }}
              />
            </Card>
          </div>

          {/* Tier Benefits */}
          <div className="mb-3 hidden">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <Group align="space-between" mb="sm">
                <Group gap="xs">
                  <TrendingUp
                    size={18}
                    style={{ color: getTierColor(userTier) }}
                  />
                  <Text fw={600} className="text-gray-700">
                    {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
                  </Text>
                </Group>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: getTierColor(userTier),
                    color: getTierColor(userTier),
                  }}
                >
                  {tierBenefits.multiplier} Rate
                </Badge>
              </Group>
              <Text size="sm" className="text-gray-600">
                {tierBenefits.bonus} • Priority supplier matching
              </Text>
            </Card>
          </div>

          <Divider my="md" />

          {/* Action Buttons */}
          <Stack gap="md">
            <Button
              size="lg"
              radius="lg"
              leftSection={<CreditCard size={20} />}
              onClick={onTopUp}
              className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              styles={{
                root: {
                  backgroundColor: "#3D6B2C",
                  "&:hover": {
                    backgroundColor: "#2d5220",
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              <Group gap="xs">
                <Zap size={16} />
                <Text fw={600}>Top Up coins</Text>
              </Group>
            </Button>

            <Button
              size="lg"
              radius="lg"
              variant="outline"
              leftSection={<ArrowLeft size={20} />}
              onClick={onBackToRequests}
              className="transform transition-all duration-300 hover:scale-105"
              styles={{
                root: {
                  borderColor: "#F08C23",
                  color: "#F08C23",
                  "&:hover": {
                    backgroundColor: "#F08C23",
                    color: "white",
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              Back to Requests
            </Button>
          </Stack>

          {/* Additional Info */}
          <div className="mt-2 pt-4 border-t border-gray-200">
            <Group gap="xs">
              <RefreshCw size={14} className="text-gray-400" />
              <Text size="xs" className="text-gray-500 text-center">
                Coins are consumed only when suppliers respond to your requests
              </Text>
            </Group>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default InsufficientKeys;
