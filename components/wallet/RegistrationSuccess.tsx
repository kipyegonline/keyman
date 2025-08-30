"use client";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Card,
} from "@mantine/core";
import { CheckCircle, Wallet, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegistrationSuccessProps {
  onClose?: () => void;
}

export default function RegistrationSuccess({
  onClose,
}: RegistrationSuccessProps) {
  const router = useRouter();

  const handleNavigateToWallet = () => {
    router.push("/keyman/supplier/key-wallet");
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" radius="lg" p="xl" className="bg-white text-center">
        <Stack gap="lg" align="center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          <div>
            <Title order={2} style={{ color: "#3D6B2C" }} className="mb-3">
              Registration Successful! 🎉
            </Title>
            <Text size="lg" c="dimmed" className="max-w-md mx-auto">
              Your wallet registration has been submitted successfully. You can
              now access your digital wallet and start making secure
              transactions.
            </Text>
          </div>

          <Card
            className="w-full max-w-md bg-green-50 border border-green-200"
            radius="md"
          >
            <Text
              size="sm"
              fw={500}
              style={{ color: "#3D6B2C" }}
              className="mb-2"
            >
              {`What's Next?`}
            </Text>
            <Text size="sm" c="dimmed">
              {`Your registration is being reviewed. You'll receive a confirmation once your wallet is activated. In the meantime, you can explore your wallet dashboard.`}
            </Text>
          </Card>

          <Stack gap="sm" className="w-full max-w-sm">
            <Button
              size="lg"
              onClick={handleNavigateToWallet}
              rightSection={<ArrowRight size={20} />}
              style={{ backgroundColor: "#3D6B2C" }}
              className="hover:opacity-90 w-full"
            >
              Go to My Wallet
            </Button>

            {onClose && (
              <Button
                variant="light"
                size="md"
                onClick={onClose}
                className="w-full"
              >
                Create Another Wallet
              </Button>
            )}
          </Stack>

          <div className="flex items-center gap-2 text-green-600">
            <Wallet size={16} />
            <Text size="xs" c="dimmed">
              Powered by Keyman Stores Secure Wallet System
            </Text>
          </div>
        </Stack>
      </Paper>
    </Container>
  );
}
