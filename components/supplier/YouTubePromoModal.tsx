"use client";
import {
  Modal,
  Group,
  Text,
  Stack,
  TextInput,
  Button,
  ThemeIcon,
  Paper,
  Box,
} from "@mantine/core";
import { Youtube, Link2, X, Upload, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./YouTubePromoModal.module.css";

interface YouTubePromoModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (youtubeLink: string) => Promise<void>;
  currentLink?: string;
}

const YouTubePromoModal: React.FC<YouTubePromoModalProps> = ({
  opened,
  onClose,
  onSubmit,
  currentLink = "",
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setUrl(currentLink);
      setError("");
    }
  }, [opened, currentLink]);

  // Validate YouTube URL
  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[\w-]+(&.*)?$/;
    return youtubeRegex.test(url.trim());
  };

  const handleSubmit = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(trimmedUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(trimmedUrl);
    } catch (err) {
      console.error("Error submitting YouTube link:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon
            size="lg"
            radius="xl"
            variant="gradient"
            gradient={{ from: "red", to: "pink" }}
            className={styles.iconPulse}
          >
            <Youtube size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">
              Add Promo Video
            </Text>
            <Text size="xs" c="dimmed">
              Showcase your business with a 1-minute video
            </Text>
          </div>
        </Group>
      }
      size="md"
      radius="lg"
      centered
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      classNames={{
        content: styles.modalContent,
      }}
    >
      <Stack gap="lg">
        {/* Info Banner */}
        <Paper p="md" radius="md" className={styles.infoBanner}>
          <Group gap="sm" align="flex-start">
            <ThemeIcon size="md" radius="xl" variant="light" color="orange">
              <Sparkles size={16} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500} mb={4}>
                Pro Tip: Make a great first impression!
              </Text>
              <Text size="xs" c="dimmed">
                A 1-minute promo video can increase customer engagement by 80%.
                Upload your best introduction video to stand out.
              </Text>
            </Box>
          </Group>
        </Paper>

        {/* URL Input */}
        <div className={styles.inputWrapper}>
          <TextInput
            label={
              <Group gap="xs" mb={4}>
                <Link2 size={14} />
                <Text size="sm" fw={500}>
                  YouTube Video URL
                </Text>
              </Group>
            }
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(event) => {
              setUrl(event.currentTarget.value);
              if (error) setError("");
            }}
            error={error}
            disabled={isLoading}
            size="md"
            radius="md"
            classNames={{
              input: styles.urlInput,
            }}
          />
          <Text size="xs" c="dimmed" mt={6}>
            Supports: youtube.com/watch, youtu.be, and YouTube Shorts links
          </Text>
        </div>

        {/* Preview hint */}
        {url && validateYouTubeUrl(url) && (
          <Paper p="sm" radius="md" className={styles.previewHint}>
            <Group gap="xs">
              <Youtube size={16} className={styles.youtubeIcon} />
              <Text size="sm" c="green" fw={500}>
                ✓ Valid YouTube URL detected
              </Text>
            </Group>
          </Paper>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="light"
            color="gray"
            leftSection={<X size={16} />}
            onClick={handleClose}
            disabled={isLoading}
            radius="md"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: "red", to: "pink" }}
            leftSection={<Upload size={16} />}
            onClick={handleSubmit}
            loading={isLoading}
            radius="md"
            className={styles.submitButton}
          >
            {isLoading ? "Saving..." : "Save Video Link"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default YouTubePromoModal;
