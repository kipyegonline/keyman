"use client"
import React, { useState } from 'react';
import { Container ,Paper,TextInput,Button,Group,Card,Grid,Box,Title,Stack,Text,Badge,ActionIcon} from '@mantine/core';
import { ShoppingCart, ClipboardList, Coins, Package, Plus, CreditCard, Search, Brain, Bot} from 'lucide-react';
import { useAppContext } from '@/providers/AppContext';
// Main Content Component
const MainContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {darkMode:isDark}=useAppContext() 

  const stats = [
    { label: 'Active Orders', value: '24', icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Pending Requests', value: '12', icon: ClipboardList, color: '#F08C23' },
    { label: 'Token Balance', value: 'Ksh.15,240', icon: Coins, color: '#3D6B2C' },
    { label: 'Materials', value: '156', icon: Package, color: '#8b5cf6' },
  ];

  const recentOrders = [
    { id: 'ORD-001', item: 'Cement Bags (50kg)', quantity: '20', status: 'Delivered', date: '2 hours ago', color: 'green' },
    { id: 'ORD-002', item: 'Steel Rods (12mm)', quantity: '100', status: 'In Transit', date: '5 hours ago', color: 'blue' },
    { id: 'ORD-003', item: 'Bricks (Red Clay)', quantity: '500', status: 'Processing', date: '1 day ago', color: 'yellow' },
  ];

  return (
    <Container fluid p="xl" className={isDark ? 'bg-gray-900' : 'bg-gray-50 '}>
      {/* AI Search Bar */}
      <Paper p="lg" mb="xl" className="!shadow-lg max-w-[768px] mx-auto" >
        <TextInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder="Ask Keyman AI about materials, prices, or construction tips..."
          size="lg"
          radius="lg"
          leftSection={<Brain size={20} className="text-[#3D6B2C]" />}
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
          leftSection={<Plus size={20} />}
          className="bg-gradient-to-r from-[#F08C23] to-[#3D6B2C] hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Order Now
        </Button>
        <Button
          size="lg"
          variant="outline"
           leftSection={<CreditCard size={20} />}
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
            <Grid.Col key={index} span={{base:12,sm:6,lg:3}}>
              <Card
                shadow="sm"
                p="lg"
                className="hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Group >
                  <Box>
                    <Text size="sm" color="dimmed" fw={500}>
                      {stat.label}
                    </Text>
                    <Text size="xl" fw={700} mt={4}>
                      {stat.value}
                    </Text>
                  </Box>
                  <Box
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color }}
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
        <Grid.Col span={{base:12,lg:8}} >
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">Recent Orders</Title>
            <Stack gap="md">
              {recentOrders.map((order, index) => (
                <Paper
                  key={index}
                  p="md"
                  withBorder
                  className="hover:shadow-md transition-all duration-200"
                >
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text fw={600}>{order.item}</Text>
                      <Text size="sm" color="dimmed">
                        {order.id} • Qty: {order.quantity}
                      </Text>
                    </Box>
                    <Box style={{ textAlign: 'right' }}>
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
        <Grid.Col span={{base:12,lg:4}} >
          <Card shadow="sm" p="lg">
            <Title order={3} mb="md">Recommended for You</Title>
            <Stack gap="md">
              <Paper
                p="md"
                className="bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] text-white rounded-lg"
              >
                <Text fw={600} size="lg" mb={4}>Premium Cement</Text>
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
                <Text fw={600} size="lg" mb={4}>Steel Rods</Text>
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
        className="fixed bottom-2 right-0 bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50"
        variant="filled"
      >
        <Bot size={28} className="text-white" />
      </ActionIcon>
    
    </Container>
  );
};

export default MainContent;