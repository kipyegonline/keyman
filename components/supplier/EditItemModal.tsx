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
import { useMediaQuery } from "@mantine/hooks";
import { UseFormReturnType } from "@mantine/form";
import { Edit3, HandCoins, Weight, ImageIcon, Save, X } from "lucide-react";
import { Pricelist } from "./priceList";

const transportationTypes = [
  { value: "TUKTUK", label: "🛺 TukTuk" },
  { value: "PICKUP", label: "🚛 Pickup" },
  { value: "LORRY", label: "🚚 Lorry" },
];

interface EditItemModalProps {
  opened: boolean;
  onClose: () => void;
  editForm: UseFormReturnType<Pricelist>;
  file: File | null;
  setFile: (file: File | null) => void;
  onSubmit: () => void;
  loading: boolean;
  selectedItem: Pricelist | null;
  getItemEmoji: (type: string, name: string) => string;
}

export const EditItemModal = React.memo<EditItemModalProps>(
  ({
    opened,
    onClose,
    editForm,
    file,
    setFile,
    onSubmit,
    loading,
    selectedItem,
    getItemEmoji,
  }) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

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
              <Edit3 size={16} color="white" />
            </Avatar>
            <Text fw={600}>Update Item Price</Text>
          </Group>
        }
        size="md"
        radius="lg"
        centered
      >
        {selectedItem && (
          <Stack gap="md">
            <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
              <Text size="lg" fw={600} mb="xs">
                {getItemEmoji(editForm.values.type, editForm.values.name)}{" "}
                {editForm.values.name}
              </Text>
              <Text size="sm" c="dimmed">
                {editForm.values.swahili_name}
              </Text>
            </Paper>

            <NumberInput
              label="Price (KES)"
              placeholder="Enter new price"
              leftSection={<HandCoins size={16} />}
              thousandSeparator=","
              decimalScale={2}
              size="lg"
              required
              radius="md"
              min={0}
              {...editForm.getInputProps("price")}
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Enter item description"
              size="lg"
              radius="md"
              minRows={3}
              maxLength={500}
              {...editForm.getInputProps("description")}
            />

            {isMobile ? (
              <Box display="none">
                <Text size="sm" fw={500} mb={4}>
                  Transportation Type
                </Text>
                <select
                  {...editForm.getInputProps("transportation_type")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "16px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    color: "#495057",
                    cursor: "pointer",
                    outline: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23495057' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "36px",
                  }}
                >
                  <option value="" disabled>
                    Select transportation type
                  </option>
                  {transportationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Box>
            ) : (
              <Select
                label="Transportation Type"
                data={transportationTypes}
                display="none"
                size="lg"
                radius="md"
                {...editForm.getInputProps("transportation_type")}
              />
            )}

            <NumberInput
              label="Weight (kg)"
              leftSection={<Weight size={16} />}
              decimalScale={2}
              size="lg"
              display="none"
              radius="md"
              min={0}
              {...editForm.getInputProps("weight_in_kgs")}
            />

            {/* Stock */}
            <TextInput
              label="Stock"
              placeholder="Enter item stock"
              size="lg"
              radius="md"
              {...editForm.getInputProps("stock")}
            />

            {/* Metrics */}
            <TextInput
              label="Metrics"
              placeholder="Enter item Metrics (kgs/litres)"
              size="lg"
              radius="md"
              {...editForm.getInputProps("metrics")}
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
                leftSection={<Save size={16} />}
                onClick={onSubmit}
                loading={loading}
                radius="xl"
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    );
  }
);

EditItemModal.displayName = "EditItemModal";
