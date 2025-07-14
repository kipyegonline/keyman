"use client";

import {
  LayoutDashboard,
  ClipboardList,
  Coins,
  LocateIcon,
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
import { User, X, Menu as MenuIcon, ShoppingCart } from "lucide-react";
import { Hammer } from "lucide-react";
import { useAppContext } from "@/providers/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "@/api/registration";
import React from "react";

type HardWare = {
  id: string;
  detail: { id: string; name: string };
  supplier_detail_id: string;
};

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
  const { data } = useQuery({ queryKey: ["user"], queryFn: getUserDetails });
  const isSupplier = data?.user?.roles.length > 0;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "suppliers-near-me", label: "Suppliers near me", icon: LocateIcon },
    { id: "keyman-coin", label: "My Keys", icon: Coins },

    //{ id: 'materials', label: 'Materials', icon: Package },
    //{ id: 'settings', label: 'Settings', icon: Settings },
  ];

  const becomeSupplier = {
    id: "supplier",
    label: "Become a supplier",
    icon: User,
  };
  const path = usePathname();
  React.useEffect(() => {
    const currentpath = path.split("/").at(-1);
    if (currentpath) {
      setActiveItem(currentpath);
    } else {
      setActiveItem("dashboard");
    }
  }, []);

  const handleSupplyRoute = () => {
    navigateTo();
    toggleDashboard();
    window.location.href = "/keyman/supplier/register";
    //router.push("/keyman/supplier/register");
  };
  const handleHardware = (hardware: HardWare) => {
    navigateTo();

    globalThis?.window?.localStorage.setItem(
      "supplier_id",
      hardware.supplier_detail_id
    );
    setActiveItem("dashboard");
    router.push(`/keyman/supplier`);
    toggleDashboard();
  };

  const handleItemClick = (id: string) => {
    if (id === activeItem) return;

    setActiveItem(id);
    // create switch for menuitems using id
    switch (id) {
      case "dashboard":
        navigateTo();
        router.push("/keyman/dashboard");
        break;
      case "orders":
        navigateTo();
        router.push("/keyman/dashboard/orders");

        break;
      case "requests":
        navigateTo();
        router.push("/keyman/dashboard/requests");

        break;
      case "suppliers-near-me":
        navigateTo();
        router.push("/keyman/dashboard/suppliers-near-me");
        break;
      case "keyman-coin":
        navigateTo();
        router.push("/keyman/dashboard/keyman-coin");
        break;
      case "supplier":
        handleSupplyRoute();
        break;
      default:
        break;
    }
    onToggle();
  };

  const hardwares = React.useMemo(() => {
    if (data && data.user) {
      return data?.user?.roles;
    } else {
      return [];
    }
  }, [data]);
  //console.log(data, "__user data__");
  return (
    <Box
      className={`
        transition-all duration-300 ease-in-out border-r-2 h-screen flex flex-col 
        ${
          isDark
            ? "bg-gray-900 border-gray-700"
            : "bg-keyman-green text-white border-gray-200"
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
              Dashboard
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
              <MenuItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isActive}
                handleItemClick={() => handleItemClick(item.id)}
                isDark={isDark}
                Icon={Icon}
              />
            );
          })}
          <hr />
          {!isSupplier ? (
            <MenuItem
              key={becomeSupplier.id}
              item={becomeSupplier}
              isCollapsed={isCollapsed}
              isActive={false}
              handleItemClick={() => handleItemClick(becomeSupplier.id)}
              isDark={isDark}
              Icon={becomeSupplier.icon}
            />
          ) : (
            hardwares.map((hardware: HardWare) => (
              <>
                <MenuItem
                  key={hardware.id}
                  item={{
                    label: hardware?.detail?.name,
                    id: hardware?.detail?.id,
                  }}
                  isCollapsed={isCollapsed}
                  isActive={false}
                  isDark={isDark}
                  Icon={User}
                  handleItemClick={() => handleHardware(hardware)}
                />
              </>
            ))
          )}
        </Stack>
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

type MenuItemprops = {
  isCollapsed: boolean;
  isActive: boolean;
  isDark: boolean;
  handleItemClick: () => void;
  Icon: React.FC<{ size: number; className?: string }>;
  item: {
    id: string;
    label: string;
  };
};

const MenuItem: React.FC<MenuItemprops> = ({
  item,
  isCollapsed,
  isActive,
  handleItemClick,
  isDark,
  Icon,
}) => {
  return (
    <Tooltip
      key={item.id}
      label={item.label}
      position="right"
      disabled={!isCollapsed}
    >
      <UnstyledButton
        p="xs"
        onClick={handleItemClick}
        className={`
                    w-full p-3 rounded-lg transition-all duration-200 flex items-center
                    ${
                      isActive
                        ? "!bg-keyman-orange !text-white !border-r-4 !border-[#3D6B2C]"
                        : `${
                            isDark
                              ? "!text-white hover:bg-gray-800"
                              : "text-gray-600 hover:bg-gray-50"
                          }`
                    }
                  `}
      >
        <Icon size={20} className={isCollapsed ? "mx-auto" : "mr-3"} />
        {!isCollapsed && (
          <Text size="md" fw={500}>
            {item.label}
          </Text>
        )}
      </UnstyledButton>
    </Tooltip>
  );
};
