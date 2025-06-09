"use client"
import React, { useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Text,
  Group,
  ActionIcon,
  Avatar,
  Menu,
  Button,
  TextInput,
  Card,
  Grid,
  Badge,
  Stack,
  Container,
  Title,
  UnstyledButton,
  Tooltip,
  Paper,
  RingProgress,
  Center,
  Box,
  Indicator,
  Divider,
  Flex
} from '@mantine/core';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  Coins,
  Settings,
  Menu as MenuIcon,
  X,
  Search,
  Bell,
  User,
  Edit,
  Wrench,
  DollarSign,
  MapPin,
  Share,
  LogOut,
  Bot,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  
  Package,
  CreditCard,
  Brain,
  Hammer
} from 'lucide-react';

// Sidebar Component
const Sidebar: React.FC<{ 
  isCollapsed: boolean; 
  onToggle: () => void; 
  isDark: boolean;
}> = ({ isCollapsed, onToggle, isDark }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Navbar
      width={{ base: isCollapsed ? 70 : 280 }}
      p="md"
      className={`
        transition-all duration-300 ease-in-out border-r-2
        ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
      `}
    >
      {/* Header */}
      <Navbar.Section>
        <Group position="apart" mb="md">
          {!isCollapsed && (
            <Group spacing="sm">
              <Box className="w-10 h-10 bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] rounded-lg flex items-center justify-center">
                <Hammer className="w-6 h-6 text-white" />
              </Box>
              <Text size="xl" weight={700} color={isDark ? 'white' : 'dark'}>
                Keyman
              </Text>
            </Group>
          )}
          <ActionIcon
            variant="subtle"
            onClick={onToggle}
            size="lg"
            className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            {isCollapsed ? <MenuIcon size={20} /> : <X size={20} />}
          </ActionIcon>
        </Group>
      </Navbar.Section>

      {/* Menu Items */}
      <Navbar.Section grow mt="md">
        <Stack spacing="xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <Tooltip
                key={item.id}
                label={item.label}
                position="right"
                disabled={!isCollapsed}
              >
                <UnstyledButton
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 flex items-center
                    ${isActive 
                      ? 'bg-[#3D6B2C]/10 text-[#3D6B2C] border-r-4 border-[#3D6B2C]'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`
                    }
                  `}
                >
                  <Icon size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                  {!isCollapsed && (
                    <Text size="md" weight={500}>{item.label}</Text>
                  )}
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Navbar.Section>

      {/* User Profile */}
      <Navbar.Section>
        <Box className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Group spacing="sm">
            <Avatar
              size="md"
              className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C]"
            >
              <User size={20} className="text-white" />
            </Avatar>
            {!isCollapsed && (
              <Box>
                <Text size="sm" weight={600} color={isDark ? 'white' : 'dark'}>
                  John Builder
                </Text>
                <Text size="xs" color="dimmed">
                  Contractor
                </Text>
              </Box>
            )}
          </Group>
        </Box>
      </Navbar.Section>
    </Navbar>
  );
};

// Navigation Component
const Navigation: React.FC<{ 
  isDark: boolean; 
  onToggleDark: () => void; 
}> = ({ isDark, onToggleDark }) => {
  const profileMenuItems = [
    { label: 'Edit Profile', icon: Edit },
    { label: 'Hardware/Service Profile', icon: Wrench },
    { label: 'Price List', icon: DollarSign },
    { label: 'Delivery Locations', icon: MapPin },
    { label: 'Share', icon: Share },
    { label: 'Logout', icon: LogOut },
  ];

  return (
    <Header height={70} p="md" className={isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}>
      <Group position="apart" sx={{ height: '100%' }}>
        <Title order={2} color={isDark ? 'white' : 'dark'}>
          Keyman Dashboard
        </Title>

        <Group spacing="md">
          {/* Dark Mode Toggle */}
          <ActionIcon
            variant="subtle"
            onClick={onToggleDark}
            size="lg"
            className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </ActionIcon>

          {/* Notifications */}
          <Indicator inline label="3" size={16}>
            <ActionIcon
              variant="subtle"
              size="lg"
              className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>

          {/* Profile Menu */}
          <Menu shadow="md" width={220}>
            <Menu.Target>
              <UnstyledButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar
                  size="sm"
                  className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C]"
                >
                  <User size={16} className="text-white" />
                </Avatar>
                <ChevronDown size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              {profileMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Menu.Item
                    key={index}
                    icon={<Icon size={16} />}
                    color={item.label === 'Logout' ? 'red' : undefined}
                  >
                    {item.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Header>
  );
};

// Main Content Component
const MainContent: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Active Orders', value: '24', icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Pending Requests', value: '12', icon: ClipboardList, color: '#F08C23' },
    { label: 'Token Balance', value: '₹15,240', icon: Coins, color: '#3D6B2C' },
    { label: 'Materials', value: '156', icon: Package, color: '#8b5cf6' },
  ];

  const recentOrders = [
    { id: 'ORD-001', item: 'Cement Bags (50kg)', quantity: '20', status: 'Delivered', date: '2 hours ago', color: 'green' },
    { id: 'ORD-002', item: 'Steel Rods (12mm)', quantity: '100', status: 'In Transit', date: '5 hours ago', color: 'blue' },
    { id: 'ORD-003', item: 'Bricks (Red Clay)', quantity: '500', status: 'Processing', date: '1 day ago', color: 'yellow' },
  ];

  return (
    <Container fluid p="xl" className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
      {/* AI Search Bar */}
      <Paper p="lg" mb="xl" className="shadow-lg">
        <TextInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder="Ask Keyman AI about materials, prices, or construction tips..."
          size="lg"
          icon={<Brain size={20} className="text-[#3D6B2C]" />}
          rightSection={
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] hover:shadow-lg transition-all duration-200"
            >
              <Search size={18} />
            </Button>
          }
          styles={{
            input: {
              borderColor: '#3D6B2C',
              '&:focus': {
                borderColor: '#3D6B2C',
              },
            },
          }}
        />
      </Paper>

      {/* Quick Actions */}
      <Group mb="xl">
        <Button
          size="lg"
          leftIcon={<Plus size={20} />}
          className="bg-gradient-to-r from-[#F08C23] to-[#3D6B2C] hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Order Now
        </Button>
        <Button
          size="lg"
          variant="outline"
          leftIcon={<CreditCard size={20} />}
          color="gray"
          className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Top Up Tokens
        </Button>
      </Group>

      {/* Stats Grid */}
      <Grid mb="xl">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid.Col key={index} span={12} sm={6} lg={3}>
              <Card
                shadow="sm"
                p="lg"
                className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Group position="apart">
                  <Box>
                    <Text size="sm" color="dimmed" weight={500}>
                      {stat.label}
                    </Text>
                    <Text size="xl" weight={700} mt={4}>
                      {stat.value}
                    </Text>
                  </Box>
                  <Box
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    sx={{ backgroundColor: stat.color }}
                  >
                    <Icon size={24} className="text-white" />
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {/* Main Content Grid */}
      <Grid>
        {/* Recent Orders */}
        <Grid.Col span={12} lg={8}>
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">Recent Orders</Title>
            <Stack spacing="md">
              {recentOrders.map((order, index) => (
                <Paper
                  key={index}
                  p="md"
                  withBorder
                  className="hover:shadow-md transition-all duration-200"
                >
                  <Group position="apart">
                    <Box>
                      <Text weight={600}>{order.item}</Text>
                      <Text size="sm" color="dimmed">
                        {order.id} • Qty: {order.quantity}
                      </Text>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Badge color={order.color} variant="light" mb={4}>
                        {order.status}
                      </Badge>
                      <Text size="sm" color="dimmed">
                        {order.date}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Ads Section */}
        <Grid.Col span={12} lg={4}>
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">Recommended for You</Title>
            <Stack spacing="md">
              <Paper
                p="md"
                className="bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] text-white rounded-lg"
              >
                <Text weight={600} size="lg" mb={4}>Premium Cement</Text>
                <Text size="sm" mb="md" opacity={0.9}>
                  50% off on bulk orders
                </Text>
                <Button size="xs" variant="white" color="dark">
                  View Deal
                </Button>
              </Paper>
              
              <Paper
                p="md"
                className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C] text-white rounded-lg"
              >
                <Text weight={600} size="lg" mb={4}>Steel Rods</Text>
                <Text size="sm" mb="md" opacity={0.9}>
                  Quality assured materials
                </Text>
                <Button size="xs" variant="white" color="dark">
                  Order Now
                </Button>
              </Paper>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Floating AI Chat Button */}
      <ActionIcon
        size={60}
        radius="xl"
        className="fixed bottom-6 right-6 bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50"
        variant="filled"
      >
        <Bot size={28} className="text-white" />
      </ActionIcon>
    </Container>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <AppShell
      padding={0}
      navbar={
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isDark={isDark}
        />
      }
      header={
        <Navigation 
          isDark={isDark} 
          onToggleDark={() => setIsDark(!isDark)}
        />
      }
      styles={(theme) => ({
        main: {
          backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
          minHeight: '100vh',
        },
      })}
    >
      <MainContent isDark={isDark} />
    </AppShell>
  );
};

export default Dashboard;