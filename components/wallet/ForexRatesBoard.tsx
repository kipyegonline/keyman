"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupportedCurrencies, getForexRates } from "@/api/wallet";
import {
  Loader,
  Alert,
  Box,
  Card,
  Text,
  Title,
  Stack,
  Group,
  Badge,
  Grid,
  Container,
  //Divider,
  Button,
  Image,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CountUp from "react-countup";
import { COLOUR } from "@/CONSTANTS/color";

// Types
interface SupportedCurrenciesResponse {
  success: boolean;
  data: Record<string, string>;
  message?: string;
}

interface ForexRatesResponse {
  success: boolean;
  rates: {
    [key: string]: {
      unitAmount: number;
      currencyPairs: string;
      rates: {
        sell: number;
        buy: number;
      };
    };
  };
  message?: string;
}

// Currency flag mapping
const currencyFlags: Record<string, string> = {
  USD: "US",
  GBP: "GB",
  EUR: "EU",
  CNY: "CN",
  TZS: "TZ",
  UGX: "UG",
  RWF: "RW",
};

// Loading Component
const ForexLoadingState = () => {
  return (
    <Card className="bg-gray-900" p="xl" radius="xl">
      <Stack align="center" gap="md" py="xl">
        <Loader size="lg" color={COLOUR.accent} />
        <Text c="dimmed" size="lg">
          Loading exchange rates...
        </Text>
      </Stack>
    </Card>
  );
};

// Error Component
const ForexErrorState = ({ message }: { message: string }) => {
  return (
    <Card className="bg-gray-900" p="xl" radius="xl">
      <Alert
        icon={<AlertCircle size={20} />}
        title="Unable to Load Rates"
        color="red"
        variant="filled"
      >
        {message || "Failed to fetch exchange rates. Please try again later."}
      </Alert>
    </Card>
  );
};

// Single Currency Rate Card - Compact Version
const CurrencyRateCard = ({
  currencyCode,
  //currencyName,
  data,
  isVisible,
}: {
  currencyCode: string;
  currencyName: string;
  data: {
    unitAmount: number;
    currencyPairs: string;
    rates: {
      sell: number;
      buy: number;
    };
  };
  isVisible: boolean;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Add a small delay to make the animation visible
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnimated]);

  return (
    <Card
      className="overflow-hidden"
      style={{
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered
          ? "translateY(-8px) scale(1.02)"
          : "translateY(0) scale(1)",
        borderColor: isHovered ? COLOUR.accent : "#e5e7eb",
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: isHovered
          ? `0 20px 25px -5px ${COLOUR.accent}40, 0 10px 10px -5px ${COLOUR.accent}30`
          : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        background: isHovered
          ? `linear-gradient(135deg, rgba(61, 107, 44, 0.08) 0%, rgba(76, 175, 80, 0.08) 100%), white`
          : "white",
      }}
      p="md"
      radius="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Currency Header - Compact */}
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <Text
            size="lg"
            style={{
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.2) rotate(5deg)" : "scale(1)",
            }}
          >
            <Image
              src={`https://flagcdn.com/16x12/${currencyFlags[
                currencyCode
              ]?.toLowerCase()}.png`}
              width={5}
              height={5}
              alt={`${currencyFlags[currencyCode]} flag`}
            />
          </Text>
          <Title order={4} c="black" size="md" fw={700}>
            {currencyCode}
          </Title>
        </Group>
        <Text c={COLOUR.accent} ff="monospace" size="xs" fw={600}>
          {data.currencyPairs}
        </Text>
      </Group>

      {/* Buy/Sell Rates - Horizontal Layout */}
      <Group grow gap="xs">
        {/* Buy Rate */}
        <Box
          className="rounded-lg"
          style={{
            background: isHovered ? "rgba(240, 140, 35, 0.12)" : "#f9fafb",
            padding: "8px",
            transition: "all 0.3s ease",
          }}
        >
          <Group gap={4} mb={4}>
            <TrendingUp
              className="w-3 h-3"
              style={{
                transition: "transform 0.3s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                color: COLOUR.accent,
              }}
            />
            <Text c="gray.7" size="xs" tt="uppercase">
              Buy
            </Text>
          </Group>
          <Text
            ff="monospace"
            size="lg"
            fw={700}
            style={{
              transition: "color 0.3s ease",
              color: isHovered ? COLOUR.accent : "black",
            }}
          >
            {hasAnimated ? (
              <CountUp
                start={0}
                end={data.rates.buy}
                duration={2}
                decimals={2}
                decimal="."
                separator=","
              />
            ) : (
              "0.00"
            )}
          </Text>
        </Box>

        {/* Sell Rate */}
        <Box
          className="rounded-lg"
          style={{
            background: isHovered ? "rgba(240, 140, 35, 0.12)" : "#f9fafb",
            padding: "8px",
            transition: "all 0.3s ease",
          }}
        >
          <Group gap={4} mb={4}>
            <TrendingDown
              className="w-3 h-3"
              style={{
                transition: "transform 0.3s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                color: COLOUR.secondary,
              }}
            />
            <Text c="gray.7" size="xs" tt="uppercase">
              Sell
            </Text>
          </Group>
          <Text
            ff="monospace"
            size="lg"
            fw={700}
            style={{
              transition: "color 0.3s ease",
              color: isHovered ? COLOUR.accent : "black",
            }}
          >
            {hasAnimated ? (
              <CountUp
                start={0}
                end={data.rates.sell}
                duration={2}
                decimals={2}
                decimal="."
                separator=","
              />
            ) : (
              "0.00"
            )}
          </Text>
        </Box>
      </Group>
    </Card>
  );
};

// Twinkling Star Component
const TwinklingStar = () => {
  const randomDelay = React.useMemo(() => Math.random() * 3, []);
  const randomDuration = React.useMemo(() => 2 + Math.random() * 2, []);
  const randomSize = React.useMemo(() => 1 + Math.random() * 2, []);
  const randomLeft = React.useMemo(() => Math.random() * 100, []);
  const randomTop = React.useMemo(() => Math.random() * 100, []);

  return (
    <Box
      style={{
        position: "absolute",
        left: `${randomLeft}%`,
        top: `${randomTop}%`,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        backgroundColor: "white",
        borderRadius: "50%",
        opacity: 0.8,
        animation: `twinkle ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
      }}
    />
  );
};

// Floating Particle Component
const FloatingParticle = () => {
  const randomDelay = React.useMemo(() => Math.random() * 5, []);
  const randomDuration = React.useMemo(() => 8 + Math.random() * 4, []);
  const randomSize = React.useMemo(() => 3 + Math.random() * 5, []);
  const randomLeft = React.useMemo(() => Math.random() * 100, []);
  const randomOpacity = React.useMemo(() => 0.2 + Math.random() * 0.4, []);

  return (
    <Box
      style={{
        position: "absolute",
        left: `${randomLeft}%`,
        bottom: "-20px",
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        backgroundColor: COLOUR.accent,
        borderRadius: "50%",
        opacity: randomOpacity,
        animation: `floatUp ${randomDuration}s ease-in ${randomDelay}s infinite`,
        filter: "blur(1px)",
      }}
    />
  );
};

// Main Forex Rates Board Component
const ForexRatesBoard = () => {
  const [showAll, setShowAll] = React.useState(false);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const { ref: containerRef, entry } = useIntersection({
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (entry?.isIntersecting) {
      // Add delay to ensure animation is visible even on page load
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [entry?.isIntersecting]);

  const isInView = shouldAnimate;

  // Generate stars and particles
  const stars = React.useMemo(
    () => Array.from({ length: 50 }, (_, i) => i),
    []
  );
  const particles = React.useMemo(
    () => Array.from({ length: 20 }, (_, i) => i),
    []
  );

  // Fetch supported currencies
  const {
    data: currenciesData,
    isLoading: currenciesLoading,
    isError: currenciesError,
    error: currenciesErrorData,
  } = useQuery<SupportedCurrenciesResponse>({
    queryKey: ["supportedCurrencies"],
    queryFn: getSupportedCurrencies,
    staleTime: 1000 * 60 * 60, // 1 hour - currencies don't change often
  });

  // Extract currency keys
  const currencyKeys = React.useMemo(() => {
    if (currenciesData?.success && currenciesData?.data) {
      return Object.keys(currenciesData.data);
    }
    return [];
  }, [currenciesData]);

  // Fetch forex rates
  const {
    data: ratesData,
    isLoading: ratesLoading,
    isError: ratesError,
    error: ratesErrorData,
  } = useQuery<ForexRatesResponse>({
    queryKey: ["forexRates", currencyKeys],
    queryFn: () => getForexRates(currencyKeys),
    enabled: currencyKeys.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });

  // Get currency entries and slice based on showAll state
  const currencyEntries = React.useMemo(() => {
    if (!ratesData?.rates) return [];
    return Object.entries(ratesData.rates);
  }, [ratesData]);

  const displayedCurrencies = React.useMemo(() => {
    return showAll ? currencyEntries : currencyEntries.slice(0, 4);
  }, [currencyEntries, showAll]);

  const hasMoreCurrencies = currencyEntries.length > 4;

  // Handle loading state
  if (currenciesLoading || ratesLoading) {
    return <ForexLoadingState />;
  }

  // Handle error state
  if (currenciesError || ratesError) {
    const currencyError = currenciesErrorData as Error | null;
    const rateError = ratesErrorData as Error | null;
    const errorMessage =
      currencyError?.message ||
      rateError?.message ||
      "An error occurred while loading exchange rates";
    return <ForexErrorState message={errorMessage} />;
  }

  // Handle no data
  if (!ratesData?.success || !ratesData?.rates) {
    return null;
    return (
      <ForexErrorState message="No exchange rates available at the moment" />
    );
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh)
              translateX(${Math.random() > 0.5 ? "20px" : "-20px"});
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      <Box
        ref={containerRef}
        className="py-12 px-4 sm:px-6 lg:px-8"
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(to bottom right, ${COLOUR.primary}, ${COLOUR.accent})`,
        }}
      >
        {/* Twinkling Stars Layer */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {stars.map((star) => (
            <TwinklingStar key={`star-${star}`} />
          ))}
        </Box>

        {/* Floating Particles Layer */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {particles.map((particle) => (
            <FloatingParticle key={`particle-${particle}`} />
          ))}
        </Box>

        {/* Gradient Overlay for depth */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        <Container size="xl" style={{ position: "relative", zIndex: 3 }}>
          {/* Header */}
          <Stack align="center" mb="xl">
            <Title order={2} ta="center" c="white" size="h1" mb="xs">
              Foreign Exchange Rates
            </Title>
            <Text c="white" size="lg" ta="center">
              Real-time rates updated every 5 minutes
            </Text>
            <Badge
              className="!bg-keyman-orange"
              leftSection={
                <Box className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              }
              size="lg"
              radius="xl"
              variant="filled"
              color="dark"
            >
              <Text c="gray.3" size="sm">
                Live Rates
              </Text>
            </Badge>
          </Stack>

          {/* Rates Grid */}
          <Grid gutter="md">
            {displayedCurrencies.map(([currencyCode, data]) => (
              <Grid.Col key={currencyCode} span={{ base: 12, sm: 6, md: 3 }}>
                <CurrencyRateCard
                  currencyCode={currencyCode}
                  currencyName={
                    currenciesData?.data?.[currencyCode] || currencyCode
                  }
                  data={data}
                  isVisible={isInView}
                />
              </Grid.Col>
            ))}
          </Grid>

          {/* Show More/Less Button */}
          {hasMoreCurrencies && (
            <Stack align="center" mt="lg">
              <Button
                //variant="light"
                //color={COLOUR.accent}
                className="!bg-keyman-orange hover:bg-keyman-orange/20"
                size="md"
                radius="xl"
                onClick={() => setShowAll(!showAll)}
                rightSection={
                  showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                }
                styles={{
                  root: {
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${COLOUR.accent}40`,
                    },
                  },
                }}
              >
                {showAll
                  ? `Show Less`
                  : `Show ${currencyEntries.length - 4} More Currencies`}
              </Button>
            </Stack>
          )}

          {/* Footer Note */}
          <Text c="white" size="sm" ta="center" mt="xl">
            Rates are indicative and subject to change. Contact us for exact
            rates on transactions.
          </Text>
        </Container>
      </Box>
    </>
  );
};

export default ForexRatesBoard;
