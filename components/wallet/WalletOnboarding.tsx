import { Container, Alert } from "@mantine/core";
import { AlertCircle } from "lucide-react";

export default function WalletOnboarding() {
  return (
    <Container size="md" py="xl">
      <Alert
        icon={<AlertCircle size={16} />}
        title="Wallet Setup"
        color="orange"
      >
        Your wallet setup is in progress. Onboarding process is ongoing. check
        back soon.
      </Alert>
    </Container>
  );
}
