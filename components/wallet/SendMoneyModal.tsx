"use client";
import {
  Modal,
  Stack,
  Text,
  Card,
  ActionIcon,
  Transition,
  Group,
  Alert,
} from "@mantine/core";
import { useState } from "react";
import {
  Shield,
  ArrowLeftRight,
  Building2,
  Globe,
  CreditCard,
} from "lucide-react";
import GeneralTransfer from "./GeneralTransfer";
import BankTransfer from "./BankTransfer";
import InternationalTransfer from "./InternationalTransfer";

interface SendMoneyModalProps {
  opened: boolean;
  onClose: () => void;
  walletData: {
    currency: string;
    balance: string;
    accountId: string;
  };
}

// Transfer type configurations
const transferTypes = {
  general: {
    label: "General Transfer",
    icon: <ArrowLeftRight size={24} />,
    color: "#3D6B2C",
    description: "Send money to another wallet instantly",
    features: ["Instant transfer", "No fees", "24/7 availability"],
  },
  bank: {
    label: "Bank Transfer (RTGS/EFT)",
    icon: <Building2 size={24} />,
    color: "#F08C23",
    description: "Transfer to any bank account via RTGS or EFT",
    features: ["Same-day processing", "Secure transfer", "All local banks"],
  },
  international: {
    label: "International Transfer (SWIFT)",
    icon: <Globe size={24} />,
    color: "#1976D2",
    description: "Send money internationally via SWIFT network",
    features: ["Global coverage", "Competitive rates", "Tracked transfers"],
  },
};

// Custom styles matching PaymentModal
const customStyles = {
  primary: "#3D6B2C",
  secondary: "#F08C23",
  success: "#388E3C",
  gradient: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
  cardHover:
    "transform: translateY(-2px); box-shadow: 0 8px 25px rgba(61, 107, 44, 0.15);",
};

export default function SendMoneyModal({
  opened,
  onClose,
  walletData,
}: SendMoneyModalProps) {
  const [transferType, setTransferType] = useState<string>("");
  const [transferStep, setTransferStep] = useState<"select" | "form">("select");

  const handleClose = () => {
    setTransferStep("select");
    setTransferType("");
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setTransferType(type);
    setTransferStep("form");
  };

  const handleBackToSelect = () => {
    setTransferStep("select");
    setTransferType("");
  };

  const getStepTitle = () => {
    switch (transferStep) {
      case "select":
        return "Choose Transfer Type";
      case "form":
        return transferType
          ? transferTypes[transferType as keyof typeof transferTypes].label
          : "Transfer Details";
      default:
        return "Send Money";
    }
  };

  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: walletData.currency || "KES",
    }).format(numBalance);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <Shield size={20} style={{ color: "white" }} />
          <Text fw={600} size="lg" style={{ color: "white" }}>
            {getStepTitle()}
          </Text>
        </Group>
      }
      size="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "16px",
          overflow: "visible",
        },
        header: {
          background: customStyles.gradient,
          color: "white",
          padding: "20px 24px",
          borderBottom: "none",
        },
        title: {
          color: "white",
          fontWeight: 600,
        },
        close: {
          color: "white",
        },
        body: {
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <Stack gap="lg">
        {/* Transfer Type Selection */}
        <Transition
          mounted={transferStep === "select"}
          transition="slide-right"
          duration={300}
        >
          {(styles) => (
            <div style={styles}>
              <Text
                size="sm"
                fw={500}
                mb="md"
                style={{ color: customStyles.primary }}
              >
                Select your preferred transfer method:
              </Text>
              <Stack gap="sm">
                {Object.entries(transferTypes).map(([key, config]) => (
                  <Card
                    key={key}
                    withBorder
                    radius="md"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border:
                        transferType === key
                          ? `2px solid ${customStyles.primary}`
                          : "1px solid #e9ecef",
                    }}
                    onClick={() => handleTypeSelect(key)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(61, 107, 44, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <Group align="flex-start">
                      <div style={{ color: config.color, marginTop: "4px" }}>
                        {config.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text fw={600} size="md" mb={4}>
                          {config.label}
                        </Text>
                        <Text size="sm" c="dimmed" mb={8}>
                          {config.description}
                        </Text>
                        <Group gap={8}>
                          {config.features.map((feature, idx) => (
                            <Text
                              key={idx}
                              size="xs"
                              style={{
                                background: "#f1f3f5",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                color: "#495057",
                              }}
                            >
                              {feature}
                            </Text>
                          ))}
                        </Group>
                      </div>
                      <ActionIcon variant="light" color="gray" size="sm">
                        <CreditCard size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
              <Alert
                icon={<Shield size={16} />}
                title="Secure Transfer"
                color="teal"
                variant="light"
                mt="md"
              >
                <Text size="xs">
                  All transfers are encrypted and secure. Available Balance:{" "}
                  <strong>{formatBalance(walletData.balance)}</strong>
                </Text>
              </Alert>
            </div>
          )}
        </Transition>

        {/* Transfer Forms Based on Type */}
        {transferStep === "form" && transferType === "general" && (
          <GeneralTransfer
            walletData={walletData}
            onClose={handleClose}
            onBack={handleBackToSelect}
          />
        )}

        {/* Bank Transfer */}
        {transferStep === "form" && transferType === "bank" && (
          <BankTransfer
            walletData={walletData}
            onClose={handleClose}
            onBack={handleBackToSelect}
          />
        )}

        {/* International Transfer */}
        {transferStep === "form" && transferType === "international" && (
          <InternationalTransfer
            walletData={walletData}
            onClose={handleClose}
            onBack={handleBackToSelect}
          />
        )}
      </Stack>
    </Modal>
  );
}
