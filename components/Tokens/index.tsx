import React, { useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  //Select,
  Button,
  Group,
  Stack,
  Card,
  //Badge,
  //Divider,
  Alert,
  Loader,
  ActionIcon,
  Transition,
  //Paper,
  NumberInput,
  //Notification,
  Image,
  List,
  ListItem,
  Box,
  Divider,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  // X,
  Lock,
  Shield,
  Zap,
  Phone,
  FileText,
  Coins,
} from "lucide-react";
import {
  makePayments,
  // confirmPaymentTransaction
} from "@/api/coin";
import { notify } from "@/lib/notifications";

// Types
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "user" | "detail" | "request";
  typeId: string;
  amount: number;
  description: string;
  availablePaymentMethods?: ("mpesa" | "airtel_money" | "t_kash")[];
  onPaymentSuccess: () => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentFormData {
  paymentMethod: string;
  phoneNumber: string;
  amount: number;
  description: string;
}
/*
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  paymentData: PaymentFormData;
}
*/
// Payment method configurations
const paymentMethods = {
  mpesa: {
    label: "M-Pesa",
    icon: <Smartphone size={24} />,
    img: "/mpesa.png",
    color: "#00A651",
    description: "Pay with M-Pesa",
    regex: /[17][0-9]{8}$/,
    placeholder: "254712345678",
  },
  airtel_money: {
    label: "Airtel Money",
    img: "/airtelmoney.png",
    icon: <CreditCard size={24} />,
    color: "#FF0000",
    description: "Pay with Airtel Money",
    regex: /[17][0-9]{8}$/,
    placeholder: "254733000000",
  },
  t_kash: {
    label: "T-Kash",
    img: "/tkash.png",
    icon: <Zap size={24} />,
    color: "#FF6B35",
    description: "Pay with T-Kash",
    regex: /[17][0-9]{8}$/,
    placeholder: "254712345678",
  },
};

// Custom styles for the component
const customStyles = {
  primary: "#3D6B2C",
  secondary: "#F08C23",
  success: "#388E3C",
  gradient: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
  cardHover:
    "transform: translateY(-2px); box-shadow: 0 8px 25px rgba(61, 107, 44, 0.15);",
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  typeId,
  amount,
  description,
  availablePaymentMethods = ["mpesa", "airtel_money", "t_kash"],
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [customerMessage, setCustomerMessage] = useState<string[]>([]);
  //const [requestId, setrequestId] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState<
    "select" | "form" | "customer" | "processing" | "confirming" | "success"
  >("select");

  const form = useForm<PaymentFormData>({
    initialValues: {
      paymentMethod: "",
      phoneNumber: "",
      amount: amount,
      description: description,
    },
    validate: {
      paymentMethod: (value) =>
        !value ? "Please select a payment method" : null,
      phoneNumber: (value, values) => {
        if (!value) return "Phone number is required";
        const method =
          paymentMethods[values.paymentMethod as keyof typeof paymentMethods];
        if (method && !method.regex.test(value)) {
          return "Please enter a valid phone number (e.g., 254712345678)";
        }
        return null;
      },
      amount: (value) => (value < 10 ? "Minimum amount is KES 10" : null),
    },
  });

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    form.setFieldValue("paymentMethod", method);
    setPaymentStep("form");
  };

  const handlePayment = async (values: PaymentFormData) => {
    setLoading(true);

    const payload = {
      type,
      type_id: typeId,
      amount: values.amount,
      phone_number: values.phoneNumber,
      payment_method: values.paymentMethod,
      description: values.description,
    };

    try {
      setPaymentStep("processing");
      const result = await makePayments(payload);

      console.log(result.original.status, result);
      if (result.original.status) {
        const { CustomerMessage } = result.original;
        const steps = CustomerMessage.split(/\d+\.\s*/).filter(
          (step: string) => step.trim() !== ""
        );
        setCustomerMessage(steps);
        setPaymentStep("customer");
        //setrequestId(CheckoutRequestID);

        /*setPaymentStep("customer");
        notifications.show({
          title: "Payment Successful!",
          message: `Transaction ID: `,
          color: "green",
          icon: <CheckCircle size={16} />,
          autoClose: 5000,
        });

        //onPaymentSuccess?.(result);

        setTimeout(() => {
          handleClose();
        }, 3000);*/
      } else {
        setPaymentStep("form");
        notify.error(result.original.detail, "Payment failed");
      }
    } catch (error) {
      setLoading(false);
      setPaymentStep("form");

      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";

      notifications.show({
        title: "Payment Failed",
        message: errorMessage,
        color: "red",
        icon: <AlertCircle size={16} />,
        autoClose: 5000,
      });

      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    onPaymentSuccess();

    setTimeout(() => {
      handleClose();
    }, 3000);
    /*
    return;
    setLoading(true);
    try {
      setPaymentStep("confirming");
      const result = await confirmPaymentTransaction(requestId);
      if (result.status) {
        setPaymentStep("success");
        notify.success(result.message || "Payment confirmed successfully!");
        setTimeout(() => {
          handleClose();
          onPaymentSuccess();
        }, 3000);
      } else {
        notify.error(result.message || "Payment confirmation failed.");
        setPaymentStep("customer");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment confirmation failed";
      notify.error(errorMessage);
      setPaymentStep("customer");
    } finally {
      setLoading(false);
    }*/
  };
  const handleClose = () => {
    setPaymentStep("select");
    setSelectedMethod("");
    form.reset();
    setLoading(false);
    onClose();
  };

  const getStepTitle = () => {
    switch (paymentStep) {
      case "select":
        return "Choose Payment Method";
      case "form":
        return "Payment Details";
      case "customer":
        return "Customer Message";
      case "processing":
        return "Processing Payment";
      case "success":
        return "Payment Successful";
      default:
        return "Payment";
    }
  };
  const modifyString = (word: string) => {
    if (word.includes(":")) return word.split(":");
    return word;
  };
  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Group>
          <Shield size={20} style={{ color: "white" }} />
          <Text fw={600} size="lg" style={{ color: "white" }}>
            {getStepTitle()}
          </Text>
        </Group>
      }
      size="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "16px",
          overflow: "hidden",
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
        },
      }}
    >
      <Stack gap="lg">
        {/* Payment Summary */}

        <Card
          withBorder
          display="none"
          radius="md"
          style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
        ></Card>

        {/* Payment Method Selection */}
        <Transition
          mounted={paymentStep === "select"}
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
                Select your preferred payment method:
              </Text>
              <Stack gap="sm">
                {availablePaymentMethods.map((method) => {
                  const config = paymentMethods[method];
                  return (
                    <Card
                      key={method}
                      withBorder
                      radius="md"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border:
                          selectedMethod === method
                            ? `2px solid ${customStyles.primary}`
                            : "1px solid #e9ecef",
                      }}
                      onClick={() => handleMethodSelect(method)}
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
                      <Group>
                        <div style={{ color: config.color, display: "none" }}>
                          {config.icon}
                        </div>
                        <div className="w-10 h-10">
                          <Image
                            src={config.img}
                            alt=""
                            width={100}
                            height={100}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text fw={500}>{config.label}</Text>
                          <Text size="sm" c="dimmed">
                            {config.description}
                          </Text>
                        </div>
                        <ActionIcon variant="light" color="gray" size="sm">
                          <CreditCard size={16} />
                        </ActionIcon>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </div>
          )}
        </Transition>

        {/* Payment Form */}
        <Transition
          mounted={paymentStep === "form"}
          transition="slide-left"
          duration={300}
        >
          {(styles) => (
            <div style={styles}>
              <form onSubmit={form.onSubmit(handlePayment)}>
                <Stack gap="md">
                  {selectedMethod && (
                    <Alert
                      icon={
                        <>
                          <Image
                            src={
                              paymentMethods[
                                selectedMethod as keyof typeof paymentMethods
                              ].img
                            }
                            alt=""
                            width={150}
                            height={150}
                          />
                        </>
                      }
                      title={`Pay with ${
                        paymentMethods[
                          selectedMethod as keyof typeof paymentMethods
                        ].label
                      }`}
                      color="green"
                      variant="light"
                    >
                      <Text size="sm">
                        {`You'll receive a payment prompt on your phone after
                        clicking "Pay Now"`}
                      </Text>
                    </Alert>
                  )}

                  <TextInput
                    label="Phone Number"
                    placeholder={
                      selectedMethod
                        ? paymentMethods[
                            selectedMethod as keyof typeof paymentMethods
                          ].placeholder
                        : "Enter phone number"
                    }
                    leftSection={<Phone size={16} />}
                    {...form.getInputProps("phoneNumber")}
                    styles={{
                      label: { color: customStyles.primary, fontWeight: 500 },
                      input: {
                        borderColor: form.errors.phoneNumber
                          ? "#fa5252"
                          : customStyles.primary,
                      },
                    }}
                  />

                  <NumberInput
                    label="Amount (KES)"
                    placeholder="Enter amount"
                    leftSection={<Coins size={16} />}
                    min={1}
                    hideControls
                    {...form.getInputProps("amount")}
                    styles={{
                      label: { color: customStyles.primary, fontWeight: 500 },
                      input: {
                        borderColor: form.errors.amount
                          ? "#fa5252"
                          : customStyles.primary,
                      },
                    }}
                  />

                  <TextInput
                    label="Description"
                    placeholder="Payment description"
                    leftSection={<FileText size={16} />}
                    {...form.getInputProps("description")}
                    styles={{
                      label: { color: customStyles.primary, fontWeight: 500 },
                      input: { borderColor: customStyles.primary },
                    }}
                  />

                  <Group justify="space-between" mt="md">
                    <Button
                      variant="outline"
                      color="gray"
                      onClick={() => setPaymentStep("select")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      style={{ background: customStyles.gradient }}
                      leftSection={<Lock size={16} />}
                    >
                      Pay Now
                    </Button>
                  </Group>
                </Stack>
              </form>
            </div>
          )}
        </Transition>
        {/* Payment instructions */}
        <Transition
          mounted={paymentStep === "customer"}
          transition="slide-left"
          duration={300}
        >
          {(styles) => (
            <Card style={styles}>
              <Box mb="sm">
                <Text size="lg" fw={700}>
                  Payment Instructions
                </Text>
                <Text size="sm">
                  Please check your phone for the payment prompt and complete
                  the transaction{" "}
                  {customerMessage.length > 0
                    ? "or follow instructions below."
                    : ""}
                </Text>
              </Box>
              <Divider />
              <List>
                {customerMessage.map((message, index) => (
                  <ListItem key={index} className="!capitalize mt-2">
                    <span className="mr-1">{index + 1}.</span>{" "}
                    {typeof modifyString(message) === "string" ? (
                      message
                    ) : (
                      <>
                        {" "}
                        {modifyString(message)[0]}:
                        <strong className="ml-1">
                          {modifyString(message)[1]}
                        </strong>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
              <Flex justify={"flex-end"}>
                <Button
                  mt="sm"
                  onClick={handleConfirmPayment}
                  loading={loading}
                >
                  Continue
                </Button>
              </Flex>
            </Card>
          )}
        </Transition>

        {/* Processing State */}
        <Transition
          mounted={paymentStep === "processing"}
          transition="fade"
          duration={300}
        >
          {(styles) => (
            <div style={styles}>
              <Stack align="center" gap="lg" py="xl">
                <Loader size="xl" color={customStyles.primary} />
                <Text
                  size="lg"
                  fw={500}
                  style={{ color: customStyles.primary }}
                >
                  Processing your payment...
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Please check your phone for the payment prompt and complete
                  the transaction.
                </Text>
              </Stack>
            </div>
          )}
        </Transition>

        {/* Success State */}
        <Transition
          mounted={paymentStep === "success"}
          transition="pop"
          duration={300}
        >
          {(styles) => (
            <div style={styles}>
              <Stack align="center" gap="lg" py="xl">
                <CheckCircle
                  size={64}
                  style={{ color: customStyles.success }}
                />
                <Text
                  size="xl"
                  fw={600}
                  style={{ color: customStyles.success }}
                >
                  Payment Successful!
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Your payment has been processed successfully. You will receive
                  a confirmation message shortly.
                </Text>
              </Stack>
            </div>
          )}
        </Transition>

        {/* Security Notice */}
        {paymentStep === "select" && false && (
          <Alert
            icon={<Lock size={16} />}
            title="Secure Payment"
            color="teal"
            variant="light"
          >
            <Text size="xs">
              Your payment information is encrypted and secure. We never store
              your payment details.
            </Text>
          </Alert>
        )}
      </Stack>
    </Modal>
  );
};

export default PaymentModal;
