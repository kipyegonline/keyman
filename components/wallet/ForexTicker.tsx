"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupportedCurrencies, getForexRates } from "@/api/wallet";
import { Box, Text, Group, Loader, Image } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const ForexTicker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch supported currencies
  const { data: currenciesData } = useQuery<SupportedCurrenciesResponse>({
    queryKey: ["supportedCurrencies"],
    queryFn: getSupportedCurrencies,
    staleTime: 1000 * 60 * 60, // 1 hour
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
    isLoading,
    isError,
  } = useQuery<ForexRatesResponse>({
    queryKey: ["forexRates", currencyKeys],
    queryFn: () => getForexRates(currencyKeys),
    enabled: currencyKeys.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });

  // Handle scroll behavior - hide on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        // Scrolling up - hide ticker
        setIsVisible(false);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - show ticker
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Show ticker initially
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Detect mobile (must be before early returns)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Don't render if no data or error
  if (isError || !ratesData?.success || !ratesData?.rates) {
    return null;
  }

  const currencyEntries = Object.entries(ratesData.rates);

  // Duplicate the entries for seamless loop
  const tickerItems = [...currencyEntries, ...currencyEntries];

  // Mobile Ticker Component with Swipe Carousel
  const MobileTicker = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
      if (!isVisible) return;

      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currencyEntries.length);
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }, [isVisible]);

    const handlePrevious = () => {
      setCurrentIndex((prev) =>
        prev === 0 ? currencyEntries.length - 1 : prev - 1
      );
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % currencyEntries.length);
    };

    const currentCurrency = currencyEntries[currentIndex];
    if (!currentCurrency) return null;

    const [currencyCode, data] = currentCurrency;
    const buyRate = Number(data.rates.buy) || 0;
    const sellRate = Number(data.rates.sell) || 0;
    const spread = buyRate - sellRate;
    const isPositive = spread >= 0;

    return (
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#1a1a1a",
          borderTop: `2px solid ${COLOUR.accent}`,
          zIndex: 998,
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Currency Display */}
        <Box
          style={{
            minHeight: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            position: "relative",
          }}
        >
          {/* Left Arrow */}
          <Box
            onClick={handlePrevious}
            style={{
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transition: "all 0.2s ease",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </Box>

          {/* Currency Content */}
          <Box
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "0 12px",
            }}
          >
            {/* Currency Header */}
            <Group gap="xs" justify="center">
              {currencyFlags[currencyCode] && (
                <Image
                  src={`https://flagcdn.com/16x12/${currencyFlags[
                    currencyCode
                  ]?.toLowerCase()}.png`}
                  alt={currencyCode}
                  style={{ width: "24px", height: "18px" }}
                />
              )}
              <Text size="md" fw={700} c="white">
                {currencyCode}
              </Text>
            </Group>

            {/* Buy/Sell Rates */}
            <Group
              gap="xs"
              justify="center"
              wrap="nowrap"
              style={{ width: "100%" }}
            >
              <Group gap={4} wrap="nowrap">
                <TrendingUp
                  size={12}
                  style={{ color: "#10b981", flexShrink: 0 }}
                />
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  Buy
                </Text>
                <Text
                  size="sm"
                  fw={600}
                  c="#10b981"
                  ff="monospace"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {buyRate.toFixed(2)}
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                |
              </Text>

              <Group gap={4} wrap="nowrap">
                <TrendingDown
                  size={12}
                  style={{ color: "#ef4444", flexShrink: 0 }}
                />
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  Sell
                </Text>
                <Text
                  size="sm"
                  fw={600}
                  c="#ef4444"
                  ff="monospace"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {sellRate.toFixed(2)}
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                |
              </Text>

              <Box
                style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: isPositive
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                  flexShrink: 0,
                }}
              >
                <Text
                  size="xs"
                  c={isPositive ? "#10b981" : "#ef4444"}
                  ff="monospace"
                  fw={600}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {isPositive ? "+" : ""}
                  {spread.toFixed(2)}
                </Text>
              </Box>
            </Group>
          </Box>

          {/* Right Arrow */}
          <Box
            onClick={handleNext}
            style={{
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transition: "all 0.2s ease",
            }}
          >
            <ChevronRight size={20} color="white" />
          </Box>
        </Box>

        {/* Pagination Dots */}
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 0",
            minHeight: "22px",
          }}
        >
          {currencyEntries.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: currentIndex === index ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor:
                  currentIndex === index
                    ? COLOUR.accent
                    : "rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>

        {/* Powered By Section */}
        <Box
          style={{
            backgroundColor: "#1a1a1a",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 16px",
            height: "32px",
          }}
        >
          <Group gap="xs" style={{ whiteSpace: "nowrap" }}>
            <Text size="xs" c="dimmed" fw={500}>
              Powered by
            </Text>
            <Text
              size="xs"
              fw={700}
              style={{
                background: `linear-gradient(90deg, ${COLOUR.accent}, ${COLOUR.primary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Choice Bank
            </Text>
            <Box
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                backgroundColor: "rgba(240, 140, 35, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="10px" fw={700} c={COLOUR.accent}>
                CB
              </Text>
            </Box>
          </Group>
        </Box>
      </Box>
    );
  };

  // If mobile, return mobile ticker
  if (isMobile) {
    return <MobileTicker />;
  }

  // Desktop ticker continues below
  return (
    <>
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .ticker-scroll {
          animation: scroll 20s linear infinite;
        }

        .ticker-scroll.paused {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll {
            animation: none;
          }
        }

        @media (min-width: 768px) {
          .ticker-scroll {
            animation: scroll 45s linear infinite;
          }

          .powered-by-section {
            position: absolute !important;
            right: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 48px !important;
            border-top: none !important;
            border-left: 1px solid ${COLOUR.accent} !important;
            min-width: 200px !important;
            box-shadow: -8px 0 12px rgba(0, 0, 0, 0.2) !important;
          }
        }
      `}</style>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#1a1a1a",
          borderTop: `2px solid ${COLOUR.accent}`,
          zIndex: 998,
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Scrolling Content */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            paddingLeft: "16px",
            whiteSpace: "nowrap",
            height: "48px",
            overflow: "hidden",
          }}
          className={`ticker-scroll ${isPaused ? "paused" : ""}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {isLoading ? (
            <Group gap="xs" px="md">
              <Loader size="xs" color={COLOUR.accent} />
              <Text size="sm" c="white">
                Loading rates...
              </Text>
            </Group>
          ) : (
            tickerItems.map(([currencyCode, data], index) => {
              // Ensure rates are numbers
              const buyRate = Number(data.rates.buy) || 0;
              const sellRate = Number(data.rates.sell) || 0;
              const spread = buyRate - sellRate;
              const isPositive = spread >= 0;

              return (
                <Group
                  key={`${currencyCode}-${index}`}
                  gap="xs"
                  style={{
                    minWidth: "fit-content",
                    padding: "0 16px",
                    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* Flag */}
                  <Text size="lg">
                    {currencyFlags[currencyCode] && (
                      <Image
                        src={`https://flagcdn.com/16x12/${currencyFlags[
                          currencyCode
                        ]?.toLowerCase()}.png`}
                        alt={currencyCode}
                        style={{ width: "20px", height: "15px" }}
                      />
                    )}
                  </Text>

                  {/* Currency Code */}
                  <Text
                    size="sm"
                    fw={700}
                    c="white"
                    style={{ minWidth: "40px" }}
                  >
                    {currencyCode}
                  </Text>

                  {/* Buy Rate */}
                  <Group gap={4}>
                    <TrendingUp
                      size={14}
                      style={{ color: "#10b981", flexShrink: 0 }}
                    />
                    <Text
                      size="xs"
                      c="dimmed"
                      style={{ minWidth: "30px", textAlign: "left" }}
                    >
                      Buy
                    </Text>
                    <Text
                      size="sm"
                      fw={600}
                      c="#10b981"
                      ff="monospace"
                      style={{ minWidth: "60px", textAlign: "right" }}
                    >
                      {buyRate.toFixed(2)}
                    </Text>
                  </Group>

                  {/* Sell Rate */}
                  <Group gap={4}>
                    <TrendingDown
                      size={14}
                      style={{ color: "#ef4444", flexShrink: 0 }}
                    />
                    <Text
                      size="xs"
                      c="dimmed"
                      style={{ minWidth: "30px", textAlign: "left" }}
                    >
                      Sell
                    </Text>
                    <Text
                      size="sm"
                      fw={600}
                      c="#ef4444"
                      ff="monospace"
                      style={{ minWidth: "60px", textAlign: "right" }}
                    >
                      {sellRate.toFixed(2)}
                    </Text>
                  </Group>

                  {/* Spread Indicator */}
                  <Box
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: isPositive
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    <Text
                      size="xs"
                      c={isPositive ? "#10b981" : "#ef4444"}
                      ff="monospace"
                      fw={600}
                    >
                      {isPositive ? "+" : ""}
                      {spread.toFixed(2)}
                    </Text>
                  </Box>
                </Group>
              );
            })
          )}
        </Box>

        {/* Powered By Section - Below ticker on mobile, right side on desktop */}
        <Box
          style={{
            backgroundColor: "#1a1a1a",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 16px",
            height: "32px",
          }}
          className="powered-by-section"
        >
          <Group gap="xs" style={{ whiteSpace: "nowrap" }}>
            <Text size="xs" c="dimmed" fw={500}>
              Powered by
            </Text>
            <Text
              size="xs"
              fw={700}
              style={{
                background: `linear-gradient(90deg, ${COLOUR.accent}, ${COLOUR.primary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Choice Bank
            </Text>
            {/* Placeholder for logo */}
            <Box
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                backgroundColor: "rgba(240, 140, 35, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="10px" fw={700} c={COLOUR.accent}>
                CB
              </Text>
            </Box>
          </Group>
        </Box>
      </Box>
    </>
  );
};

export default ForexTicker;
