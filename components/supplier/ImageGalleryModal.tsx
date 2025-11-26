import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Image,
  ActionIcon,
  Group,
  Badge,
  Box,
  Text,
  Paper,
  Stack,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryModalProps {
  opened: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  itemName: string;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  opened,
  onClose,
  images,
  initialIndex = 0,
  itemName,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (opened) {
      setCurrentIndex(initialIndex);
    }
  }, [opened, initialIndex]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened, goToNext, goToPrevious, onClose]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (images.length === 0) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      padding="lg"
      centered
      title={
        <Text fw={600} size="lg">
          {itemName}
        </Text>
      }
      fullScreen={isMobile}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Stack gap="md" p="md">
        {/* Main Image Display */}
        <Box
          style={{ position: "relative" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Paper
            radius="md"
            style={{
              overflow: "hidden",
              backgroundColor: "#f8f9fa",
              position: "relative",
            }}
          >
            <Image
              src={images[currentIndex]}
              alt={`${itemName} - Image ${currentIndex + 1}`}
              fit="contain"
              h={{ base: 300, sm: 300, md: 350 }}
              style={{
                width: "100%",
              }}
            />

            {/* Image Counter Badge */}
            <Badge
              size="lg"
              variant="filled"
              color="dark"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: "14px",
              }}
            >
              {currentIndex + 1} / {images.length}
            </Badge>

            {/* Navigation Arrows - Only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <ActionIcon
                  size="xl"
                  radius="xl"
                  variant="filled"
                  color="dark"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.8,
                  }}
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </ActionIcon>

                <ActionIcon
                  size="xl"
                  radius="xl"
                  variant="filled"
                  color="dark"
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.8,
                  }}
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </ActionIcon>
              </>
            )}
          </Paper>
        </Box>

        {/* Thumbnail Strip - Only show if more than 1 image */}
        {images.length > 1 && (
          <Box>
            <Group gap="xs" justify="center" wrap="nowrap">
              {images.map((image, index) => (
                <Paper
                  key={index}
                  radius="md"
                  style={{
                    cursor: "pointer",
                    border:
                      index === currentIndex
                        ? "3px solid #3D6B2C"
                        : "2px solid transparent",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    opacity: index === currentIndex ? 1 : 0.6,
                  }}
                  onClick={() => goToImage(index)}
                  onMouseEnter={(e) => {
                    if (index !== currentIndex) {
                      e.currentTarget.style.opacity = "0.8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentIndex) {
                      e.currentTarget.style.opacity = "0.6";
                    }
                  }}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    w={80}
                    h={80}
                    fit="cover"
                  />
                </Paper>
              ))}
            </Group>
          </Box>
        )}
      </Stack>
    </Modal>
  );
};
