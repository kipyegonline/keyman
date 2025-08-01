import React, { useState } from "react";
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
} from "@mantine/core";
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
} from "lucide-react";
import { SupplierInfo } from "@/types";
import SocialShare from "@/lib/SocilalShareComponent";

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
        supplierData.rating
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
  console.log(supplier);
  return (
    <div className="w-full h-full bg-white">
      {/* Minimalist Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-[#3D6B2C] rounded-full"></div>
            <Text size="sm" className="text-gray-600 font-medium">
              Supplier Profile
            </Text>
          </div>

          <Tooltip
            label={shareSuccess ? "Link copied!" : "Share this profile"}
            position="bottom"
          >
            <ActionIcon
              variant="light"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className={`
                hover:scale-110 transition-all duration-300
                ${
                  shareSuccess
                    ? "bg-green-100 text-green-600"
                    : "bg-[#3D6B2C]/10 text-[#3D6B2C]"
                }
              `}
            >
              <Share2 className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </div>

        <div className="flex flex-col items-center text-center">
          <Avatar
            size={60}
            radius="xl"
            className="mb-3 border-2 border-[#3D6B2C]"
            src={
              supplier?.photo && supplier?.photo?.length > 0
                ? supplier?.photo[0]
                : null
            }
          >
            {supplier?.photo && supplier?.photo?.length === 0 && (
              <div className="text-lg font-bold text-[#3D6B2C]">
                {supplier?.name?.charAt(0)}
              </div>
            )}
          </Avatar>

          <Title order={3} className="text-xl font-bold text-gray-900 mb-1">
            {supplier?.name}
          </Title>

          <div className="flex flex-wrap gap-1 justify-center mb-2">
            <Badge size="sm" style={{ backgroundColor: "#3D6B2C" }}>
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
              style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
            >
              <Hash size={10} className="mr-1 inline-block " />
              {supplier?.keyman_number}
            </Badge>

            <div className="flexy items-center gap-1 hidden">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <Text size="sm" className="font-medium">
                {supplierData.rating}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Stacked Minimalist */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Location Section */}
        <div>
          <div className="flex items-start gap-3 mb-3">
            <ThemeIcon variant="light" color="#3D6B2C" size="sm">
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
                className="border-[#3D6B2C] text-[#3D6B2C] hover:bg-[#3D6B2C] hover:text-white"
              >
                View on Google Maps
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        <Divider />

        {/* Categories - Using Chips */}
        {supplier.categories.length > 0 && (
          <div>
            <Text size="sm" className="font-bold text-gray-900 mb-3">
              Categories & Services
            </Text>
            <Chip.Group>
              <div className="flex flex-wrap gap-1">
                {supplier.categories.slice(0, 6).map((category, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    variant="light"
                    color="#3D6B2C"
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
          </div>
        )}

        <Divider />

        {/* About Us */}
        <div>
          <Text size="sm" className="font-bold text-gray-900 mb-3">
            About Us
          </Text>
          <Text size="sm" className="text-gray-700 leading-relaxed">
            {supplier?.comments ?? "Description coming soon..."}
          </Text>
        </div>

        <Divider />

        {/* Business Features */}
        <div>
          <Text size="sm" className="font-bold text-gray-900 mb-3">
            Business Features
          </Text>
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
        </div>

        {/* Certifications */}
        <div className="hidden">
          <div className="flex items-center gap-2 mb-3 ">
            <Award className="w-4 h-4 text-[#F08C23]" />
            <Text size="sm" className="font-bold text-gray-900">
              Certifications
            </Text>
          </div>
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
        </div>

        <Divider />

        {/* Follow Us */}
        <div>
          <Text size="sm" className="font-bold text-gray-900 mb-3">
            Follow Us
          </Text>
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
        </div>

        {/* Social Share Component */}
        <div className="mt-4">
          <SocialShare
            url={`https://www.keymanstores.com/supplier/${supplier?.id}`}
            title={supplier?.name ?? "Supplier"}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
