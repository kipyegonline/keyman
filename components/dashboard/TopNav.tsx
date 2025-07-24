"use client";
import React from "react";
import {
  //Wrench,
  //Edit,
  //DollarSign,
  MapPin,
  //Share,
  LogOut,
} from "lucide-react";
import {
  Group,
  Title,
  ActionIcon,
  Avatar,
  Menu,
  UnstyledButton,
  Indicator,
  Flex,
  Box,
  Image,
  Text,
  Card,
  Divider,
} from "@mantine/core";
import { Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { useAppContext } from "@/providers/AppContext";
import { navigateTo } from "@/lib/helpers";
import { usePathname, useRouter } from "next/navigation";
import { logOutKeymanUser } from "@/api/registration";
import Link from "next/link";
import { CartButton } from "../supplier/priceList";
import { useCart } from "@/providers/CartContext";

export const checkDash = () => {
  const dashboard = globalThis?.window?.localStorage.getItem("dashboard");
  if (dashboard === null) return true;
  return dashboard === "dashboard";
};
const checkAuth = () => {
  return globalThis?.window?.localStorage.getItem("supplier_id");
};
const getLocalCart = () => {
  const cart = JSON.parse(
    globalThis?.window?.localStorage.getItem("cart") as string
  );

  return cart;
};
// Navigation Component
const TopNavigation: React.FC = () => {
  const {
    toggleDarkMode,
    darkMode: isDark,
    user,
    logOutUser,
    mainDashboard,
  } = useAppContext();
  const router = useRouter();

  //const isSupplierSide = checkDash();
  const pathname = usePathname();
  const { cart, setModalOpen } = useCart();
  const [ownsCart, setOwnsCart] = React.useState(false);
  React.useEffect(() => {
    const ownsCart = checkAuth() === getLocalCart()?.supplierId;
    setOwnsCart(ownsCart);
  }, []);
  const checkPath = () => {
    if (pathname.includes("price-list")) return true;
    else if (pathname.includes("dashboard/suppliers-near-me/")) return true;
    else return false;
  };

  const hasAccess = checkPath() && ownsCart;
  const profileMenuItems = [
    // { label: "Edit Profile", icon: Edit, key: "profile" },
    //{ label: "Hardware/Service Profile", icon: Wrench, key: "hardware" },
    //{ label: "Price List", icon: DollarSign, key: "price" },
    { label: "Delivery Locations", icon: MapPin, key: "delivery" },
    // { label: "Share", icon: Share, key: "share" },
    { label: "Logout", icon: LogOut, key: "logout" },
  ];
  const handleLogout = () => {
    logOutUser();
    // Implement logout logic here
    console.log("Logout clicked");

    navigateTo();
    // For example, you might clear user data and redirect to login page
    //window.location.href = '/account/login';
    router.push("/");
    logOutKeymanUser();
  };
  const handleClickedItem = (key: string) => {
    //create a switch statement for each key item from array
    switch (key) {
      case "profile":
        console.log("profile clicked");
        break;

      case "hardware":
        console.log("hardware clicked");
        break;

      case "price":
        //router.push("/keyman/dashboard/delivery")
        console.log("price clicked");
        break;

      case "delivery":
        router.push("/keyman/dashboard/delivery");
        console.log("delivery clicked");
        break;

      case "share":
        console.log("share clicked");
        break;

      case "logout":
        handleLogout();
        break;
      default:
        console.log("default clicked");
        break;
    }
  };

  const MobileNav = (
    <Flex>
      <Group display={{ base: "flex", lg: "none" }} align="center" className="">
        <Box>
          <Link href={mainDashboard ? "/keyman/dashboard" : "/keyman/supplier"}>
            <Image src="/keyman_logo.png" alt="logo" h={40} w={40} />
          </Link>
        </Box>
        <Box>
          {" "}
          <Text
            fw={700}
            size="xl"
            c={isDark ? "white" : "dark"}
            className=" text-transparent background-gradient from-orange-300 to-orange-500"
          >
            Keyman
          </Text>
        </Box>
      </Group>
    </Flex>
  );
  const PCMenu = (
    <Group display={{ base: "none", md: "flex" }} align="center" className="">
      <Link href="/keyman/dashboard">
        <Image src="/keyman_logo.png" alt="logo" h={40} w={40} />
      </Link>

      <Box>
        {" "}
        <Title
          order={2}
          c={isDark ? "white" : "dark"}
          className=" text-transparent background-gradient from-orange-300 to-orange-500"
        >
          Keyman
        </Title>
      </Box>
    </Group>
  );
  return (
    <nav
      style={{ height: 70, padding: 12 }}
      className={
        isDark
          ? "bg-gray-900 border-gray-700 border-b"
          : "bg-white border-gray-200 border-b shadow-lg  relative -top-2"
      }
    >
      <Flex style={{ height: "100%" }} justify={"space-between"} align="center">
        {PCMenu}
        {MobileNav}

        <Group>
          {/* Dark Mode Toggle */}
          <ActionIcon
            variant="subtle"
            display={"none"}
            onClick={toggleDarkMode}
            size="lg"
            className={isDark ? "hover:bg-gray-800 " : "hover:bg-gray-100"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </ActionIcon>
          {cart.itemCount > 0 && hasAccess && (
            <CartButton
              cart={cart}
              setCartModalOpened={() => setModalOpen(true)}
            />
          )}

          {/* Notifications */}
          <Indicator inline label={null} size={16}>
            <ActionIcon
              variant="subtle"
              size="lg"
              className={isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>

          {/* Profile Menu */}
          <Menu
            shadow="md"
            width={220}
            transitionProps={{ transition: "pop", duration: 150 }}
          >
            <Menu.Target>
              <UnstyledButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar
                  size="md"
                  src={user?.profile_photo_url}
                  className="bg-gradient-to-br from-[#F08C23] to-[#3D6B2C] font-bold"
                />

                <ChevronDown
                  size={16}
                  className={isDark ? "text-gray-300" : "text-gray-600"}
                />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <div className="py-1 flex  gap-x-2 justify-center">
                <p>Checkout</p>
                {cart.itemCount > 0 && hasAccess && (
                  <CartButton
                    cart={cart}
                    setCartModalOpened={() => setModalOpen(true)}
                  />
                )}
              </div>
              <Card>
                <Text size="xs" c="dimmed">
                  {user?.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.email}
                </Text>
              </Card>
              <Divider />

              {profileMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Menu.Item
                    onClick={() => handleClickedItem(item.key)}
                    key={index}
                    leftSection={<Icon size={16} />}
                    color={item.label === "Logout" ? "red" : undefined}
                  >
                    {item.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </nav>
  );
};
export default TopNavigation;
