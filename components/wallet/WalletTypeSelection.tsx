"use client";
import {
  Container,
  Paper,
  Title,
  Text,
  Card,
  Group,
  ThemeIcon,
  Grid,
  Divider,
  Checkbox,
  Flex,
} from "@mantine/core";
import { User, Building, Shield, CreditCard } from "lucide-react";
import { useState } from "react";
import PaymentDetailsModal from "./PaymentDetailsModal";

interface WalletTypeSelectionProps {
  onTypeSelect: (data: {
    type: "personal" | "business";
    payment_method: string;
    phone_number: string;
  }) => void;
  isLoading?: boolean;
}

function WalletTypeSelection({
  onTypeSelect,
  isLoading = false,
}: WalletTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<
    "personal" | "business" | null
  >(null);
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);

  const handleTypeSelect = (type: "personal" | "business") => {
    setSelectedType(type);
    setPaymentModalOpened(true);
  };

  const handlePaymentSubmit = (data: {
    type: "personal" | "business";
    payment_method: string;
    phone_number: string;
  }) => {
    onTypeSelect(data);
    //setPaymentModalOpened(false);
  };

  const handleCloseModal = () => {
    setPaymentModalOpened(false);
    setSelectedType(null);
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="lg" p="xl" className="bg-white">
        <div className="text-center mb-8">
          <ThemeIcon
            size={80}
            radius="xl"
            className="mx-auto mb-4"
            style={{ backgroundColor: "#3D6B2C15" }}
          >
            <CreditCard size={40} style={{ color: "#3D6B2C" }} />
          </ThemeIcon>

          <Title order={2} style={{ color: "#3D6B2C" }} className="mb-2">
            Choose Your Wallet Type
          </Title>
          <Text size="lg" c="dimmed" className="max-w-md mx-auto">
            Select the type of wallet that best suits your needs to get started
            with Keyman Stores
          </Text>
        </div>

        <Grid gutter="xl" className="mb-8">
          {/* Personal Wallet Option */}
          <Grid.Col span={{ base: 12 }}>
            <Card
              className="h-full border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
              radius="lg"
              p="xl"
              onClick={() => !isLoading && handleTypeSelect("personal")}
              style={{
                borderColor:
                  selectedType === "personal" ? "#3D6B2C" : "#E9ECEF",
                backgroundColor:
                  selectedType === "personal" ? "#3D6B2C05" : "white",
              }}
            >
              <Flex gap="lg" align="flex-start">
                {/* Left side - Icon and Features */}
                <div className="flex-shrink-0">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    style={{
                      backgroundColor:
                        selectedType === "personal" ? "#3D6B2C" : "#3D6B2C15",
                      color: selectedType === "personal" ? "white" : "#3D6B2C",
                    }}
                    className="mb-4"
                  >
                    <User size={30} />
                  </ThemeIcon>
                </div>

                {/* Right side - Content and Checkbox */}
                <div className="flex-1">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    className="mb-3"
                  >
                    <div>
                      <Title
                        order={3}
                        className="mb-2"
                        style={{ color: "#3D6B2C" }}
                      >
                        Personal Wallet
                      </Title>
                      <Text size="sm" c="dimmed">
                        Perfect for individual contractors, freelancers, and
                        personal transactions
                      </Text>
                    </div>

                    <Checkbox
                      checked={selectedType === "personal"}
                      onChange={() =>
                        !isLoading && handleTypeSelect("personal")
                      }
                      color="#3D6B2C"
                      size="md"
                      disabled={isLoading}
                    />
                  </Group>
                </div>
              </Flex>
            </Card>
          </Grid.Col>

          {/* Business Wallet Option */}
          <Grid.Col span={{ base: 12 }}>
            <Card
              className="h-full border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
              radius="lg"
              p="xl"
              onClick={() => !isLoading && handleTypeSelect("business")}
              style={{
                borderColor:
                  selectedType === "business" ? "#F08C23" : "#E9ECEF",
                backgroundColor:
                  selectedType === "business" ? "#F08C2305" : "white",
              }}
            >
              <Flex gap="lg" align="flex-start">
                {/* Left side - Icon and Features */}
                <div className="flex-shrink-0">
                  <ThemeIcon
                    size={60}
                    radius="xl"
                    style={{
                      backgroundColor:
                        selectedType === "business" ? "#F08C23" : "#F08C2315",
                      color: selectedType === "business" ? "white" : "#F08C23",
                    }}
                    className="mb-4"
                  >
                    <Building size={30} />
                  </ThemeIcon>
                </div>

                {/* Right side - Content and Checkbox */}
                <div className="flex-1">
                  <Group
                    justify="space-between"
                    align="flex-start"
                    className="mb-3"
                  >
                    <div>
                      <Title
                        order={3}
                        className="mb-2"
                        style={{ color: "#F08C23" }}
                      >
                        Business Wallet
                      </Title>
                      <Text size="sm" c="dimmed">
                        Ideal for companies, registered businesses, and
                        organizations
                      </Text>
                    </div>

                    <Checkbox
                      checked={selectedType === "business"}
                      onChange={() =>
                        !isLoading && handleTypeSelect("business")
                      }
                      color="#F08C23"
                      size="md"
                      disabled={isLoading}
                    />
                  </Group>
                </div>
              </Flex>
            </Card>
          </Grid.Col>
        </Grid>

        <Divider className="mb-6" />

        <div className="text-center">
          <Group gap="sm" justify="center" className="mb-4">
            <Shield size={16} className="text-green-600" />
            <Text size="sm" fw={500}>
              Secure & Verified Digital Wallet System
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Your wallet type can be changed later in settings if needed. All
            transactions are secured and encrypted.
          </Text>
        </div>
      </Paper>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        opened={paymentModalOpened}
        onClose={handleCloseModal}
        walletType={selectedType || "personal"}
        onSubmit={handlePaymentSubmit}
        isLoading={isLoading}
      />
    </Container>
  );
}

export default WalletTypeSelection;
