"use client";
import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  Stack,
  Group,
  Badge,
  Paper,
  Image,
  Grid,
  Card,
  Avatar,
  Transition,
  Container,
  Alert,
  Loader,
  //Center,
  Modal,
  //ActionIcon,
  //Tooltip,
} from "@mantine/core";
import {
  Package,
  Weight,
  Hash,
  Award,
  Camera,
  Eye,
  //Star,
  // CheckCircle,
  AlertCircle,
  // ArrowRight,
  // X,
  Zap,
  Trophy,
  Sparkles,
  ShoppingCart,
  Check,
} from "lucide-react";
import { awardRequestItems } from "@/api/requests";

import { Quote } from "@/types";

import { notify } from "@/lib/notifications";

interface RequestItem {
  id: string;
  name: string;
  description: string;
  visual_confirmation_required: 0 | 1;
  quotes: Quote[];
  status: string;
}

interface QuotesAccordionProps {
  quotes: Quote[];
  requestId: string;
  status: string;
  visual: boolean;
  refresh: () => void;
}

// Image Gallery Component
const ImageGallery: React.FC<{ images: string[]; itemName: string }> = ({
  images,
  itemName,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <Box className="relative">
        <Group gap="xs" mb="sm">
          <Camera size={16} className="text-[#F08C23]" />
          <Text size="sm" fw={600} className="text-gray-700">
            Visual Confirmation Images
          </Text>
          <Badge
            size="xs"
            variant="light"
            style={{ backgroundColor: "#F08C2315", color: "#F08C23" }}
          >
            {images.length} photos
          </Badge>
        </Group>

        <Grid gutter="xs">
          {images.map((image, index) => (
            <Grid.Col span={4} key={index}>
              <Paper
                className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                radius="md"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt={`${itemName} - Image ${index + 1}`}
                  height={80}
                  fit="cover"
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <Box className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Eye
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    size={20}
                  />
                </Box>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Box>

      <Modal
        opened={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="lg"
        title={`${itemName} - Visual Confirmation`}
        centered
      >
        {selectedImage && (
          <Image
            src={selectedImage}
            alt={itemName}
            fit="contain"
            className="max-h-96"
          />
        )}
      </Modal>
    </>
  );
};

// Success Component
export const AwardSuccessComponent: React.FC<{
  onBackToRequests: () => void;
  onMakePayment: () => void;
  supplierName: string;
  itemName: string;
  isCompleted: boolean;
  createOrder: () => void;
}> = ({
  onBackToRequests,
  onMakePayment,
  supplierName,
  isCompleted,
  createOrder,
}) => {
  return (
    <Transition mounted={true} transition="pop" duration={600}>
      {(styles) => (
        <Container size="sm" style={styles}>
          <Card
            shadow="xl"
            padding="xl"
            radius="lg"
            className="text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f0fff4 0%, #f8fffe 100%)",
              border: "2px solid #3D6B2C15",
            }}
          >
            {/* Animated background elements */}
            <Box
              className="absolute top-0 right-0 opacity-10 animate-pulse"
              style={{
                width: "150px",
                height: "150px",
                background:
                  "radial-gradient(circle, #3D6B2C 0%, transparent 70%)",
                transform: "translate(25%, -25%)",
              }}
            />

            <Stack gap="xl" align="center">
              <Box className="relative">
                <div className="animate-bounce">
                  <Trophy size={60} className="text-[#3D6B2C] drop-shadow-lg" />
                </div>
                <Sparkles
                  size={20}
                  className="absolute -top-2 -right-2 text-[#F08C23] animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </Box>

              <Stack gap="sm" align="center">
                {isCompleted ? (
                  <>
                    {" "}
                    <Text size="xl" fw={700} className="text-gray-800">
                      🎉 Payment Successfull
                    </Text>
                  </>
                ) : (
                  <>
                    <Text size="xl" fw={700} className="text-gray-800">
                      🎉 Quote Awarded Successfully!
                    </Text>
                    <Text size="md" c="dimmed" className="max-w-md">
                      {`You've successfully awarded the quote to`}{" "}
                      <strong className=" invisible text-[#3D6B2C]">
                        {supplierName}
                      </strong>
                    </Text>
                  </>
                )}
              </Stack>
              {/**The supplier has been notified and will begin processing
                    your order */}
              <Paper
                p="md"
                className="bg-[#3D6B2C05] border border-[#3D6B2C15] w-full"
              >
                {isCompleted ? (
                  <Text size="sm" fw={500} className="text-[#3D6B2C]">
                    ✅ Kindly create order to complete your order.
                  </Text>
                ) : (
                  <Text size="sm" fw={500} className="text-[#3D6B2C]">
                    Kindly make your payments to order items.
                  </Text>
                )}
              </Paper>

              <Group gap="sm" className="w-full">
                <Button
                  size="md"
                  radius="md"
                  className="flex-1 transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: "#3D6B2C" }}
                  rightSection={<ShoppingCart size={16} />}
                  onClick={isCompleted ? createOrder : onMakePayment}
                >
                  {isCompleted ? "Create Order" : "Make payment"}
                </Button>
                <Button
                  variant="light"
                  size="md"
                  radius="md"
                  className="flex-1"
                  style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
                  onClick={onBackToRequests}
                >
                  Back to Requests
                </Button>
              </Group>
            </Stack>
          </Card>
        </Container>
      )}
    </Transition>
  );
};

// Error Component
const AwardErrorComponent: React.FC<{
  message: string;
  onRetry: () => void;
  onCancel: () => void;
}> = ({ message, onRetry, onCancel }) => {
  return (
    <Transition mounted={true} transition="slide-up" duration={400}>
      {(styles) => (
        <Alert
          icon={<AlertCircle size={20} />}
          title="Award Failed"
          color="red"
          radius="md"
          style={styles}
          className="animate-shake"
        >
          <Stack gap="md">
            <Text size="sm">{message}</Text>
            <Group gap="sm">
              <Button size="sm" variant="light" color="red" onClick={onRetry}>
                Try Again
              </Button>
              <Button size="sm" variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Alert>
      )}
    </Transition>
  );
};

// Quote Card Component
const QuoteCard: React.FC<{
  quote: Quote;
  itemName?: string;
  onAward: () => void;
  isAwarding: boolean;
  awarded: Quote | undefined;
}> = ({ quote, itemName, onAward, isAwarding, awarded }) => {
  const handleAward = () => {
    if (awarded) {
    } else {
      onAward();
    }
  };
  const setButtonStatus = () => {
    if (awarded) {
      return `Awarded to ${awarded.detail.name}`;
    } else {
      return isAwarding ? "Awarding..." : "Award This Quote";
    }
  };
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100"
    >
      <Stack gap="md">
        {/* Supplier Header */}
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar
              src={quote.detail.name}
              size="md"
              radius="md"
              style={{ backgroundColor: "#3D6B2C15" }}
            >
              {quote.detail.name.charAt(0)}
            </Avatar>
            <Stack gap={2}>
              <Text fw={600} size="sm" className="text-gray-800">
                {quote.detail.name}
              </Text>
              {/*quote.rating && false && (
                <Group gap={4}>
                  <Star size={12} className="text-[#F08C23] fill-current" />
                  <Text size="xs" c="dimmed">
                    {quote.rating}/5.0
                  </Text>
                </Group>
              )*/}
            </Stack>
          </Group>
          <Badge
            variant="light"
            style={{
              backgroundColor: "#388E3C15",
              color: "#388E3C",
              display: "none",
            }}
          >
            <Zap size={10} className="mr-1" />
          </Badge>
        </Group>

        {/* Quote Details Grid */}
        <Grid gutter="md">
          <Grid.Col span={4}>
            <Paper p="sm" className="bg-[#3D6B2C05] text-center">
              <Stack gap={4}>
                <Hash size={16} className="text-[#3D6B2C] mx-auto" />
                <Text size="xs" c="dimmed" fw={500}>
                  Quantity
                </Text>
                <Text size="lg" fw={700} className="text-[#3D6B2C]">
                  {Number(quote.quantity)}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper p="sm" className="bg-[#F08C2305] text-center">
              <Stack gap={4}>
                <Package size={16} className="text-[#F08C23] mx-auto" />
                <Text size="xs" c="dimmed" fw={500}>
                  Unit Price
                </Text>
                <Text size="lg" fw={700} className="text-[#F08C23]">
                  Ksh {Number(quote.unit_price).toFixed(2)}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper p="sm" className="bg-[#388E3C05] text-center">
              <Stack gap={4}>
                <Weight size={16} className="text-[#388E3C] mx-auto" />
                <Text size="xs" c="dimmed" fw={500}>
                  Weight
                </Text>
                <Text size="lg" fw={700} className="text-[#388E3C]">
                  {Number(quote.total_weight)}kg
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Total Price Highlight */}
        <Paper
          p="md"
          className="bg-gradient-to-r from-[#3D6B2C05] to-[#388E3C05] border border-[#3D6B2C15]"
        >
          <Group justify="space-between" align="center">
            <Text fw={600} className="text-gray-700">
              Total Price
            </Text>
            <Text size="xl" fw={700} className="text-[#3D6B2C]">
              Ksh {quote.total_price.toLocaleString()}
            </Text>
          </Group>
        </Paper>

        {/* Visual Confirmation Images */}
        {false && quote.images && quote.images.length > 0 && (
          <ImageGallery images={quote.images} itemName={itemName ?? ""} />
        )}

        {/* Award Button */}
        {!!awarded ? (
          <Alert icon={<Check />}>{setButtonStatus()}</Alert>
        ) : (
          <Button
            size="md"
            radius="md"
            rightSection={
              isAwarding ? <Loader size={16} /> : <Award size={16} />
            }
            onClick={handleAward}
            loading={isAwarding}
            disabled={!!awarded}
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#3D6B2C" }}
          >
            {setButtonStatus()}
          </Button>
        )}
      </Stack>
    </Card>
  );
};

// Main Component
const QuotesAccordion: React.FC<QuotesAccordionProps> = ({
  quotes,
  requestId,
  status,
  refresh,
}) => {
  const [awardingQuote, setAwardingQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const awardee = quotes?.find((quote: Quote) => quote.is_awarded === 1);

  const handleAwardQuote = async (id: string) => {
    if (!confirm("Award quote?")) return;
    try {
      const payload = { quote_id: [id] };
      setAwardingQuote(id);
      setLoading(true);
      const result = await awardRequestItems(requestId, payload);
      if (result.status) {
        notify.success("Quote awarded successfully");
        refresh();
      } else {
        setError("Something went wrong...");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.log(error);
    } finally {
      setLoading(!true);
      setAwardingQuote(null);
    }
  };

  return (
    <Container size="lg" mt="md">
      <Stack gap="xl">
        {/* Header */}
        <Box className="text-center">
          {status === "awarded" ? null : (
            <>
              <Text size="xl" fw={700} className="text-gray-800 mb-2">
                📋 Review Quotes for Your Item
              </Text>
              <Text size="md" c="dimmed">
                Compare quotes from different suppliers and award the best one
              </Text>
            </>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <AwardErrorComponent
            message={error || "Failed to award quote"}
            onRetry={() => setError("")}
            onCancel={() => {}}
          />
        )}

        <Transition mounted={true} duration={300} transition="fade">
          {(styles) => (
            <Stack gap="md" style={styles}>
              {quotes.length === 0 ? (
                <Paper p="xl" className="text-center bg-gray-50">
                  <Stack gap="sm" align="center">
                    <Package size={40} className="text-gray-400" />
                    <Text c="dimmed">No quotes received yet</Text>
                  </Stack>
                </Paper>
              ) : (
                quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    awarded={awardee}
                    onAward={() => handleAwardQuote(quote.id)}
                    isAwarding={awardingQuote === quote.id && loading}
                  />
                ))
              )}
            </Stack>
          )}
        </Transition>
      </Stack>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </Container>
  );
};

export default QuotesAccordion;
export type { Quote, RequestItem, QuotesAccordionProps };
