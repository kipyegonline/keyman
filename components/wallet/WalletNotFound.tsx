"use client";
import { createWallet } from "@/api/wallet";
import {
  Container,
  Button,
  Group,
  Stack,
  Modal,
  Text,
  Paper,
  Title,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Wallet, Plus, Check } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

export default function WalletNotFound() {
  const [createWalletModalOpen, setCreateWalletModalOpen] = useState(false);
  //const queryClient = useQueryClient();
  const router = useRouter();

  const createWalletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: (data) => {
      if (data.status) {
        notifications.show({
          title: "Success",
          message: "Wallet created successfully!",
          color: "green",
          icon: <Check size={16} />,
        });
        setCreateWalletModalOpen(false);
        // queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        navigateTo();
        router.push("/keyman/supplier/key-wallet/create");
      }
    },
  });

  const handleCreateWallet = () => {
    createWalletMutation.mutate();
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="lg" p="xl" style={{ textAlign: "center" }}>
        <Wallet
          size={80}
          className="text-keyman-green"
          style={{ margin: "0 auto 20px" }}
        />
        <Title order={2} mb="md">
          Create Your Wallet
        </Title>
        <Text size="lg" c="dimmed" mb="xl">
          Get started with Keyman Stores digital wallet to manage your payments
          and earnings securely.
        </Text>
        <Button
          size="lg"
          leftSection={<Plus size={16} />}
          onClick={() => setCreateWalletModalOpen(true)}
          loading={createWalletMutation.isPending}
        >
          Create Wallet
        </Button>
      </Paper>

      <Modal
        opened={createWalletModalOpen}
        onClose={() => setCreateWalletModalOpen(false)}
        title="Create Wallet"
        centered
      >
        <Stack>
          <Text>
            Creating a wallet will allow you to receive payments, manage your
            earnings, and make transactions securely.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setCreateWalletModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWallet}
              loading={createWalletMutation.isPending}
            >
              Create Wallet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
