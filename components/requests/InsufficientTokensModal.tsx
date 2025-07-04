import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Paper,
  Divider,
  Progress,
  Card,
  Grid,
  ActionIcon,
  Transition,
  Alert,
} from "@mantine/core";
import {
  Coins,
  //CreditCard,
  X,
  AlertTriangle,
  Zap,
  ArrowRight,
  //Plus,
  Wallet,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";

// Types
interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  originalPrice?: number;
}

interface InsufficientTokensModalProps {
  opened: boolean;
  onClose: () => void;
  onTopUp: () => void;
  currentTokens: number;
  requiredTokens: number;
  userName?: string;
}

const InsufficientTokensModal: React.FC<InsufficientTokensModalProps> = ({
  opened,
  onClose,
  onTopUp,
  currentTokens,
  requiredTokens,
  userName = "User",
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  // Token packages with different options
  const tokenPackages: TokenPackage[] = [
    {
      id: "starter",
      name: "Starter Pack",
      tokens: 10,
      price: 500,
    },
    {
      id: "professional",
      name: "Professional",
      tokens: 25,
      price: 1000,
      bonus: 5,
      originalPrice: 1250,
      popular: true,
    },
    {
      id: "business",
      name: "Business Pack",
      tokens: 50,
      price: 1800,
      bonus: 15,
      originalPrice: 2500,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tokens: 100,
      price: 3200,
      bonus: 25,
      originalPrice: 5000,
    },
  ];

  const tokensNeeded = requiredTokens - currentTokens;
  const progressPercentage = (currentTokens / requiredTokens) * 100;

  const PackageCard: React.FC<{ pkg: TokenPackage }> = ({ pkg }) => {
    const isSelected = selectedPackage === pkg.id;
    const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
    const savingsPercentage = pkg.originalPrice
      ? Math.round((savings / pkg.originalPrice) * 100)
      : 0;

    return (
      <Card
        className={`relative cursor-pointer border-2 transition-all duration-300 hover:scale-105 ${
          isSelected
            ? "border-[#3D6B2C] bg-green-50 shadow-lg"
            : "border-gray-200 hover:border-[#F08C23] hover:shadow-md"
        }`}
        onClick={() => setSelectedPackage(pkg.id)}
        p="md"
      >
        {pkg.popular && (
          <Badge
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#F08C23] text-white"
            size="sm"
          >
            <Star size={12} className="mr-1" />
            Most Popular
          </Badge>
        )}

        <Stack gap="sm" align="center">
          <ThemeIcon
            size="xl"
            radius="md"
            className={`${
              isSelected ? "bg-[#3D6B2C]" : "bg-[#F08C23]"
            } transition-colors duration-300`}
          >
            <Coins size={24} />
          </ThemeIcon>

          <Text size="lg" fw={600} className="text-gray-800">
            {pkg.name}
          </Text>

          <div className="text-center">
            <Group gap="xs" justify="center">
              <Text size="xl" fw={700} className="text-[#3D6B2C]">
                {pkg.tokens}
              </Text>
              <Text size="sm" c="dimmed">
                tokens
              </Text>
            </Group>

            {pkg.bonus && (
              <Badge size="sm" color="green" variant="light" mt={4}>
                +{pkg.bonus} bonus tokens
              </Badge>
            )}
          </div>

          <div className="text-center">
            <Group gap="xs" justify="center" align="baseline">
              <Text size="xl" fw={700} className="text-gray-800">
                KES {pkg.price.toLocaleString()}
              </Text>
              {pkg.originalPrice && (
                <Text size="sm" td="line-through" c="dimmed">
                  KES {pkg.originalPrice.toLocaleString()}
                </Text>
              )}
            </Group>

            {savingsPercentage > 0 && (
              <Text size="xs" c="green" fw={500}>
                Save {savingsPercentage}%
              </Text>
            )}
          </div>

          <Text size="xs" c="dimmed" ta="center">
            KES {(pkg.price / pkg.tokens).toFixed(0)} per token
          </Text>

          {isSelected && <CheckCircle size={20} className="text-[#3D6B2C]" />}
        </Stack>
      </Card>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 4,
      }}
      transitionProps={{
        transition: "slide-up",
        duration: 300,
      }}
    >
      <div className="relative">
        {/* Close Button */}
        <ActionIcon
          className="absolute top-4 right-4 z-10 hover:bg-gray-100"
          variant="subtle"
          onClick={onClose}
        >
          <X size={18} />
        </ActionIcon>

        <Stack gap="md" p="md">
          {/* Header Section */}
          <div className="text-center">
            <div className="relative mb-4">
              <ThemeIcon
                size={80}
                radius="xl"
                className="bg-gradient-to-br from-orange-100 to-red-100 border-4 border-white shadow-lg mx-auto"
              >
                <AlertTriangle size={28} className="text-[#F08C23]" />
              </ThemeIcon>
            </div>

            <Text size="xl" fw={700} className="text-gray-800 mb-2">
              Insufficient Tokens
            </Text>
            <Text c="dimmed" size="sm">
              Hi {userName}, you need more tokens to submit this quote
            </Text>
          </div>

          {/* Token Status */}
          <Paper className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <Wallet size={16} className="text-[#3D6B2C]" />
                <Text size="sm" fw={500}>
                  Current Balance
                </Text>
              </Group>
              <Badge color="orange" variant="light">
                {currentTokens} tokens
              </Badge>
            </Group>

            <Progress
              value={progressPercentage}
              size="lg"
              radius="md"
              className="mb-3"
              color="#3D6B2C"
            />

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                You have: {currentTokens} tokens
              </Text>
              <Text size="xs" c="dimmed">
                Need: {requiredTokens} tokens
              </Text>
            </Group>

            <Alert
              icon={<Zap size={16} />}
              color="orange"
              variant="light"
              mt="sm"
            >
              <Text size="sm">
                You need <strong>{tokensNeeded} more tokens</strong> to submit
                this quote
              </Text>
            </Alert>
            <Alert
              mt="sm"
              icon={<Zap size={16} />}
              color="green"
              variant="light"
            >
              {" "}
              <Text size="sm">
                1 token costs ksh20., Amount needed is{" "}
                <strong>{tokensNeeded * 20}</strong>
              </Text>
            </Alert>
          </Paper>

          <Divider
            label="Choose a Token Package"
            className="hidden"
            labelPosition="center"
          />

          {/* Token Packages */}
          <Grid display="none">
            {tokenPackages.map((pkg) => (
              <Grid.Col key={pkg.id} span={{ base: 12, sm: 6 }}>
                <PackageCard pkg={pkg} />
              </Grid.Col>
            ))}
          </Grid>

          {/* Benefits Section */}
          {selectedPackage && (
            <Transition
              mounted={!!selectedPackage}
              transition="fade"
              duration={300}
            >
              {(styles) => (
                <Paper
                  style={styles}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200"
                >
                  <Group gap="xs" mb="sm">
                    <TrendingUp size={16} className="text-[#3D6B2C]" />
                    <Text size="sm" fw={500}>
                      Why Choose Tokens?
                    </Text>
                  </Group>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500" />
                      <span>Submit unlimited quotes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500" />
                      <span>Priority customer support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-500" />
                      <span>Advanced analytics</span>
                    </div>
                  </div>
                </Paper>
              )}
            </Transition>
          )}

          {/* Action Buttons */}
          <Group justify="space-between" pt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              leftSection={<X size={16} />}
            >
              Cancel Quote
            </Button>

            <Button
              onClick={onTopUp}
              //loading={isProcessing}
              size="md"
              className={`transition-all duration-300 ${
                selectedPackage
                  ? "bg-[#3D6B2C] hover:bg-[#388E3C] hover:scale-105"
                  : "bg-gray-300"
              }`}
              rightSection={<ArrowRight size={16} />}
            >
              Top Up Now
            </Button>
          </Group>

          {/* Footer */}
          <Text size="xs" c="dimmed" ta="center" pt="sm">
            🔒 Secure payment processing • All transactions are encrypted
          </Text>
        </Stack>
      </div>
    </Modal>
  );
};

export default InsufficientTokensModal;
