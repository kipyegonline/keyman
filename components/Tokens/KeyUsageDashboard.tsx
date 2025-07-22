import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Progress,
  Button,
  Container,
  Grid,
  RingProgress,
  // Divider,
  ActionIcon,
  // Tooltip,
  SimpleGrid,
} from "@mantine/core";
import {
  Key,
  //TrendingUp,
  Gift,
  CreditCard,
  History,
  Zap,
  Plus,
  ArrowUp,
  ArrowDown,
  //Clock,
  Target,
  Award,
  Activity,
  Sparkles,
  Coins,
} from "lucide-react";

interface KeyUsageData {
  currentBalance: number;
  freeKeys: number;
  topUpKeys: number;
  totalKeys: number;
  usedThisMonth: number;
  monthlyLimit: number;
  userTier: "starter" | "professional" | "enterprise";
  lastTopUp?: {
    amount: number;
    date: string;
  };
  recentActivity?: {
    type: "used" | "earned" | "purchased";
    amount: number;
    description: string;
    date: string;
  }[];
}

interface KeyUsageDashboardProps {
  data?: KeyUsageData;
  onTopUp?: () => void;
  onViewHistory?: () => void;
}

const KeyUsageDashboard: React.FC<KeyUsageDashboardProps> = ({
  data = {
    currentBalance: 47,
    freeKeys: 25,
    topUpKeys: 22,
    totalKeys: 47,
    usedThisMonth: 18,
    monthlyLimit: 100,
    userTier: "professional",
    lastTopUp: {
      amount: 50,
      date: "2024-06-28",
    },
    recentActivity: [
      {
        type: "used",
        amount: 2,
        description: "Steel beam request",
        date: "2024-07-01",
      },
      {
        type: "earned",
        amount: 5,
        description: "Monthly bonus",
        date: "2024-07-01",
      },
      {
        type: "purchased",
        amount: 50,
        description: "Key bundle",
        date: "2024-06-28",
      },
    ],
  },
  onTopUp = () => console.log("Navigate to top up"),
  onViewHistory = () => console.log("View history"),
}) => {
  const [animateCards, setAnimateCards] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "professional":
        return {
          color: "#F08C23",
          label: "Professional",
          multiplier: "2x",
          icon: Award,
        };
      case "enterprise":
        return {
          color: "#388E3C",
          label: "Enterprise",
          multiplier: "5x",
          icon: Target,
        };
      default:
        return {
          color: "#3D6B2C",
          label: "Starter",
          multiplier: "1x",
          icon: Key,
        };
    }
  };

  const tierConfig = getTierConfig(data.userTier);
  const usagePercentage = (data.usedThisMonth / data.monthlyLimit) * 100;
  const balanceHealthColor =
    data.currentBalance > 20
      ? "#388E3C"
      : data.currentBalance > 10
      ? "#F08C23"
      : "#dc2626";

  const cardVariants = {
    balance: { delay: 0, color: "#3D6B2C" },
    free: { delay: 100, color: "#388E3C" },
    topup: { delay: 200, color: "#F08C23" },
  };

  return (
    <Container size="lg" py="xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <Group align="center" gap="sm" mb="md">
          <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-blue-100">
            <Activity size={28} style={{ color: "#3D6B2C" }} />
          </div>
          <div>
            <Text size="xl" fw="bold" className="text-gray-800">
              Coin Usage Dashboard
            </Text>
            <Text size="sm" className="text-gray-600">
              Monitor your construction request tokens
            </Text>
          </div>
        </Group>
      </div>

      {/* Main Stats Cards */}
      <SimpleGrid
        cols={{ base: 1, md: 3 }}
        spacing="xl"
        mb="xl"
        //  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
      >
        {/* Current Balance Card */}
        <Card
          shadow="md"
          radius="lg"
          padding="xl"
          className={`relative overflow-hidden transform transition-all duration-700 hover:shadow-xl ${
            animateCards
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          } ${hoveredCard === "balance" ? "scale-105" : ""}`}
          style={{ transitionDelay: `${cardVariants.balance.delay}ms` }}
          onMouseEnter={() => setHoveredCard("balance")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 opacity-10">
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: cardVariants.balance.color }}
            />
          </div>

          <Group align="space-between" mb="md">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${cardVariants.balance.color}20` }}
            >
              <Coins size={24} style={{ color: cardVariants.balance.color }} />
            </div>
            <Badge
              size="sm"
              variant="outline"
              style={{
                borderColor: balanceHealthColor,
                color: balanceHealthColor,
              }}
            >
              {data.currentBalance > 20
                ? "Healthy"
                : data.currentBalance > 10
                ? "Moderate"
                : "Low"}
            </Badge>
          </Group>

          <Text size="xs" fw={500} className="text-gray-600 mb-1">
            Current Balance
          </Text>
          <Text
            size="2xl"
            fw="bold"
            style={{ color: cardVariants.balance.color }}
          >
            {data.currentBalance}
          </Text>
          <Text size="xs" className="text-gray-500">
            Available Coins
          </Text>
        </Card>

        {/* Free Keys Card */}
        <Card
          shadow="md"
          radius="lg"
          padding="xl"
          className={`relative overflow-hidden transform transition-all duration-700 hover:shadow-xl ${
            animateCards
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          } ${hoveredCard === "free" ? "scale-105" : ""}`}
          style={{ transitionDelay: `${cardVariants.free.delay}ms` }}
          onMouseEnter={() => setHoveredCard("free")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 opacity-10">
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: cardVariants.free.color }}
            />
          </div>

          <Group align="space-between" mb="md">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${cardVariants.free.color}20` }}
            >
              <Gift size={24} style={{ color: cardVariants.free.color }} />
            </div>
            <Sparkles size={16} style={{ color: cardVariants.free.color }} />
          </Group>

          <Text size="xs" fw={500} className="text-gray-600 mb-1">
            Free coins
          </Text>
          <Text size="2xl" fw="bold" style={{ color: cardVariants.free.color }}>
            {data.freeKeys}
          </Text>
          <Text size="xs" className="text-gray-500">
            Earned rewards
          </Text>
        </Card>

        {/* Top-up Keys Card */}
        <Card
          shadow="md"
          radius="lg"
          padding="xl"
          className={`relative overflow-hidden transform transition-all duration-700 hover:shadow-xl ${
            animateCards
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          } ${hoveredCard === "topup" ? "scale-105" : ""}`}
          style={{ transitionDelay: `${cardVariants.topup.delay}ms` }}
          onMouseEnter={() => setHoveredCard("topup")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 opacity-10">
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: cardVariants.topup.color }}
            />
          </div>

          <Group justify="space-between" mb="md">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${cardVariants.topup.color}20` }}
            >
              <CreditCard
                size={24}
                style={{ color: cardVariants.topup.color }}
              />
            </div>
            <Badge
              size="sm"
              variant="filled"
              style={{ backgroundColor: cardVariants.topup.color }}
            >
              Purchased
            </Badge>
          </Group>

          <Text size="xs" fw={500} className="text-gray-600 mb-1">
            Top-up coins
          </Text>
          <Text
            size="2xl"
            fw="bold"
            style={{ color: cardVariants.topup.color }}
          >
            {data.topUpKeys}
          </Text>
          <Text size="xs" className="text-gray-500">
            {data.lastTopUp &&
              `Last: ${new Date(data.lastTopUp.date).toLocaleDateString()}`}
          </Text>
        </Card>
      </SimpleGrid>

      {/* Usage Analytics Section */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="md" radius="lg" padding="xl" className="h-full">
            <Group justify={"space-between"} mb="lg">
              <div>
                <Text size="lg" fw="600" className="text-gray-800 mb-1">
                  Monthly Usage
                </Text>
                <Text size="sm" className="text-gray-600">
                  {data.usedThisMonth} of {data.monthlyLimit} coins used this
                  month
                </Text>
              </div>
              <div className="text-right">
                <Text size="sm" className="text-gray-600">
                  {(
                    ((data.monthlyLimit - data.usedThisMonth) /
                      data.monthlyLimit) *
                    100
                  ).toFixed(0)}
                  % remaining
                </Text>
              </div>
            </Group>

            <Progress
              value={usagePercentage}
              animated
              size="lg"
              radius="xl"
              className="mb-4"
              styles={{
                root: { backgroundColor: "#f3f4f6" },
                section: {
                  backgroundColor:
                    usagePercentage > 80
                      ? "#dc2626"
                      : usagePercentage > 60
                      ? "#F08C23"
                      : "#388E3C",
                  transition: "all 0.5s ease",
                },
              }}
            />

            <Group justify={"space-between"} className="text-sm">
              <Text className="text-gray-600">
                Usage trend:{" "}
                {usagePercentage > 75
                  ? "High"
                  : usagePercentage > 50
                  ? "Moderate"
                  : "Low"}
              </Text>
              <Text className="text-gray-600">
                Est. days left:{" "}
                {Math.ceil(
                  (data.monthlyLimit - data.usedThisMonth) /
                    (data.usedThisMonth / 30)
                )}
              </Text>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="md" radius="lg" padding="xl" className="h-full">
            <Group justify="center" mb="lg">
              <div className="text-center">
                <div
                  className="p-3 rounded-full mb-3"
                  style={{ backgroundColor: `${tierConfig.color}20` }}
                >
                  <tierConfig.icon
                    size={32}
                    style={{ color: tierConfig.color }}
                  />
                </div>
                <Text size="lg" fw={600} className="text-gray-800">
                  {tierConfig.label}
                </Text>
                <Badge
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: tierConfig.color,
                    color: tierConfig.color,
                  }}
                >
                  {tierConfig.multiplier} Benefits
                </Badge>
              </div>
            </Group>

            <RingProgress
              sections={[
                {
                  value: (data.currentBalance / data.monthlyLimit) * 100,
                  color: tierConfig.color,
                },
              ]}
              label={
                <Text color={tierConfig.color} fw="bold" ta="center" size="lg">
                  {data.currentBalance}
                </Text>
              }
              size={120}
              thickness={8}
              className="mx-auto"
            />
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recent Activity */}
      <Card shadow="md" radius="lg" padding="xl" mb="xl">
        <Group justify={"space-between"} mb="lg">
          <div>
            <Text size="lg" fw={600} className="text-gray-800 mb-1">
              Recent Activity
            </Text>
            <Text size="sm" className="text-gray-600">
              Your latest coin transactions
            </Text>
          </div>
          <ActionIcon
            variant="outline"
            size="lg"
            radius="lg"
            onClick={onViewHistory}
            className="hover:scale-110 transition-transform"
          >
            <History size={18} />
          </ActionIcon>
        </Group>

        <Stack gap="md">
          {data.recentActivity?.map((activity, index) => (
            <Group
              key={index}
              justify={"space-between"}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Group gap="md">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "used"
                      ? "bg-red-100"
                      : activity.type === "earned"
                      ? "bg-green-100"
                      : "bg-blue-100"
                  }`}
                >
                  {activity.type === "used" ? (
                    <ArrowDown size={16} className="text-red-600" />
                  ) : activity.type === "earned" ? (
                    <ArrowUp size={16} className="text-green-600" />
                  ) : (
                    <Plus size={16} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <Text size="sm" fw={500} className="text-gray-800">
                    {activity.description}
                  </Text>
                  <Text size="xs" className="text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
              <Badge
                size="md"
                variant="outline"
                color={
                  activity.type === "used"
                    ? "red"
                    : activity.type === "earned"
                    ? "green"
                    : "blue"
                }
              >
                {activity.type === "used" ? "-" : "+"}
                {activity.amount}
              </Badge>
            </Group>
          ))}
        </Stack>
      </Card>

      {/* Call to Action */}
      <Card
        shadow="lg"
        radius="lg"
        //padding="xl"
        p={{ base: "sm", md: "xl" }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100"
      >
        <Group justify={"space-between"} align="center">
          <div>
            <Text size="lg" fw={600} className="text-gray-800 mb-2">
              Need more coins?
            </Text>
            <Text size="sm" className="text-gray-600">
              Keep your construction projects moving with our flexible coin
              packages
            </Text>
          </div>
          <Button
            size="lg"
            radius="lg"
            leftSection={<Zap size={20} />}
            onClick={onTopUp}
            className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            styles={{
              root: {
                backgroundColor: "#3D6B2C",
                "&:hover": {
                  backgroundColor: "#2d5220",
                },
              },
            }}
          >
            Top Up coins
          </Button>
        </Group>
      </Card>
    </Container>
  );
};

export default KeyUsageDashboard;
