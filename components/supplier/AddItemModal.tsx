import React from "react";
import {
  Modal,
  TextInput,
  Select,
  Group,
  ActionIcon,
  Paper,
  Stack,
  NumberInput,
  Textarea,
  FileInput,
  Button,
  Avatar,
  Box,
  Text,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import {
  Plus,
  Package,
  HandCoins,
  Weight,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { Pricelist } from "./priceList";

interface AddItemModalProps {
  opened: boolean;
  onClose: () => void;
  addForm: UseFormReturnType<Pricelist>;
  file: File | null;
  setFile: (file: File | null) => void;
  onSubmit: () => void;
  loading: boolean;
}

const services = [
  { label: "Goods", value: "goods" },
  { label: "Services", value: "services" },
  { label: "Professional Services", value: "professional_services" },
];

export const AddItemModal = React.memo<AddItemModalProps>(
  ({ opened, onClose, addForm, file, setFile, onSubmit, loading }) => {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <Avatar
              size="sm"
              radius="xl"
              style={{ backgroundColor: "#3D6B2C" }}
            >
              <Plus size={16} color="white" />
            </Avatar>
            <Text fw={600}>Add New Item</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="md">
          {/* Item Name */}
          <TextInput
            label="Item Name"
            placeholder="Enter item name"
            leftSection={<Package size={16} />}
            size="lg"
            required
            radius="md"
            {...addForm.getInputProps("name")}
          />

          {/* Swahili Name */}
          <TextInput
            label="Swahili Name"
            placeholder="Enter Swahili name"
            leftSection={<Package size={16} />}
            size="lg"
            radius="md"
            {...addForm.getInputProps("swahili_name")}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Enter item description"
            size="lg"
            radius="md"
            minRows={3}
            {...addForm.getInputProps("description")}
          />

          {/* Item Type */}
          <Select
            label="Item Type"
            leftSection={<Package size={16} />}
            data={services}
            size="lg"
            required
            radius="md"
            {...addForm.getInputProps("type")}
          />

          {/* Price */}
          <NumberInput
            label="Price (KES)"
            placeholder="Enter price"
            leftSection={<HandCoins size={16} />}
            thousandSeparator=","
            decimalScale={2}
            size="lg"
            required
            radius="md"
            min={0}
            {...addForm.getInputProps("price")}
          />

          {/* Metrics */}
          <TextInput
            label="Metrics (Kgs/Litres/Metres)"
            size="lg"
            radius="md"
            required
            placeholder="Enter item metrics unit"
            maxLength={10}
            {...addForm.getInputProps("metrics")}
          />

          {/* Weight */}
          <NumberInput
            label="Weight (Kg)"
            placeholder="Enter item weight"
            leftSection={<Weight size={16} />}
            decimalScale={2}
            size="lg"
            radius="md"
            min={0}
            {...addForm.getInputProps("weight_in_kgs")}
          />

          {/* Transportation Type */}
          <Select
            label="Transportation Type"
            data={[
              { value: "TUKTUK", label: "🛺 TukTuk" },
              { value: "PICKUP", label: "🚛 Pickup" },
              { value: "LORRY", label: "🚚 Lorry" },
            ]}
            size="lg"
            required
            radius="md"
            {...addForm.getInputProps("transportation_type")}
          />

          {/* Image Upload */}
          <FileInput
            label="Item Image (Optional)"
            description="Upload an image of the item (Max 5MB, JPEG/PNG/WebP)"
            placeholder="Choose image file"
            value={file}
            onChange={setFile}
            leftSection={<ImageIcon size={16} />}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            size="lg"
            radius="md"
            clearable
            styles={{
              input: {
                cursor: "pointer",
                "&::placeholder": {
                  color: "#868e96",
                },
              },
            }}
          />

          {/* Image Preview */}
          {file && (
            <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
              <Group>
                <Avatar
                  size="lg"
                  radius="md"
                  src={URL.createObjectURL(file)}
                  alt="Item preview"
                >
                  <ImageIcon size={24} />
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {file.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </Box>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => setFile(null)}
                >
                  <X size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end" mt="xl">
            <Button
              variant="light"
              color="gray"
              leftSection={<X size={16} />}
              onClick={onClose}
              radius="xl"
            >
              Cancel
            </Button>
            <Button
              color="#3D6B2C"
              leftSection={<Upload size={16} />}
              onClick={onSubmit}
              loading={loading}
              radius="xl"
            >
              Add Item
            </Button>
          </Group>
        </Stack>
      </Modal>
    );
  }
);

AddItemModal.displayName = "AddItemModal";
