"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupportedCurrencies, getForexRates } from "@/api/wallet";
import { Box, Text, Group, Loader, Image } from "@mantine/core";
import { TrendingUp, TrendingDown } from "lucide-react";
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

  // Don't render if no data or error
  if (isError || !ratesData?.success || !ratesData?.rates) {
    return null;
  }

  const currencyEntries = Object.entries(ratesData.rates);

  // Duplicate the entries for seamless loop
  const tickerItems = [...currencyEntries, ...currencyEntries];

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
          animation: scroll 45s linear infinite;
        }

        .ticker-scroll.paused {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll {
            animation: none;
          }
        }
      `}</style>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: "24px", // Add left margin
          right: "calc(56px + 24px)", // FAB width + margins
          height: "48px",
          backgroundColor: "#1a1a1a",
          borderTop: `2px solid ${COLOUR.accent}`,
          zIndex: 998,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
          borderRadius: "8px 0 0 0", // Rounded top-left corner
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

        {/* Static Powered By Section */}
        <Box
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "#1a1a1a",
            borderLeft: `1px solid ${COLOUR.accent}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            minWidth: "200px",
            boxShadow: "-8px 0 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Group gap="xs" style={{ whiteSpace: "nowrap" }}>
            <Text size="xs" c="dimmed" fw={500}>
              Powered by
            </Text>
            <Text
              size="sm"
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
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                backgroundColor: "rgba(240, 140, 35, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="xs" fw={700} c={COLOUR.accent}>
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
