import React from "react";
import {
  Card,
  Avatar,
  Badge,
  Button,
  Group,
  //Stack,
  Text,
  Title,
  Divider,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  Paper,
  ThemeIcon,
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
} from "lucide-react";
import { SupplierInfo } from "@/types";

interface ISupplierInfo {
  phone: string;
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
  categories: [
    "Building Materials",
    "Hardware",
    "Electrical Supplies",
    "Plumbing",
    "Safety Equipment",
  ],
  facebook_link: "https://facebook.com/buildmart",
  twitter_link: "https://twitter.com/buildmart",
  Instagram_link: "https://instagram.com/buildmart",
  youtube_link: "https://youtube.com/buildmart",
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
  const handleViewLocation = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${supplier?.location?.coordinates[1]},${supplier?.location?.coordinates[0]}`;
    window.open(googleMapsUrl, "_blank");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-12 bg-[#3D6B2C] rounded-full"></div>
            <Text size="sm" className="text-gray-600 font-medium">
              Supplier Profile
            </Text>
          </div>
          <div className="flex flex-col md:flex-row gap-x-4 items-center text-center mb-2">
            <Avatar
              size={120}
              radius="xl"
              className="mb-4 border-4 border-[#3D6B2C] shadow-lg "
              src={null}
            >
              <div className="text-2xl font-bold text-[#3D6B2C]">
                {supplier?.name?.charAt(0)}
              </div>
            </Avatar>
            <Title
              order={1}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            >
              {supplier?.name}
            </Title>
          </div>

          <Group gap="xs" className="flex-wrap">
            <Badge variant="filled" style={{ backgroundColor: "#3D6B2C" }}>
              {supplier?.type}
            </Badge>
            <Badge variant="filled" style={{ backgroundColor: "#F08C23" }}>
              {supplierData.yearsInBusiness} Years in Business
            </Badge>
            <Badge
              variant="filled"
              size="lg"
              className="py-2"
              style={{ backgroundColor: "#3D6B2C15", color: "#3D6B2C" }}
            >
              <Hash size={12} className="mr-2 inline-block" />
              {supplier?.keyman_number}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <Text size="sm" className="font-medium">
                {supplierData.rating}
              </Text>
            </div>
          </Group>
        </div>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
          {/* Left Section - Supplier Information */}
          <div className="space-y-6 ">
            {/* Profile Card */}
            <Card
              shadow="md"
              //display="none"
              padding="xl"
              radius="lg"
              className="border-0 shadow-lg"
            >
              <div className="flexy flex-col items-center text-center mb-6 hidden">
                <Avatar
                  size={120}
                  radius="xl"
                  className="mb-4 border-4 border-[#3D6B2C] shadow-lg"
                  src={null}
                >
                  <div className="text-2xl font-bold text-[#3D6B2C]">
                    {supplier?.name?.charAt(0)}
                  </div>
                </Avatar>
                <Title
                  order={2}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  {supplier.name}
                </Title>
                <Text className="text-gray-600 mb-4">{supplier.type}</Text>

                <Group gap="lg" className="justify-center !hidden">
                  <div className="text-center">
                    <Text size="lg" className="font-bold text-[#3D6B2C]">
                      {supplierData.totalProjects.toLocaleString()}+
                    </Text>
                    <Text size="sm" className="text-gray-600">
                      Projects
                    </Text>
                  </div>
                  <div className="text-center">
                    <Text size="lg" className="font-bold text-[#F08C23]">
                      {supplierData.rating}
                    </Text>
                    <Text size="sm" className="text-gray-600">
                      Rating
                    </Text>
                  </div>
                  <div className="text-center">
                    <Text size="lg" className="font-bold text-[#388E3C]">
                      {supplierData.yearsInBusiness}
                    </Text>
                    <Text size="sm" className="text-gray-600">
                      Years
                    </Text>
                  </div>
                </Group>
              </div>

              <Divider className="my-6" />

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex  flex-col md:flex-row items-start gap-3 ">
                  <ThemeIcon
                    variant="light"
                    color="#3D6B2C"
                    size="lg"
                    className="mt-1"
                  >
                    <MapPin className="w-5 h-5" />
                  </ThemeIcon>
                  <div className="flex-1">
                    <Text className="font-medium text-gray-900 mb-1">
                      Location
                    </Text>
                    <Text className="text-gray-600 mb-3">
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

                {/* Response Time */}
                <div className="flex items-center gap-3">
                  <ThemeIcon variant="light" color="#F08C23" size="lg">
                    <Clock className="w-5 h-5" />
                  </ThemeIcon>
                  <div>
                    <Text className="font-medium text-gray-900">
                      Response Time
                    </Text>
                    <Text className="text-gray-600">
                      {supplierData.responseTime}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
            {/* Description */}
            <Card
              shadow="md"
              padding="lg"
              radius="lg"
              className="border-0 shadow-lg"
            >
              <Title order={3} className="text-lg font-bold text-gray-900 mb-4">
                About Us
              </Title>
              <Text className="text-gray-700 leading-relaxed">
                {supplier?.comments ?? supplierData.comments}
              </Text>
            </Card>

            {/* Certifications */}
            <Card
              shadow="md"
              display="none"
              padding="lg"
              radius="lg"
              className="border-0 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#F08C23]" />
                <Title order={3} className="text-lg font-bold text-gray-900">
                  Certifications
                </Title>
              </div>
              <Group gap="xs">
                {supplierData.certifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="light"
                    style={{ backgroundColor: "#388E3C20", color: "#388E3C" }}
                    leftSection={<CheckCircle className="w-3 h-3" />}
                  >
                    {cert}
                  </Badge>
                ))}
              </Group>
            </Card>
          </div>

          {/* Right Section - Business Details */}
          <div className="space-y-6">
            {/* Categories */}
            {supplier.categories.length > 0 && (
              <Card
                shadow="md"
                padding="lg"
                radius="lg"
                className="border-0 shadow-lg"
              >
                <Title
                  order={3}
                  className="text-lg font-bold text-gray-900 mb-4"
                >
                  Categories & Services
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {supplier.categories.map((category) => (
                    <Paper
                      key={category.id}
                      p="md"
                      className="border border-[#3D6B2C] bg-gradient-to-r from-[#3D6B2C]/5 to-[#388E3C]/5 hover:from-[#3D6B2C]/10 hover:to-[#388E3C]/10 transition-all duration-300 cursor-pointer"
                      radius="md"
                    >
                      <Text className="font-medium text-[#3D6B2C] text-center">
                        {category?.item_category?.name}
                      </Text>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Card>
            )}

            {/* Business Features */}
            <Card
              shadow="md"
              padding="lg"
              radius="lg"
              className="border-0 shadow-lg"
            >
              <Title order={3} className="text-lg font-bold text-gray-900 mb-4">
                Business Features
              </Title>
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                {businessFeatures.map((feature, index) => (
                  <Tooltip key={index} label={feature.label} position="top">
                    <div className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <ThemeIcon
                        variant="light"
                        color={feature.active ? "#388E3C" : "#gray"}
                        size="lg"
                        className="mb-2"
                      >
                        <feature.icon className="w-5 h-5" />
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
                  </Tooltip>
                ))}
              </SimpleGrid>
            </Card>
            {/* Social Media */}
            <Card
              shadow="md"
              padding="lg"
              radius="lg"
              className="border-0 shadow-lg"
            >
              <Title order={3} className="text-lg font-bold text-gray-900 mb-4">
                Follow Us
              </Title>
              <Group gap="md">
                {socialLinks.map((social, index) => (
                  <Tooltip key={index} label={social.platform} position="top">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      className="hover:scale-110 transition-transform"
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
              </Group>
            </Card>
          </div>
        </SimpleGrid>

        {/* Call to Action */}
        <div className="mt-12 text-center hidden">
          <Card
            shadow="md"
            padding="xl"
            radius="lg"
            className="border-0 shadow-lg bg-gradient-to-r from-[#3D6B2C] to-[#388E3C]"
          >
            <Title order={2} className="text-white mb-4">
              Ready to Work Together?
            </Title>
            <Text className="text-white/90 mb-6 max-w-2xl mx-auto">
              Get in touch with us for your next construction project. We
              provide quality materials and professional service.
            </Text>
            <Group gap="md" className="justify-center">
              <Button
                size="lg"
                variant="white"
                className="text-[#3D6B2C] hover:bg-gray-100"
              >
                Request Quote
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#3D6B2C]"
              >
                View Products
              </Button>
            </Group>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
