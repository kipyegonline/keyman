"use client"
import { useState } from "react";
import { LayoutDashboard, ClipboardList, ShoppingCart, Coins, Package, Settings } from "lucide-react";
import { Group, Text, Box, ActionIcon, Avatar, UnstyledButton, Tooltip, Stack } from "@mantine/core";
import { User, X, Menu as MenuIcon } from "lucide-react";
import { Hammer } from "lucide-react";
import { useAppContext } from "@/providers/AppContext";

const Sidebar: React.FC<{ 
  isCollapsed: boolean; 
  onToggle: () => void; 
 
}> = ({ isCollapsed, onToggle }) => {
  const [activeItem, setActiveItem] = useState('dashboard');
const {user,darkMode:isDark}=useAppContext()
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Box
      className={`
        transition-all duration-300 ease-in-out border-r-2 h-screen flex flex-col 
        ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-keyman-green text-white border-gray-200'}
      `}
      style={{ width: isCollapsed ? 70 : 280 }}
      p="md"
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        {!isCollapsed && (
          <Group gap="sm">
            <Box className="w-10 h-10 bg-gradient-to-br from-[#3D6B2C] to-[#388E3C] rounded-lg flex items-center justify-center">
              <Hammer className="w-6 h-6 text-white" />
            </Box>
            <Text size="xl" fw={700} c={isDark ? 'white' : 'white'}>
              Dashboard
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

      {/* Menu Items */}
      <Box mt="md" style={{ flex: 1 }}>
        <Stack gap="xs">
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
                    <Text size="md" fw={500}>{item.label}</Text>
                  )}
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      {/* User Profile */}
      <Box className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <Group gap="sm">
            
          <Avatar
            size="md"
            className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C]"
          >
            <User size={20} className="text-white" />
          </Avatar>
          {!isCollapsed && (
            <Box>
              <Text size="sm" fw={600} c={isDark ? 'white' : 'white'}>
                {user?.name}
              </Text>
              <Text size="xs" className="capitalize" c="dimmed">
                {user?.is_supplier}
                
              </Text>
            </Box>
          )}
        </Group>
      </Box>
    </Box>
  );
};


export default Sidebar;