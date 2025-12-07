import React from "react";
import {
  Transition,
  Card,
  Badge,
  Flex,
  Tooltip,
  ActionIcon,
  Stack,
  Box,
  Image,
  Divider,
  Text,
  Paper,
  Avatar,
  Group,
  Spoiler,
} from "@mantine/core";
import {
  CheckCircle2,
  ShoppingCart,
  Coins,
  Weight,
  Plus,
  Minus,
  ZoomIn,
} from "lucide-react";
import { PublicPriceList } from "@/components/supplier/priceList";
import { ImageGalleryModal } from "@/components/supplier/ImageGalleryModal";

const getTransportationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "tuktuk":
      return "#F08C23";
    case "pickup":
      return "#388E3C";
    case "lorry":
      return "#3D6B2C";
    default:
      return "#3D6B2C";
  }
};

const getTransportationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "tuktuk":
      return "🛺";
    case "pickup":
      return "🚛";
    case "lorry":
      return "🚚";
    default:
      return "🚚";
  }
};

export const getItemEmoji = (type: string, name: string): string => {
  if (name.toLowerCase().includes("tile")) return "🏺";
  if (name.toLowerCase().includes("cement")) return "🏗️";
  if (
    name.toLowerCase().includes("steel") ||
    name.toLowerCase().includes("iron")
  )
    return "🔩";
  if (name.toLowerCase().includes("paint")) return "🎨";
  if (name.toLowerCase().includes("roof")) return "🏠";
  return "📦";
};

export const PublicPricelistItem: React.FC<{
  item: PublicPriceList;
  index: number;
  handleAddCart: () => void;
  handleIncreaseQuantity: () => void;
  handleDecreaseQuantity: () => void;
  isInCart?: boolean;
  cartQuantity?: number;
}> = ({
  item,
  index,
  handleAddCart,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  isInCart = false,
  cartQuantity = 0,
}) => {
  const [galleryOpened, setGalleryOpened] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Get all images for gallery
  const getAllImages = (item: PublicPriceList): string[] => {
    if (
      "attachment_url" in item &&
      item?.attachment_url &&
      item.attachment_url.length > 0
    ) {
      return item.attachment_url;
    } else if (item?.item?.photo && item.item.photo.length > 0) {
      return item.item.photo;
    }
    return [];
  };

  const images = getAllImages(item);
  const hasMultipleImages = images.length > 1;

  return (
    <Transition
      mounted={true}
      transition="scale"
      duration={300}
      timingFunction="ease-out"
      enterDelay={index * 100}
    >
      {(styles) => (
        <Card
          shadow="md"
          padding="lg"
          radius="lg"
          style={{
            ...styles,
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid #f0f0f0",
            //width: "100%",
            minHeight: "280px",
          }}
          className="hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(61,107,44,0.15)]"
          w={{
            base: "100%", // Mobile: 1 card per row (full width)
            sm: "calc(50% - 8px)", // Medium: 2 cards per row
            lg: "calc(33.333% - 12px)", // Large: 3 cards per row
          }}
          maw="100%" // Ensure it never exceeds container width
          miw={{ base: "100%", md: 280 }}
        >
          {isInCart && (
            <Badge
              variant="filled"
              color="#3D6B2C"
              size="sm"
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1,
              }}
            >
              In Cart ({cartQuantity})
            </Badge>
          )}

          <Flex justify="flex-end" align="center" gap="xs">
            {/* Quantity Controls - Only show when item is in cart */}
            {isInCart && (
              <Group gap="xs">
                <Tooltip label="Decrease quantity">
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    radius="xl"
                    onClick={handleDecreaseQuantity}
                  >
                    <Minus size={14} />
                  </ActionIcon>
                </Tooltip>

                <Text
                  fw={600}
                  size="sm"
                  style={{
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {cartQuantity}
                </Text>

                <Tooltip label="Increase quantity">
                  <ActionIcon
                    variant="light"
                    color="green"
                    size="sm"
                    radius="xl"
                    onClick={handleIncreaseQuantity}
                  >
                    <Plus size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}

            {/* Add to Cart Button */}
            <Tooltip label={isInCart ? "In Cart" : "Add to cart"}>
              <ActionIcon
                variant="light"
                color={isInCart ? "green" : "orange"}
                size="lg"
                radius="xl"
                onClick={handleAddCart}
                disabled={isInCart}
              >
                {isInCart ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <ShoppingCart size={18} />
                )}
              </ActionIcon>
            </Tooltip>
          </Flex>

          <Stack gap="md">
            {/* Item Header */}
            <Box
              style={{
                height: 200,
                alignSelf: "center",
                overflow: "hidden",
                borderRadius: "12px",
                maxWidth: "100%",
                position: "relative",
                cursor: images.length > 0 ? "pointer" : "default",
              }}
              onClick={() => {
                if (images.length > 0) {
                  setGalleryOpened(true);
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Image
                src={item?.item?.photo?.[0]}
                alt={`${item.name} image`}
                fit="cover"
                radius="lg"
                fallbackSrc="/placeholder-image.png"
                style={{
                  border: "2px solid #f0f0f0",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  maxWidth: "100%",
                }}
              />

              {/* Hover Overlay with Magnifying Glass */}
              {isHovered && images.length > 0 && (
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                  }}
                >
                  <ZoomIn size={32} color="white" />
                </Box>
              )}

              {/* Image Count Badge */}
              {hasMultipleImages && (
                <Badge
                  size="sm"
                  variant="filled"
                  color="dark"
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  +{images.length - 1} more
                </Badge>
              )}
            </Box>
            <Flex
              justify="space-between"
              align="flex-start"
              direction={{ base: "column", xs: "row" }}
              gap="sm"
            >
              <Box style={{ flex: 1 }}>
                <Text size="xl" mb="xs" display="none">
                  {getItemEmoji(item.type, item.name)}
                </Text>
                <Text fw={600} size="md" lineClamp={2} mb="xs">
                  {item.name}
                </Text>
                <Text size="sm" c="dimmed" lineClamp={1}>
                  {item.swahili_name}
                </Text>

                <Spoiler
                  maxHeight={60}
                  showLabel="Show more"
                  hideLabel="Hide"
                  style={{
                    display: item.name === item.description ? "none" : "block",
                  }}
                >
                  {item.description}
                </Spoiler>
              </Box>
            </Flex>

            <Divider />

            {/* Price Section */}
            {item.price && (
              <Paper p="md" radius="lg" style={{ backgroundColor: "#f8f9fa" }}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text size="xs" c="dimmed" mb={2}>
                      Current Price
                    </Text>
                    <Text fw={700} c="#3D6B2C">
                      KES {Number(item.price).toLocaleString()}
                    </Text>
                  </Box>
                  <Avatar
                    size="md"
                    radius="xl"
                    style={{ backgroundColor: "#3D6B2C" }}
                  >
                    <Coins size={20} color="white" />
                  </Avatar>
                </Flex>
              </Paper>
            )}

            {/* Item Details */}
            <Group justify="space-between" gap="xs">
              <Badge
                variant="light"
                color={getTransportationColor(item.transportation_type)}
                //size={{ base: "sm", xs: "md" }}
                radius="xl"
                style={{
                  maxWidth: "calc(100% - 80px)",
                  overflow: "hidden",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  {getTransportationIcon(item.transportation_type)}{" "}
                  {item.transportation_type}
                </span>
              </Badge>
              {item?.stock && +item?.stock > 1 && (
                <Badge variant="light" color="#3D6B2C" size="md" radius="xl">
                  {item?.stock}in stock
                </Badge>
              )}
              {item?.metrics && (
                <Badge variant="light" color="#3D6B2C" size="md" radius="xl">
                  {item?.metrics}
                </Badge>
              )}

              <Group gap="xs" style={{ flexShrink: 0, display: "none" }}>
                <Weight size={14} />
                <Text size="sm" c="dimmed">
                  {item.weight_in_kgs}kg
                </Text>
              </Group>
            </Group>
          </Stack>

          {/* Image Gallery Modal */}
          <ImageGalleryModal
            opened={galleryOpened}
            onClose={() => setGalleryOpened(false)}
            images={images}
            itemName={item.name}
          />
        </Card>
      )}
    </Transition>
  );
};
