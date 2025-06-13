"use client"
import React, { useState } from 'react';
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
} from '@mantine/core';
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
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface DashboardStats {
  totalRevenue: number;
  requestsReceived: number;
  quotesDone: number;
  ordersReceived: number;
  ordersCompleted: number;
}

interface SupplierInfo {
  name: string;
  phone: string;
  email: string;
  type: 'individual' | 'company';
  address: string;
  latitude: number;
  longitude: number;
  categories: string[];
  shopName: string;
  keymanNumber: string;
  totalStaff: number;
  // Optional fields
  tiktok_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  instagram_link?: string;
  twitter_link?: string;
  offers_transport?: boolean;
  internet_access?: boolean;
  has_pos?: boolean;
  has_inventory?: boolean;
  is_escrow_only?: boolean;
  photo?: File|null;
  comments?: string;
}

const SupplierDashboard: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [animateCards, setAnimateCards] = useState(false);

  // Mock data - replace with your actual API data
  const supplierInfo: SupplierInfo = {
    name: "John Kamau",
    phone: "+254 712 345 678",
    email: "john.kamau@premiumhardware.co.ke",
    type: "company",
    address: "Moi Avenue, Embu Town, Embu County",
    latitude: -0.5317,
    longitude: 37.4502,
    categories: ["Building Materials", "Hardware Tools", "Electrical Supplies", "Plumbing"],
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
    comments: "Specializing in quality construction materials with over 10 years of experience in the industry."
  };

  const stats: DashboardStats = {
    totalRevenue: 5,
    requestsReceived: 0,
    quotesDone: 0,
    ordersReceived: 0,
    ordersCompleted: 0,
  };

  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Store Manager',
    },
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInviteStaff = () => {
    if (newStaffName.trim() && newStaffRole.trim()) {
      console.log('Inviting:', { name: newStaffName, role: newStaffRole });
      setNewStaffName('');
      setNewStaffRole('');
      setInviteModalOpen(false);
    }
  };

  const openGoogleMaps = () => {
    window.open(`https://maps.google.com/?q=${supplierInfo.latitude},${supplierInfo.longitude}`, '_blank');
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = "#3D6B2C",
    delay = 0 
  }: {
    icon: React.ReactElement;
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
          className="hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            animationDelay: `${delay}ms`,
            ...styles
          }}
        >
          <Group justify="space-between" mb="xs">
            <Box
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          
          <Text size="xl" fw={700} className="text-gray-800">
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

  const SocialIcon = ({ platform, link, icon: Icon, color }: { 
    platform: string; 
    link: string; 
    icon: React.ReactElement; 
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Enhanced Header Section */}
      <Transition mounted={animateCards} transition="fade" duration={800}>
        {(styles) => (
          <div style={styles} className="mb-8">
            <Paper p="xl" radius="lg" shadow="sm" className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
              <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Group align="flex-start" gap="lg">
                    <Avatar
                      src={""}
                      alt={supplierInfo.name}
                      size={80}
                      radius="lg"
                      className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg"
                    >
                      {supplierInfo.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <div className="flex-1">
                      <Group align="center" gap="sm" mb="xs">
                        <Store size={24} color="#3D6B2C" />
                        <Title order={2} className="text-gray-800">
                          {supplierInfo.shopName}
                        </Title>
                      </Group>
                      <Text size="lg" fw={500} className="text-gray-700 mb-2">
                        {supplierInfo.name}
                      </Text>
                      <Group gap="xs" mb="sm">
                        <Badge
                          variant="light"
                          color={supplierInfo.type === 'company' ? 'blue' : 'green'}
                          leftSection={supplierInfo.type === 'company' ? <Building size={12} /> : <User size={12} />}
                        >
                          {supplierInfo.type === 'company' ? 'Company' : 'Individual'}
                        </Badge>
                        <Badge
                          variant="gradient"
                          gradient={{ from: '#3D6B2C', to: '#388E3C' }}
                          leftSection={<Crown size={12} />}
                        >
                          Keyman #{supplierInfo.keymanNumber}
                        </Badge>
                      </Group>
                      <Group gap="lg">
                        <Group gap="xs">
                          <Phone size={16} color="#666" />
                          <Text size="sm" c="dimmed">{supplierInfo.phone}</Text>
                        </Group>
                        <Group gap="xs">
                          <Mail size={16} color="#666" />
                          <Text size="sm" c="dimmed">{supplierInfo.email}</Text>
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
                    {/* Social Media Links */}
                    {(supplierInfo.facebook_link || supplierInfo.instagram_link || 
                      supplierInfo.twitter_link || supplierInfo.youtube_link || 
                      supplierInfo.tiktok_link) && (
                      <Group gap="xs">
                        {supplierInfo.facebook_link && (
                          <SocialIcon 
                            platform="Facebook" 
                            link={supplierInfo.facebook_link} 
                            icon={Facebook} 
                            color="blue" 
                          />
                        )}
                        {supplierInfo.instagram_link && (
                          <SocialIcon 
                            platform="Instagram" 
                            link={supplierInfo.instagram_link} 
                            icon={Instagram} 
                            color="pink" 
                          />
                        )}
                        {supplierInfo.twitter_link && (
                          <SocialIcon 
                            platform="Twitter" 
                            link={supplierInfo.twitter_link} 
                            icon={Twitter} 
                            color="cyan" 
                          />
                        )}
                        {supplierInfo.youtube_link && (
                          <SocialIcon 
                            platform="YouTube" 
                            link={supplierInfo.youtube_link} 
                            icon={Youtube} 
                            color="red" 
                          />
                        )}
                        {supplierInfo.tiktok_link && (
                          <SocialIcon 
                            platform="TikTok" 
                            link={supplierInfo.tiktok_link} 
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
        <Transition mounted={animateCards} transition="slide-up" duration={700} timingFunction="ease">
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
                      KES {stats.totalRevenue.toLocaleString()}
                    </Text>
                  </Group>
                  <Text size="sm" className="text-green-100 mt-2">
                    Last 30 days
                  </Text>
                </div>
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
        <Text size="lg" fw={600} mb="md" className="text-gray-800 flex items-center gap-2">
          <Activity size={20} color="#3D6B2C" />
          Activity Summary
        </Text>
        
        <Grid>
          <Grid.Col span={{ base: 12, xs: 6, sm: 3 }}>
            <StatCard
              icon={FileText}
              title="REQUESTS RECEIVED"
              value={stats.requestsReceived}
              color="#3D6B2C"
              delay={100}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, xs: 6, sm: 3 }}>
            <StatCard
              icon={CheckCircle}
              title="QUOTES DONE"
              value={stats.quotesDone}
              color="#F08C23"
              delay={200}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, xs: 6, sm: 3 }}>
            <StatCard
              icon={ShoppingCart}
              title="ORDERS RECEIVED"
              value={stats.ordersReceived}
              color="#388E3C"
              delay={300}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, xs: 6, sm: 3 }}>
            <StatCard
              icon={Package}
              title="ORDERS COMPLETED"
              value={stats.ordersCompleted}
              color="#3D6B2C"
              delay={400}
            />
          </Grid.Col>
        </Grid>
      </div>

      {/* Supplier Details Accordion */}
      <div className="mb-8">
        <Transition mounted={animateCards} transition="slide-up" duration={600}>
          {(styles) => (
            <Card style={styles} shadow="sm" padding="lg" radius="md">
              <Text size="lg" fw={600} mb="md" className="text-gray-800 flex items-center gap-2">
                <User size={20} color="#3D6B2C" />
                Supplier Profile Details
              </Text>
              
              <Accordion variant="contained" radius="md">
                {/* Basic Information */}
                <Accordion.Item value="basic-info">
                  <Accordion.Control icon={<User size={16} color="#3D6B2C" />}>
                    Basic Information
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Group gap="xs" mb="sm">
                          <MapPin size={16} color="#666" />
                          <Text size="sm" fw={500}>Address:</Text>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md">
                          {supplierInfo.address}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Group gap="xs" mb="sm">
                          <Tag size={16} color="#666" />
                          <Text size="sm" fw={500}>Categories:</Text>
                        </Group>
                        <Group gap="xs">
                          {supplierInfo.categories.map((category, index) => (
                            <Badge key={index} variant="light" color="green" size="sm">
                              {category}
                            </Badge>
                          ))}
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Business Capabilities */}
                <Accordion.Item value="capabilities">
                  <Accordion.Control icon={<Store size={16} color="#F08C23" />}>
                    Business Capabilities
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Paper p="md" radius="md" className="bg-gray-50 text-center">
                          <ThemeIcon
                            size="xl"
                            radius="xl"
                            variant={supplierInfo.offers_transport ? "filled" : "light"}
                            color={supplierInfo.offers_transport ? "green" : "gray"}
                            mb="sm"
                          >
                            <Truck size={24} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>Transport</Text>
                          <Text size="xs" c={supplierInfo.offers_transport ? "green" : "dimmed"}>
                            {supplierInfo.offers_transport ? "Available" : "Not Available"}
                          </Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Paper p="md" radius="md" className="bg-gray-50 text-center">
                          <ThemeIcon
                            size="xl"
                            radius="xl"
                            variant={supplierInfo.internet_access ? "filled" : "light"}
                            color={supplierInfo.internet_access ? "blue" : "gray"}
                            mb="sm"
                          >
                            <Wifi size={24} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>Internet</Text>
                          <Text size="xs" c={supplierInfo.internet_access ? "blue" : "dimmed"}>
                            {supplierInfo.internet_access ? "Available" : "Not Available"}
                          </Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Paper p="md" radius="md" className="bg-gray-50 text-center">
                          <ThemeIcon
                            size="xl"
                            radius="xl"
                            variant={supplierInfo.has_pos ? "filled" : "light"}
                            color={supplierInfo.has_pos ? "orange" : "gray"}
                            mb="sm"
                          >
                            <CreditCard size={24} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>POS System</Text>
                          <Text size="xs" c={supplierInfo.has_pos ? "orange" : "dimmed"}>
                            {supplierInfo.has_pos ? "Available" : "Not Available"}
                          </Text>
                        </Paper>
                      </Grid.Col>
                      
                      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Paper p="md" radius="md" className="bg-gray-50 text-center">
                          <ThemeIcon
                            size="xl"
                            radius="xl"
                            variant={supplierInfo.has_inventory ? "filled" : "light"}
                            color={supplierInfo.has_inventory ? "teal" : "gray"}
                            mb="sm"
                          >
                            <Archive size={24} />
                          </ThemeIcon>
                          <Text size="sm" fw={500}>Inventory</Text>
                          <Text size="xs" c={supplierInfo.has_inventory ? "teal" : "dimmed"}>
                            {supplierInfo.has_inventory ? "Managed" : "Not Managed"}
                          </Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Payment & Security */}
                <Accordion.Item value="payment">
                  <Accordion.Control icon={<Shield size={16} color="#388E3C" />}>
                    Payment & Security
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="xl"
                        variant={supplierInfo.is_escrow_only ? "filled" : "light"}
                        color={supplierInfo.is_escrow_only ? "red" : "green"}
                      >
                        <Shield size={24} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>
                          {supplierInfo.is_escrow_only ? "Escrow Only" : "Multiple Payment Options"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {supplierInfo.is_escrow_only 
                            ? "This supplier only accepts escrow payments for security"
                            : "This supplier accepts various payment methods including direct payments"
                          }
                        </Text>
                      </div>
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>

                {/* Additional Comments */}
                {supplierInfo.comments && (
                  <Accordion.Item value="comments">
                    <Accordion.Control icon={<MessageSquare size={16} color="#666" />}>
                      Additional Information
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Paper p="md" radius="md" className="bg-blue-50 border border-blue-200">
                        <Text size="sm" style={{ lineHeight: 1.6 }}>
                          {supplierInfo.comments}
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

      {/* Staff Management Section */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Transition mounted={animateCards} transition="slide-right" duration={600} timingFunction="ease">
            {(styles) => (
              <Card style={styles} shadow="sm" padding="lg" radius="md" className="h-full">
                <Group justify="space-between" mb="md">
                  <Group align="center" gap="sm">
                    <Users size={20} color="#3D6B2C" />
                    <Text fw={600}>Staff Members</Text>
                  </Group>
                  <Badge variant="light" color="green">
                    {supplierInfo.totalStaff} Staff
                  </Badge>
                </Group>
                
                <Stack gap="sm">
                  {staffMembers.map((staff) => (
                    <Paper
                      key={staff.id}
                      p="md"
                      radius="md"
                      className="border border-gray-100 hover:shadow-sm transition-all duration-200"
                    >
                      <Group justify="space-between">
                        <Group>
                          <Avatar
                            src={staff.avatar}
                            alt={staff.name}
                            size="md"
                            radius="xl"
                            className="bg-gradient-to-r from-green-400 to-green-600"
                          >
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {staff.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {staff.role}
                            </Text>
                          </div>
                        </Group>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          className="hover:scale-110 transition-transform"
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
          <Transition mounted={animateCards} transition="slide-left" duration={600} timingFunction="ease">
            {(styles) => (
              <Card style={styles} shadow="sm" padding="lg" radius="md" className="h-full">
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
                        gradient={{ from: '#3D6B2C', to: '#388E3C' }}
                      >
                        {supplierInfo.totalStaff}
                      </Badge>
                    </Group>
                  </Paper>
                </Stack>
              </Card>
            )}
          </Transition>
        </Grid.Col>
      </Grid>

      {/* Invite Staff Modal */}
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
          <TextInput
            label="Staff Name"
            placeholder="Enter full name"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            required
          />
          
          <TextInput
            label="Role"
            placeholder="e.g., Store Assistant, Manager"
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value)}
            required
          />
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteStaff}
              className="bg-gradient-to-r from-green-600 to-green-700"
              disabled={!newStaffName.trim() || !newStaffRole.trim()}
            >
              Send Invitation
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default SupplierDashboard;