"use client";

import {
  LayoutDashboard,
  ClipboardList,
  ShoppingCart,
  //Settings,
  DiamondPercent,
  ReceiptText,
  Factory,
} from "lucide-react";
import {
  Group,
  Text,
  Box,
  ActionIcon,
  Avatar,
  UnstyledButton,
  Tooltip,
  Stack,
} from "@mantine/core";
import { User, X, Menu as MenuIcon, ArrowLeftRight } from "lucide-react";
import { Hammer } from "lucide-react";
import { useAppContext } from "@/providers/AppContext";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";
//import { useQuery } from "@tanstack/react-query";
//import { getUserDetails } from "@/api/registration";

const Sidebar: React.FC<{
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ isCollapsed, onToggle }) => {
  const {
    user,
    darkMode: isDark,
    activeItem,
    setActiveItem,
    toggleDashboard,
  } = useAppContext();
  const router = useRouter();
  //const {data}=useQuery({queryKey:["user"],queryFn:getUserDetails})

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "requests", label: "Requests near me", icon: ClipboardList },
    { id: "factories", label: "Factories near me", icon: Factory },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "key-contract", label: "My Deals", icon: ReceiptText },
    //{ id: "key-wallet", label: "My Wallet", icon: Wallet },
    { id: "price", label: "Manage my store", icon: DiamondPercent },
    //{ id: "update", label: "Update profile", icon: Settings },
  ];
  const handleSupplyRoute = () => {
    navigateTo();
    toggleDashboard();
    router.push("/keyman/dashboard");
    location.href = "/keyman/dashboard";
  };
  const handleItemClick = (id: string) => {
    if (id === activeItem) return;

    setActiveItem(id);
    // create switch for menuitems using id
    switch (id) {
      case "dashboard":
        navigateTo();
        router.push("/keyman/supplier");
        break;
      case "requests":
        navigateTo();
        router.push("/keyman/supplier/requests");
        break;
      case "factories":
        navigateTo();
        router.push("/keyman/supplier/factories-near-me");
        break;
      case "orders":
        navigateTo();
        router.push("/keyman/supplier/orders");
        break;
      case "update":
        navigateTo();
        router.push("/keyman/supplier/update-profile");
        break;
      case "price":
        navigateTo();
        router.push("/keyman/supplier/price-list");

        break;
      case "customer":
        handleSupplyRoute();
        break;
      case "key-contract":
        navigateTo();
        router.push("/keyman/supplier/key-contract");
        break;
      case "key-wallet":
        navigateTo();
        router.push("/keyman/dashboard/key-wallet");
        break;
      default:
        break;
    }
    onToggle();
  };

  return (
    <Box
      className={`
        transition-all duration-300 ease-in-out border-r-2 h-screen flex flex-col 
        ${
          isDark
            ? "bg-gray-900 border-gray-700"
            : "bg-keyman-orange text-white border-gray-200"
        }
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
            <Text size="xl" fw={700} c={isDark ? "white" : "white"}>
              {"Store profile"}
            </Text>
          </Group>
        )}
        <ActionIcon
          variant="subtle"
          onClick={onToggle}
          size="lg"
          className={isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}
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
                  p="xs"
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 flex items-center
                    ${
                      isActive
                        ? "!bg-keyman-green !text-white !border-r-4 !border-[#3D6B2C]"
                        : `${
                            isDark
                              ? "!text-white hover:bg-gray-800"
                              : "text-gray-600 hover:bg-gray-50"
                          }`
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={isCollapsed ? "mx-auto" : "mr-3"}
                  />
                  {!isCollapsed && (
                    <Text size="md" fw={500}>
                      {item.label}
                    </Text>
                  )}
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      {/* Profile Switcher */}
      <Box mb="sm">
        <hr
          className={`border-0 border-t mb-3 ${
            isDark ? "border-t-gray-700" : "border-t-white/30"
          }`}
        />
        <Tooltip
          label="Switch to Personal Profile"
          position="right"
          disabled={!isCollapsed}
        >
          <UnstyledButton
            onClick={handleSupplyRoute}
            className="w-full rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #1e3a12 0%, #14290d 100%)"
                : "linear-gradient(135deg, #3D6B2C 0%, #295219 100%)",
              border: "2px solid rgba(255,255,255,0.25)",
              boxShadow: "0 4px 14px rgba(61, 107, 44, 0.4)",
            }}
          >
            <Box p="xs" className="flex items-center gap-2">
              <Box className="relative flex-shrink-0">
                <Box
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <User size={16} className="text-white" />
                </Box>
                <Box
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: "#F08C23",
                    boxShadow: "0 0 6px rgba(240, 140, 35, 0.8)",
                  }}
                >
                  <ArrowLeftRight size={8} className="text-white" />
                </Box>
              </Box>
              {!isCollapsed && (
                <Box className="flex-1 min-w-0">
                  <Text size="xs" c="rgba(255,255,255,0.75)" fw={500}>
                    Switch to
                  </Text>
                  <Text size="sm" fw={700} c="white">
                    Personal Profile
                  </Text>
                </Box>
              )}
            </Box>
          </UnstyledButton>
        </Tooltip>
      </Box>

      {/* User Profile */}
      <Box
        className={`pt-4 border-t ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <Group gap="sm">
          <Avatar
            size="md"
            className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C]"
          >
            <User size={20} className="text-white" />
          </Avatar>
          {!isCollapsed && (
            <Box>
              <Text size="sm" fw={600} c={isDark ? "white" : "white"}>
                {user?.name}
              </Text>
              <Text size="xs" className="capitalize">
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
