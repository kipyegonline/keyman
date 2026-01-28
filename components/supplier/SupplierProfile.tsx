import React, { useState, useMemo } from "react";
import {
  Avatar,
  Badge,
  Button,
  Text,
  Title,
  Divider,
  ActionIcon,
  Tooltip,
  ThemeIcon,
  Chip,
  Accordion,
} from "@mantine/core";
import { getSupplierTheme } from "./profiles";
import {
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music,
  Truck,
  Wifi,
  CreditCard,
  Package,
  Shield,
  Star,
  Clock,
  Award,
  CheckCircle,
  Hash,
  Share2,
  ReceiptText,
  BadgeCheck,
} from "lucide-react";
import { SupplierInfo } from "@/types";
import SocialShare from "@/lib/SocilalShareComponent";
import { ContractChatBot } from "../contract";
import { getToken, useAppContext } from "@/providers/AppContext";
import { PepiconsPencilHandshakeCircle } from "./pencil";
import UnverifiedContractModal from "../contract/UnverifiedContractModal";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

interface ISupplierInfo {
  phone: string;
  id: string;
  email: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  tiktok_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  Instagram_link?: string;
  twitter_link?: string;
  offers_transport?: boolean;
  internet_access?: boolean;
  has_pos?: boolean;
  has_inventory?: boolean;
  is_escrow_only?: boolean;
  photo?: File | null;
  comments?: string;
  is_user_verified?: number;
  "categories[0]"?: string;
  "categories[1]"?: string;
}

// Mock data for demonstration
const supplierData: ISupplierInfo & {
  name: string;
  rating: number;
  yearsInBusiness: number;
  totalProjects: number;
  responseTime: string;
  certifications: string[];
} = {
  name: "BuildMart Construction Supplies",
  phone: "+254712345678",
  email: "contact@buildmart.co.ke",
  type: "Wholesale Supplier",
  address: "Industrial Area, Nairobi, Kenya",
  latitude: -1.3194,
  longitude: 36.8507,
  id: "ffffffsss",
  categories: [
    "Building Materials",
    "Hardware",
    "Electrical Supplies",
    "Plumbing",
    "Safety Equipment",
  ],
  facebook_link: "https://facebook.com/",
  twitter_link: "https://twitter.com/",
  Instagram_link: "https://instagram.com/",
  youtube_link: "https://youtube.com/",
  offers_transport: true,
  internet_access: true,
  has_pos: true,
  has_inventory: true,
  is_escrow_only: false,
  comments:
    "Leading construction materials supplier in East Africa with over 15 years of experience. We specialize in premium quality building materials, tools, and equipment for both residential and commercial projects. Our team of experts provides professional consultation and timely delivery services across the region.",
  rating: 4.8,
  yearsInBusiness: 15,
  totalProjects: 2500,
  responseTime: "Within 2 hours",
  certifications: ["ISO 9001", "NEMA Certified", "KEBS Approved"],
};

const SupplierProfile: React.FC<{ supplier: SupplierInfo }> = ({
  supplier,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const { setActiveItem } = useAppContext();
  const router = useRouter();

  // Get theme based on supplier type
  const theme = useMemo(
    () => getSupplierTheme(supplier?.type),
    [supplier?.type],
  );

  const handleContractClick = (
    id: string | undefined,
    isVerified: number | undefined,
  ) => {
    if (isVerified !== 0) {
      setShowContract(true);
    } else {
      setShowUnverifiedModal(true);
    }
    navigateTo();
    setActiveItem("key-contract");
    router.push(`/keyman/dashboard/key-contract/create?keyman_id=${id}`);
  };

  const handleAcceptUnverified = () => {
    setShowContract(true);
  };

  // Helper function to convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([\w-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(supplier?.youtube_link || "");

  const handleViewLocation = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${supplier?.location?.coordinates[1]},${supplier?.location?.coordinates[0]}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleShare = async () => {
    setIsSharing(true);

    const shareData = {
      title: `${supplier?.name} - Quality Supplier on KeymanStores`,
      text: `Check out ${supplier?.name}, a trusted ${
        supplier?.type
      } specializing in ${supplier?.categories
        ?.map((cat) => cat?.item_category?.name)
        .join(", ")}. Located in ${supplier?.address} with ${
        supplier?.supplier_rating
      } star rating!`,
      url: `https://www.keymanstores.com/supplier/${supplier?.id}`,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const socialLinks = [
    {
      icon: Facebook,
      link: supplierData.facebook_link,
      color: "#1877F2",
      platform: "Facebook",
    },
    {
      icon: Twitter,
      link: supplierData.twitter_link,
      color: "#1DA1F2",
      platform: "Twitter",
    },
    {
      icon: Instagram,
      link: supplierData.Instagram_link,
      color: "#E4405F",
      platform: "Instagram",
    },
    {
      icon: Youtube,
      link: supplierData.youtube_link,
      color: "#FF0000",
      platform: "YouTube",
    },
    {
      icon: Music,
      link: supplierData.tiktok_link,
      color: "#000000",
      platform: "TikTok",
    },
  ].filter((social) => social.link);

  const businessFeatures = [
    {
      icon: Truck,
      active: supplierData.offers_transport,
      label: "Transportation",
    },
    {
      icon: Wifi,
      active: supplierData.internet_access,
      label: "Internet Access",
    },
    { icon: CreditCard, active: supplierData.has_pos, label: "POS System" },
    {
      icon: Package,
      active: supplierData.has_inventory,
      label: "Inventory Management",
    },
    { icon: Shield, active: supplierData.is_escrow_only, label: "Escrow Only" },
  ];
  const token = getToken();
  const rating =
    supplier?.supplier_rating !== null &&
    [...Array(supplier?.supplier_rating)].map((_, i) => (
      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
    ));
  return (
    <div className="w-full h-full bg-white">
      {showContract && (
        <ContractChatBot
          userToken={token ?? ""}
          sessionId={token ?? ""}
          userType="supplier"
          supplierId={localStorage.getItem("supplier_id") ?? ""}
          onClose={() => setShowContract(false)}
        />
      )}
      {/* Minimalist Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: theme.primary }}
            ></div>
            <Text size="sm" className="text-gray-600 font-medium">
              Supplier Profile
            </Text>
          </div>
          <div>
            {" "}
            <Button
              variant="light"
              size="sm"
              onClick={() =>
                handleContractClick(supplier?.id, supplier?.is_user_verified)
              }
              //className="!animate-pulse"
              rightSection={
                <PepiconsPencilHandshakeCircle className="w-8 h-8  !animation-pulse" />
              }
            >
              Key Contract
            </Button>
            <Tooltip
              label={
                supplier?.is_user_verified === 0
                  ? "You can't create a contract. Service provider is not verified"
                  : "Key contract"
              }
              position="bottom"
              display="none"
            >
              <ActionIcon
                display={"none"}
                disabled={supplier?.is_user_verified === 0}
                variant="light"
                className="hover:scale-110 transition-all duration-300 animate-pulse"
                size="md"
                onClick={() => setShowContract(true)}
              >
                <img
                  src="/PepiconsPencilHandshakeCircle.svg"
                  alt="keyman key"
                  className="w-10 h-10 bg-green animation-pulse"
                />
                <ReceiptText className="w-10 h-10 hidden" />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label={shareSuccess ? "Link copied!" : "Share this profile"}
              position="bottom"
            >
              <ActionIcon
                variant="light"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
                display="none"
                style={
                  !shareSuccess
                    ? {
                        backgroundColor: theme.primaryLight,
                        color: theme.primary,
                      }
                    : undefined
                }
                className={`
                hover:scale-110 transition-all duration-300
                ${shareSuccess ? "bg-green-100 text-green-600" : ""}
              `}
              >
                <Share2 className="w-4 h-4" />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <Avatar
            size={60}
            radius="xl"
            className="mb-3 border-2"
            style={{ borderColor: theme.primary }}
            src={
              supplier?.photo && supplier?.photo?.length > 0
                ? supplier?.photo[0]
                : null
            }
          >
            {supplier?.photo && supplier?.photo?.length === 0 && (
              <div
                className="text-lg font-bold"
                style={{ color: theme.primary }}
              >
                {supplier?.name?.charAt(0)}
              </div>
            )}
          </Avatar>

          <Title order={3} className="text-xl font-bold text-gray-900 mb-1">
            {supplier?.name}{" "}
            {(supplier?.is_user_verified as number) > 0 && (
              <BadgeCheck
                size={28}
                fill={theme.primary}
                stroke="white"
                className="inline-block relative -top-1"
              />
            )}
          </Title>

          <div className="flex flex-wrap gap-1 justify-center mb-2">
            <Badge size="sm" style={{ backgroundColor: theme.primary }}>
              {supplier?.type}
            </Badge>
            <Badge
              size="sm"
              style={{ backgroundColor: "#F08C23", display: "none" }}
            >
              {supplierData.yearsInBusiness} Years
            </Badge>
            <Badge
              size="sm"
              variant="light"
              className="mb-2"
              style={{
                backgroundColor: theme.primaryLight,
                color: theme.primary,
              }}
            >
              <Hash size={10} className="mr-1 inline-block " />
              {supplier?.keyman_number}
            </Badge>

            <div className="flexy items-center gap-1 ">
              {supplier?.supplier_rating === null ? (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                rating
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Stacked Minimalist */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Location Section */}
        <div>
          <div className="flex items-start gap-3 mb-3">
            <ThemeIcon variant="light" color={theme.primary} size="sm">
              <MapPin className="w-4 h-4" />
            </ThemeIcon>
            <div className="flex-1">
              <Text size="sm" className="font-medium text-gray-900 mb-1">
                Location
              </Text>
              <Text size="sm" className="text-gray-600 mb-2 leading-tight">
                {supplier.address}
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewLocation}
                leftSection={<MapPin className="w-4 h-4" />}
                style={{ borderColor: theme.primary, color: theme.primary }}
                className="hover:opacity-90"
              >
                View on Google Maps
              </Button>
            </div>
          </div>

          {/* YouTube Promo Video Section */}
          {youtubeEmbedUrl && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <ThemeIcon variant="light" color="red" size="sm">
                  <Youtube className="w-4 h-4" />
                </ThemeIcon>
                <Text size="sm" className="font-medium text-gray-900">
                  Promo Video
                </Text>
              </div>
              <div
                className="relative w-full rounded-lg overflow-hidden shadow-lg"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  src={youtubeEmbedUrl}
                  title={`${supplier?.name} Promo Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flexy hidden items-center gap-3">
            <ThemeIcon variant="light" color="#F08C23" size="sm">
              <Clock className="w-4 h-4" />
            </ThemeIcon>
            <div>
              <Text size="sm" className="font-medium text-gray-900">
                Response Time
              </Text>
              <Text size="sm" className="text-gray-600">
                {supplierData.responseTime}
              </Text>
            </div>
          </div>
        </div>

        <Divider my="md" />

        {/* Collapsible Sections - Accordion */}
        <Accordion
          variant="separated"
          radius="md"
          multiple
          styles={{
            chevron: { color: theme.primary },
          }}
          classNames={{
            item: "border border-gray-200 mb-2 overflow-hidden",
            control:
              "hover:bg-gray-50 transition-all duration-200 font-semibold",
            label: "text-gray-900 font-bold text-sm",
            content: "text-gray-700 text-sm",
          }}
        >
          {/* Categories - Using Chips */}
          {supplier.categories.length > 0 && (
            <Accordion.Item value="categories">
              <Accordion.Control>Categories & Services</Accordion.Control>
              <Accordion.Panel>
                <Chip.Group>
                  <div className="flex flex-wrap gap-1">
                    {supplier.categories.slice(0, 6).map((category, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="light"
                        color={theme.primary}
                        className="text-sm"
                      >
                        {category?.item_category?.name}
                      </Chip>
                    ))}
                    {supplier.categories.length > 6 && (
                      <Chip size="sm" variant="outline" color="gray">
                        +{supplier.categories.length - 6} more
                      </Chip>
                    )}
                  </div>
                </Chip.Group>
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {/* About Us */}
          <Accordion.Item value="about">
            <Accordion.Control>About Us</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" className="text-gray-700 leading-relaxed">
                {supplier?.comments ?? "Description coming soon..."}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Business Features */}
          <Accordion.Item value="features">
            <Accordion.Control>Business Features</Accordion.Control>
            <Accordion.Panel>
              <div className="grid grid-cols-2 gap-2">
                {businessFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded bg-gray-50"
                  >
                    <ThemeIcon
                      variant="light"
                      color={feature.active ? "#388E3C" : "gray"}
                      size="xs"
                    >
                      <feature.icon className="w-4 h-4" />
                    </ThemeIcon>
                    <Text
                      size="sm"
                      className={`font-medium ${
                        feature.active ? "text-[#388E3C]" : "text-gray-400"
                      }`}
                    >
                      {feature.label}
                    </Text>
                  </div>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Certifications */}
          <Accordion.Item value="certifications" className="hidden">
            <Accordion.Control>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F08C23]" />
                <span>Certifications</span>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="flex flex-wrap gap-1">
                {supplierData.certifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="light"
                    size="sm"
                    style={{ backgroundColor: "#388E3C20", color: "#388E3C" }}
                    leftSection={<CheckCircle className="w-3 h-3" />}
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Follow Us */}
          <Accordion.Item value="social" className="hidden">
            <Accordion.Control>Follow Us</Accordion.Control>
            <Accordion.Panel>
              <div className="flex justify-between gap-1">
                {socialLinks.map((social, index) => (
                  <Tooltip key={index} label={social.platform} position="top">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      className="flex-1"
                      onClick={() => window.open(social.link, "_blank")}
                      style={{
                        backgroundColor: `${social.color}20`,
                        color: social.color,
                      }}
                    >
                      <social.icon className="w-5 h-5" />
                    </ActionIcon>
                  </Tooltip>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          {/* Follow Us */}
          <Accordion.Item value="social">
            <Accordion.Control>Follow Us</Accordion.Control>
            <Accordion.Panel>
              {" "}
              {/* Social Share Component */}
              <div className="mt-4">
                <SocialShare
                  url={`https://www.keymanstores.com/supplier/${supplier?.id}`}
                  title={supplier?.name ?? "Supplier"}
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>

      {/* Unverified Contract Modal */}
      <UnverifiedContractModal
        opened={showUnverifiedModal}
        onClose={() => setShowUnverifiedModal(false)}
        onAccept={handleAcceptUnverified}
        supplierName={supplier?.name}
      />
    </div>
  );
};

export default SupplierProfile;
