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
  Grid,
  Image,
  Badge,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { UseFormReturnType } from "@mantine/form";
import {
  Edit3,
  HandCoins,
  Weight,
  ImageIcon,
  Save,
  X,
  Trash2,
} from "lucide-react";
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
  newFiles: File[];
  imagesToDelete: string[];
  onAddNewImages: (files: File[] | null) => void;
  onMarkImageForDeletion: (url: string) => void;
  onRemoveNewFile: (index: number) => void;
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
    // file,
    // setFile,
    newFiles,
    imagesToDelete,
    onAddNewImages,
    onMarkImageForDeletion,
    onRemoveNewFile,
    onSubmit,
    loading,
    selectedItem,
    getItemEmoji,
  }) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const currentImageCount =
      (editForm.values.attachment_url?.length || 0) - imagesToDelete.length;
    const totalImageCount = currentImageCount + newFiles.length;
    const canAddMore = totalImageCount < 5;

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

            {/* Current Images */}
            {editForm.values.attachment_url &&
              editForm.values.attachment_url.length > 0 && (
                <Box>
                  <Text size="sm" fw={500} mb="sm">
                    Current Images
                  </Text>
                  <Grid>
                    {editForm.values.attachment_url.map((url, index) => (
                      <Grid.Col
                        span={{ base: 6, sm: 4 }}
                        key={`existing-${index}`}
                      >
                        <Paper
                          p="xs"
                          radius="md"
                          style={{
                            position: "relative",
                            backgroundColor: imagesToDelete.includes(url)
                              ? "#ffe0e0"
                              : "#f8f9fa",
                          }}
                        >
                          <Image
                            src={url}
                            height={isMobile ? 80 : 100}
                            fit="cover"
                            alt=""
                            radius="md"
                            style={{
                              opacity: imagesToDelete.includes(url) ? 0.5 : 1,
                            }}
                          />
                          <ActionIcon
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                            }}
                            variant="filled"
                            color={
                              imagesToDelete.includes(url) ? "gray" : "red"
                            }
                            size="sm"
                            onClick={() => onMarkImageForDeletion(url)}
                          >
                            {imagesToDelete.includes(url) ? (
                              <X size={12} />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </ActionIcon>
                          {imagesToDelete.includes(url) && (
                            <Badge
                              color="red"
                              size="xs"
                              style={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                                right: 8,
                              }}
                              fullWidth
                            >
                              Will be deleted
                            </Badge>
                          )}
                        </Paper>
                      </Grid.Col>
                    ))}
                  </Grid>
                  <Divider my="md" />
                </Box>
              )}

            {/* Add New Images */}
            <Box>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Add More Images
                </Text>
                <Badge
                  color={totalImageCount >= 5 ? "red" : "green"}
                  variant="light"
                >
                  {totalImageCount}/5 images
                </Badge>
              </Group>
              <FileInput
                description="Upload additional images (Max 5 total)"
                placeholder="Choose image files"
                value={undefined}
                onChange={onAddNewImages}
                leftSection={<ImageIcon size={16} />}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                size="lg"
                radius="md"
                multiple
                disabled={!canAddMore}
                styles={{
                  input: {
                    cursor: "pointer",
                    "&::placeholder": {
                      color: "#868e96",
                    },
                  },
                }}
              />
            </Box>

            {/* New Images Preview */}
            {newFiles.length > 0 && (
              <Box>
                <Text size="sm" fw={500} mb="sm" c="dimmed">
                  New Images to Upload
                </Text>
                <Grid>
                  {newFiles.map((file, index) => (
                    <Grid.Col span={{ base: 6, sm: 4 }} key={`new-${index}`}>
                      <Paper
                        p="xs"
                        radius="md"
                        style={{
                          position: "relative",
                          backgroundColor: "#e7f5ff",
                          border: "2px solid #228be6",
                        }}
                      >
                        <Image
                          src={URL.createObjectURL(file)}
                          height={isMobile ? 80 : 100}
                          fit="cover"
                          radius="md"
                          alt=""
                        />
                        <ActionIcon
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                          }}
                          variant="filled"
                          color="red"
                          size="sm"
                          onClick={() => onRemoveNewFile(index)}
                        >
                          <X size={12} />
                        </ActionIcon>
                        <Text size="xs" truncate mt={4}>
                          {file.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </Paper>
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
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
