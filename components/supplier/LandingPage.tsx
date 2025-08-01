"use client";
import React, { useState } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Modal,
  TextInput,
  ActionIcon,
  Divider,
  Paper,
  Grid,
  Avatar,
  Transition,
  Box,
  Accordion,
  ThemeIcon,
  Tooltip,
  Title,
  Select,
} from "@mantine/core";
import {
  DollarSign,
  Package,
  CheckCircle,
  Users,
  UserPlus,
  UserMinus,
  Store,
  Activity,
  TrendingUp,
  ShoppingCart,
  FileText,
  Crown,
  Phone,
  Mail,
  MapPin,
  Truck,
  Wifi,
  CreditCard,
  Archive,
  Shield,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Tag,
  User,
  Building,
  Navigation,
  LucideProps,
  LoaderCircle,
  ReceiptText,
} from "lucide-react";

import { CoinBalance, SupplierDetails } from "@/types";
import { notify } from "@/lib/notifications";
import { inviteUserToSupplier } from "@/api/supplier";
import SocialShare from "@/lib/SocilalShareComponent";
import KeyContractBanner from "../contract/contractBanner";
//import PaymentModal from "../Tokens";

type Props = { supplierDetails: SupplierDetails; balance: CoinBalance };
type Stafftype = "staff" | "service_provider";
type Role = "normal" | "advanced";
const SupplierDashboard: React.FC<Props> = ({
  supplierDetails: _supplierInfo,
  balance,
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [staffEmail, setNewStaffEmail] = useState("");
  const [type, setType] = useState<Stafftype | "">("");
  const [loading, setLoading] = useState(false);
  const [ksNumber, setKSNumber] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [role, setRole] = useState<"normal" | "advanced" | "">("");

  const [animateCards, setAnimateCards] = useState(false);
  const [contract, setContract] = useState(false);

  // Mock data - replace with your actual API data
  const supplierInfo = {
    name: "John Kamau",
    phone: "+254 712 345 678",
    email: "john.kamau@premiumhardware.co.ke",
    type: "company",
    address: "Moi Avenue, Embu Town, Embu County",
    latitude: -0.5317,
    longitude: 37.4502,
    categories: [
      "Building Materials",
      "Hardware Tools",
      "Electrical Supplies",
      "Plumbing",
    ],
    shopName: "Premium Hardware & Supplies",
    keymanNumber: "KS045",
    totalStaff: 1,
    // Optional fields
    facebook_link: "https://facebook.com/premiumhardware",
    instagram_link: "https://instagram.com/premiumhardware_ke",
    offers_transport: true,
    internet_access: true,
    has_pos: true,
    has_inventory: true,
    is_escrow_only: false,
    photo: null,
    comments:
      "Specializing in quality construction materials with over 10 years of experience in the industry.",
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateStaff = () => {
    if (type.length === 0) {
      notify.error("Please select type of staff");
      return false;
    }
    if (type === "staff") {
      if (staffEmail.trim().length < 5) {
        notify.error("Please enter a valid email address");
        return false;
      }

      if (role.trim().length < 3) {
        notify.error("Please select a valid role");
        return false;
      }
      return true;
    } else if (type === "service_provider") {
      if (ksNumber.trim().length < 3) {
        notify.error("Please enter a valid KS Number");
        return false;
      }
      if (serviceType.trim().length < 3) {
        notify.error("Please enter a valid service type");
        return false;
      }
      return true;
    }
    return true;
  };

  const resetFormState = () => {
    setNewStaffEmail("");

    setRole("");
    setServiceType("");
  };

  const handleInviteStaff = async () => {
    if (validateStaff()) {
      if (_supplierInfo?.email === staffEmail)
        return notify.error("You cannot invite yourself as supplier");
      const payload = {
        email: staffEmail,
        role,
        type,
        service_types: serviceType,
        supplier_detail_id: _supplierInfo?.id,
        ks_number: ksNumber,
      };
      setLoading(true);
      const response = await inviteUserToSupplier(payload);
      setLoading(false);
      if (response.status) {
        notify.success(response.message);
        resetFormState();
        setTimeout(() => setInviteModalOpen(false), 3000);
      } else {
        notify.error("Something went wrong, try again later");
      }

      //setInviteModalOpen(false);
    }
  };

  const openGoogleMaps = () => {
    const [long, lat] = _supplierInfo?.location?.coordinates;

    if (lat && long) {
      window.open(`https://maps.google.com/?q=${lat},${long}`, "_blank");
    }
  };
  const removeStaffMember = (staff: SupplierDetails["staff"][0]) => {
    if (confirm(`Remove ${staff?.user?.name}`)) {
    }
  };

  const StaffMemberInvitation = (
    <Modal
      opened={inviteModalOpen}
      onClose={() => setInviteModalOpen(false)}
      title={
        <Group align="center" gap="sm">
          <UserPlus size={20} color="#3D6B2C" />
          <Text fw={600}>Invite New Staff Member</Text>
        </Group>
      }
      centered
      radius="md"
    >
      <Stack gap="md">
        <Select
          label="Choose Type "
          onChange={(value) => (value ? setType(value as Stafftype) : null)}
          required
          value={type}
          data={[
            { label: "staff", value: "staff" },
            { label: "Service provider", value: "service_provider" },
          ]}
        />
        {type === "service_provider" && (
          <>
            <TextInput
              label="Enter provider KS Number"
              placeholder="Enter Ks Number"
              value={ksNumber}
              onChange={(e) => setKSNumber(e.target.value)}
              required
            />
            <TextInput
              label={` Enter the type of service`}
              placeholder="Enter service type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            />
          </>
        )}
        {type === "staff" && (
          <>
            <TextInput
              label="Staff Email"
              placeholder="Enter email address"
              value={staffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              required
            />
            <Select
              label="Choose Type of role"
              onChange={(value) => (value ? setRole(value as Role) : null)}
              required
              value={role}
              data={[
                { label: "Normal", value: "normal" },
                { label: "Advanced", value: "advanced" },
              ]}
            />
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setInviteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteStaff}
            className="bg-gradient-to-r from-green-600 to-green-700"
            disabled={loading}
            loading={loading}
          >
            Send Invitation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "#3D6B2C",
    delay = 0,
  }: {
    icon: React.FC<LucideProps>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    delay?: number;
  }) => (
    <Transition
      mounted={animateCards}
      transition="slide-up"
      duration={600}
      timingFunction="ease"
      exitDuration={0}
    >
      {(styles) => (
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          className="hover:shadow-lg transition-all min-h-[180px] duration-300 hover:scale-105 border border-gray-100"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            animationDelay: `${delay}ms`,
            ...styles,
          }}
        >
          <Group justify="space-between" mb="xs">
            <Box
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: "12px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} color="white" />
            </Box>
            <Badge
              variant="light"
              color="green"
              size="sm"
              className="animate-pulse"
            >
              Live
            </Badge>
          </Group>

          <Text size="xl" fw={700} className="text-gray-800 !pl-8">
            {value}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={2}>
              {subtitle}
            </Text>
          )}
        </Card>
      )}
    </Transition>
  );

  const SocialIcon = ({
    platform,
    link,
    icon: Icon,
    color,
  }: {
    platform: string;
    link: string;
    icon: React.FC<LucideProps>;
    color: string;
  }) => (
    <Tooltip label={`Visit ${platform}`}>
      <ActionIcon
        component="a"
        href={link}
        target="_blank"
        variant="light"
        color={color}
        size="lg"
        radius="xl"
        className="hover:scale-110 transition-transform duration-200"
      >
        <Icon size={18} />
      </ActionIcon>
    </Tooltip>
  );

  return (
    <div className=" p-2 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <KeyContractBanner opened={contract} onClose={() => setContract(false)} />

      {/* Enhanced Header Section */}
      <Transition mounted={animateCards} transition="fade" duration={800}>
        {(styles) => (
          <div style={styles} className="mb-8 ">
            <Paper
              p={{ base: "sm", md: "xl" }}
              radius="lg"
              shadow="sm"
              className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200"
            >
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Group align="flex-start" gap="lg">
                    <Avatar
                      src={
                        _supplierInfo?.photo &&
                        _supplierInfo?.photo[0]?.length > 0
                          ? _supplierInfo?.photo[0]
                          : null
                      }
                      alt={_supplierInfo?.name ?? "Keyman Store"}
                      size={120}
                      radius="lg"
                      className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg"
                    >
                      {_supplierInfo?.name
                        ?.split(" ")
                        ?.map((n) => n[0])
                        .join("") ?? "KS"}
                    </Avatar>
                    <div className="flex-1">
                      <Group align="center" gap="sm" mb="xs">
                        <Store size={24} color="#3D6B2C" />
                        <Title order={2} className="text-gray-800 ">
                          {_supplierInfo?.name}
                        </Title>
                      </Group>
                      <Text
                        size="lg"
                        fw={500}
                        className="text-gray-700 mb-2 hidden"
                      >
                        {supplierInfo.name}
                      </Text>
                      <Group gap="xs" mb="sm">
                        <Badge
                          variant="light"
                          color={
                            supplierInfo.type === "company" ? "blue" : "green"
                          }
                          leftSection={
                            supplierInfo.type === "company" ? (
                              <Building size={12} />
                            ) : (
                              <User size={12} />
                            )
                          }
                        >
                          {_supplierInfo?.type?.includes("_")
                            ? _supplierInfo?.type?.replace("_", " ")
                            : _supplierInfo?.type}
                        </Badge>
                        <Badge
                          variant="gradient"
                          gradient={{ from: "#3D6B2C", to: "#388E3C" }}
                          leftSection={<Crown size={16} />}
                          size="xl"
                        >
                          Keyman #{_supplierInfo?.keyman_number}
                        </Badge>
                      </Group>
                      <Group gap="lg">
                        <Group gap="xs">
                          <Phone size={16} color="#666" />
                          <Text size="sm" c="dimmed">
                            {_supplierInfo?.phone}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Mail size={16} color="#666" />
                          <Text size="sm" c="dimmed">
                            {_supplierInfo?.email}
                          </Text>
                        </Group>
                      </Group>
                    </div>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack align="flex-end" gap="sm">
                    <Button
                      leftSection={<Navigation size={16} />}
                      variant="light"
                      color="green"
                      onClick={openGoogleMaps}
                      className="transition-transform hover:scale-105"
                    >
                      View Location
                    </Button>
                    <div>
                      <Button
                        size="md"
                        variant="filled"
                        onClick={() => setContract(true)}
                        leftSection={<ReceiptText size={20} />}
                        color="keymanOrange"
                        className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Keycontract
                      </Button>
                    </div>
                    {/* Social Media Links */}
                    {(_supplierInfo?.facebook_link ||
                      _supplierInfo?.instagram_link ||
                      _supplierInfo?.twitter_link ||
                      _supplierInfo?.youtube_link ||
                      _supplierInfo?.tiktok_link) && (
                      <Group gap="xs">
                        {_supplierInfo.facebook_link && (
                          <SocialIcon
                            platform="Facebook"
                            link={_supplierInfo.facebook_link}
                            icon={Facebook}
                            color="blue"
                          />
                        )}
                        {_supplierInfo.instagram_link && (
                          <SocialIcon
                            platform="Instagram"
                            link={_supplierInfo.instagram_link}
                            icon={Instagram}
                            color="pink"
                          />
                        )}
                        {_supplierInfo?.twitter_link && (
                          <SocialIcon
                            platform="Twitter"
                            link={_supplierInfo.twitter_link}
                            icon={Twitter}
                            color="cyan"
                          />
                        )}
                        {_supplierInfo.youtube_link && (
                          <SocialIcon
                            platform="YouTube"
                            link={_supplierInfo.youtube_link}
                            icon={Youtube}
                            color="red"
                          />
                        )}
                        {_supplierInfo.tiktok_link && (
                          <SocialIcon
                            platform="TikTok"
                            link={_supplierInfo.tiktok_link}
                            icon={Music2}
                            color="dark"
                          />
                        )}
                      </Group>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </div>
        )}
      </Transition>

      {/* Revenue Card */}
      <div className="mb-8">
        <Transition
          mounted={animateCards}
          transition="slide-up"
          duration={700}
          timingFunction="ease"
        >
          {(styles) => (
            <Paper
              style={styles}
              shadow="md"
              p="xl"
              radius="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-10">
                <TrendingUp size={120} />
              </div>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="sm" className="text-green-100 mb-2">
                    TOTAL REVENUE
                  </Text>
                  <Group align="baseline" gap="xs">
                    <Text size="3xl" fw={900}>
                      {balance?.total?.toLocaleString()} coins
                    </Text>
                  </Group>
                  <Text size="sm" className="text-green-100 mt-2">
                    Last 30 days
                  </Text>
                </div>
                <div>
                  <Text size="sm" className="text-green-100 mb-2">
                    BREAKDOWN
                  </Text>
                  <Group justify="space-between" align="flex-end">
                    <Text>
                      Free:{" "}
                      <Badge size="md" variant="filled" color="keymanOrange">
                        {balance?.breakdown?.free}
                      </Badge>
                    </Text>
                    <Text>
                      Top Up:{" "}
                      <Badge
                        size="md"
                        // variant="gradient"
                        //</Text>gradient={{ from: '#3D6B2C', to: '#388E3C' }}
                        variant="filled"
                        color="keymanOrange"
                      >
                        {" "}
                        {balance?.breakdown?.topup ?? 0}
                      </Badge>
                    </Text>
                  </Group>
                </div>
                <Group justify="space-between" align="center" display="none">
                  <Button>Top up coins</Button>
                </Group>

                <ActionIcon
                  size="xl"
                  radius="xl"
                  variant="white"
                  color="green"
                  className="animate-bounce"
                >
                  <DollarSign size={24} />
                </ActionIcon>
              </Group>
            </Paper>
          )}
        </Transition>
      </div>

      {/* Activity Summary */}
      <div className="mb-8">
        <Text
          size="lg"
          fw={600}
          mb="md"
          className="text-gray-800 flex items-center gap-2"
        >
          <Activity size={20} color="#3D6B2C" />
          Activity Summary
        </Text>

        <Grid align="stretch" justify="center">
          <Grid.Col span={{ base: 12, xs: 4, sm: 2 }}>
            <StatCard
              icon={FileText}
              title="REQUESTS RECEIVED"
              value={_supplierInfo?.requests_count ?? 0}
              color="#3D6B2C"
              delay={100}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 4, sm: 2 }}>
            <StatCard
              icon={CheckCircle}
              title="QUOTES DONE"
              value={_supplierInfo?.quotes_count ?? 0}
              color="#F08C23"
              delay={200}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 4, sm: 2 }}>
            <StatCard
              icon={ShoppingCart}
              title="ORDERS RECEIVED"
              value={_supplierInfo?.orders_count ?? 0}
              color="#388E3C"
              delay={300}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 4, sm: 2 }}>
            <StatCard
              icon={Package}
              title="ORDERS COMPLETED"
              value={_supplierInfo?.orders_by_status?.COMPLETED ?? 0}
              color="#3D6B2C"
              delay={400}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 4, sm: 2 }}>
            <StatCard
              icon={LoaderCircle}
              title="ORDERS PENDING"
              value={_supplierInfo?.orders_by_status?.PENDING ?? 0}
              color="#8BC34A"
              delay={400}
            />
          </Grid.Col>
        </Grid>
      </div>

      {/* Supplier Details Accordion */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <div className="mb-8">
            <Transition
              mounted={animateCards}
              transition="slide-up"
              duration={600}
            >
              {(styles) => (
                <Card style={styles} shadow="sm" padding="lg" radius="md">
                  <Text
                    size="lg"
                    fw={600}
                    mb="md"
                    className="text-gray-800 flex items-center gap-2"
                  >
                    <User size={20} color="#3D6B2C" />
                    Supplier Profile Details
                  </Text>

                  <Accordion variant="contained" radius="md">
                    {/* Basic Information */}
                    <Accordion.Item value="basic-info">
                      <Accordion.Control
                        icon={<User size={16} color="#3D6B2C" />}
                      >
                        Basic Information
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Group gap="xs" mb="sm">
                              <MapPin size={16} color="#666" />
                              <Text size="sm" fw={500}>
                                Address:
                              </Text>
                            </Group>
                            <Text size="sm" c="dimmed" mb="md">
                              {_supplierInfo?.address}
                            </Text>
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Group gap="xs" mb="sm">
                              <Tag size={16} color="#666" />
                              <Text size="sm" fw={500}>
                                Categories:
                              </Text>
                            </Group>
                            <Group gap="xs">
                              {_supplierInfo?.categories?.map(
                                (category, index) => (
                                  <Badge
                                    key={index}
                                    variant="light"
                                    color="green"
                                    size="sm"
                                  >
                                    {category?.item_category?.name}
                                  </Badge>
                                )
                              )}
                            </Group>
                          </Grid.Col>
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>

                    {/* Business Capabilities */}
                    <Accordion.Item value="capabilities">
                      <Accordion.Control
                        icon={<Store size={16} color="#F08C23" />}
                      >
                        Business Capabilities
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Paper
                              p="md"
                              radius="md"
                              className="bg-gray-50 text-center"
                            >
                              <ThemeIcon
                                size="xl"
                                radius="xl"
                                variant={
                                  _supplierInfo?.offers_transport
                                    ? "filled"
                                    : "light"
                                }
                                color={
                                  _supplierInfo?.offers_transport
                                    ? "green"
                                    : "gray"
                                }
                                mb="sm"
                              >
                                <Truck size={24} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                Transport
                              </Text>
                              <Text
                                size="xs"
                                c={
                                  _supplierInfo?.offers_transport
                                    ? "green"
                                    : "dimmed"
                                }
                              >
                                {_supplierInfo?.offers_transport
                                  ? "Available"
                                  : "Not Available"}
                              </Text>
                            </Paper>
                          </Grid.Col>

                          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Paper
                              p="md"
                              radius="md"
                              className="bg-gray-50 text-center"
                            >
                              <ThemeIcon
                                size="xl"
                                radius="xl"
                                variant={
                                  _supplierInfo?.internet_access
                                    ? "filled"
                                    : "light"
                                }
                                color={
                                  _supplierInfo?.internet_access
                                    ? "blue"
                                    : "gray"
                                }
                                mb="sm"
                              >
                                <Wifi size={24} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                Internet
                              </Text>
                              <Text
                                size="xs"
                                c={
                                  _supplierInfo?.internet_access
                                    ? "blue"
                                    : "dimmed"
                                }
                              >
                                {_supplierInfo?.internet_access
                                  ? "Available"
                                  : "Not Available"}
                              </Text>
                            </Paper>
                          </Grid.Col>

                          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Paper
                              p="md"
                              radius="md"
                              className="bg-gray-50 text-center"
                            >
                              <ThemeIcon
                                size="xl"
                                radius="xl"
                                variant={
                                  _supplierInfo?.has_pos ? "filled" : "light"
                                }
                                color={
                                  _supplierInfo?.has_pos ? "orange" : "gray"
                                }
                                mb="sm"
                              >
                                <CreditCard size={24} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                POS System
                              </Text>
                              <Text
                                size="xs"
                                c={_supplierInfo?.has_pos ? "orange" : "dimmed"}
                              >
                                {_supplierInfo?.has_pos
                                  ? "Available"
                                  : "Not Available"}
                              </Text>
                            </Paper>
                          </Grid.Col>

                          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                            <Paper
                              p="md"
                              radius="md"
                              className="bg-gray-50 text-center"
                            >
                              <ThemeIcon
                                size="xl"
                                radius="xl"
                                variant={
                                  _supplierInfo?.has_inventory
                                    ? "filled"
                                    : "light"
                                }
                                color={
                                  _supplierInfo?.has_inventory ? "teal" : "gray"
                                }
                                mb="sm"
                              >
                                <Archive size={24} />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                Inventory
                              </Text>
                              <Text
                                size="xs"
                                c={
                                  _supplierInfo?.has_inventory
                                    ? "teal"
                                    : "dimmed"
                                }
                              >
                                {_supplierInfo?.has_inventory
                                  ? "Managed"
                                  : "Not Managed"}
                              </Text>
                            </Paper>
                          </Grid.Col>
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>

                    {/* Payment & Security */}
                    <Accordion.Item value="payment">
                      <Accordion.Control
                        icon={<Shield size={16} color="#388E3C" />}
                      >
                        Payment & Security
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Group gap="md">
                          <ThemeIcon
                            size="xl"
                            radius="xl"
                            variant={
                              _supplierInfo?.is_escrow_only ? "filled" : "light"
                            }
                            color={
                              _supplierInfo?.is_escrow_only ? "red" : "green"
                            }
                          >
                            <Shield size={24} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500}>
                              {_supplierInfo?.is_escrow_only
                                ? "Escrow Only"
                                : "Multiple Payment Options"}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {_supplierInfo?.is_escrow_only
                                ? "This supplier only accepts escrow payments for security"
                                : "This supplier accepts various payment methods including direct payments"}
                            </Text>
                          </div>
                        </Group>
                      </Accordion.Panel>
                    </Accordion.Item>

                    {/* Additional Comments */}
                    {_supplierInfo?.comments && (
                      <Accordion.Item value="comments">
                        <Accordion.Control
                          icon={<MessageSquare size={16} color="#666" />}
                        >
                          Additional Information
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Paper
                            p="md"
                            radius="md"
                            className="bg-blue-50 border border-blue-200"
                          >
                            <Text size="sm" style={{ lineHeight: 1.6 }}>
                              {_supplierInfo?.comments}
                            </Text>
                          </Paper>
                        </Accordion.Panel>
                      </Accordion.Item>
                    )}
                  </Accordion>
                </Card>
              )}
            </Transition>
          </div>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <SocialShare
            url={`https://www.keymanstores.com/supplier/${_supplierInfo?.id}`}
            title={"my store"}
          />
        </Grid.Col>
      </Grid>

      {/* Staff Management Section */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Transition
            mounted={animateCards}
            transition="slide-right"
            duration={600}
            timingFunction="ease"
          >
            {(styles) => (
              <Card
                style={styles}
                shadow="sm"
                padding="lg"
                radius="md"
                className="h-full"
              >
                <Group justify="space-between" mb="md">
                  <Group align="center" gap="sm">
                    <Users size={20} color="#3D6B2C" />
                    <Text fw={600}>Staff Members</Text>
                  </Group>
                  <Badge variant="light" color="green">
                    {_supplierInfo?.staff_count ?? "-"} Staff
                  </Badge>
                </Group>

                <Stack gap="sm">
                  {_supplierInfo?.staff &&
                    _supplierInfo?.staff?.toReversed()?.map((staff) => (
                      <Paper
                        key={staff.id}
                        p="md"
                        radius="md"
                        className="border border-gray-100 hover:shadow-sm transition-all duration-200"
                      >
                        <Group justify="space-between">
                          <Group>
                            <Avatar
                              src={staff?.user?.profile_photo_url}
                              alt={staff?.user?.name}
                              size="md"
                              radius="xl"
                              className="bg-gradient-to-r from-green-400 to-green-600"
                            >
                              {staff?.user?.name
                                .split(" ")
                                ?.map((n) => n[0])
                                .join("")}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {staff?.user?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {"role"}
                              </Text>
                            </div>
                          </Group>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            className="hover:scale-110 transition-transform"
                            onClick={() => removeStaffMember(staff)}
                          >
                            <UserMinus size={16} />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    ))}
                </Stack>
              </Card>
            )}
          </Transition>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Transition
            mounted={animateCards}
            transition="slide-left"
            duration={600}
            timingFunction="ease"
          >
            {(styles) => (
              <Card
                style={styles}
                shadow="sm"
                padding="lg"
                radius="md"
                className="h-full"
              >
                <Group justify="space-between" mb="md">
                  <Group align="center" gap="sm">
                    <UserPlus size={20} color="#F08C23" />
                    <Text fw={600}>Staff Management</Text>
                  </Group>
                </Group>

                <Stack gap="md">
                  <Button
                    leftSection={<UserPlus size={16} />}
                    onClick={() => setInviteModalOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200"
                    radius="md"
                    size="md"
                    fullWidth
                  >
                    Invite New Staff
                  </Button>

                  <Divider label="Quick Actions" labelPosition="center" />

                  <Paper p="md" radius="md" className="bg-gray-50">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="sm" fw={500}>
                          Total Staff
                        </Text>
                        <Text size="xs" c="dimmed">
                          Active team members
                        </Text>
                      </div>
                      <Badge
                        size="lg"
                        variant="gradient"
                        gradient={{ from: "#3D6B2C", to: "#388E3C" }}
                      >
                        {_supplierInfo?.staff_count ?? 0}
                      </Badge>
                    </Group>
                  </Paper>
                </Stack>
              </Card>
            )}
          </Transition>
        </Grid.Col>
      </Grid>

      {StaffMemberInvitation}
    </div>
  );
};

export default SupplierDashboard;
