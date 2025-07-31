import React, { useState } from "react";
import {
  Modal,
  Button,
  Group,
  Text,
  Container,
  Transition,
  Badge,
  Card,
  Avatar,
  Stack,
  //ActionIcon,
  Loader,
} from "@mantine/core";
import {
  MapPin,
  Search,
  Truck,
  Hammer,
  Wrench,
  Users,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  responseTime: string;
  avatar: string;
  specialties: string[];
  verified: boolean;
}

const SuppliersNearMeCTA: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locationGranted, setLocationGranted] = useState(false);

  // Mock suppliers data
  const mockSuppliers: Supplier[] = [
    {
      id: "1",
      name: "BuildMart Kenya",
      category: "Construction Materials",
      rating: 4.8,
      distance: "1.2 km",
      responseTime: "< 30 min",
      avatar: "🏗️",
      specialties: ["Cement", "Steel", "Hardware"],
      verified: true,
    },
    {
      id: "2",
      name: "Professional Contractors Ltd",
      category: "Professional Services",
      rating: 4.9,
      distance: "2.1 km",
      responseTime: "< 45 min",
      avatar: "👷",
      specialties: ["Plumbing", "Electrical", "Masonry"],
      verified: true,
    },
    {
      id: "3",
      name: "Heavy Equipment Rentals",
      category: "Equipment & Machinery",
      rating: 4.7,
      distance: "3.5 km",
      responseTime: "< 1 hour",
      avatar: "🚜",
      specialties: ["Excavators", "Cranes", "Trucks"],
      verified: false,
    },
    {
      id: "4",
      name: "Nairobi Tools & Hardware",
      category: "Tools & Hardware",
      rating: 4.6,
      distance: "0.8 km",
      responseTime: "< 20 min",
      avatar: "🔧",
      specialties: ["Power Tools", "Hand Tools", "Safety Gear"],
      verified: true,
    },
  ];

  const handleLocationRequest = async () => {
    setLoading(true);

    // Simulate location request and API call
    setTimeout(() => {
      setLocationGranted(true);
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Construction Materials":
        return <Hammer size={20} />;
      case "Professional Services":
        return <Users size={20} />;
      case "Equipment & Machinery":
        return <Truck size={20} />;
      case "Tools & Hardware":
        return <Wrench size={20} />;
      default:
        return <MapPin size={20} />;
    }
  };
  const router = useRouter();
  const handleSupplier = () => {
    navigateTo();
    router.push("/suppliers-near-me");
  };
  return (
    <>
      {/* Main CTA Button */}
      <div className="relative flex justify-center items-center py-16">
        <div
          className={`relative group cursor-pointer transition-all duration-700 transform ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          //onClick={() => setOpened(true)}
        >
          {/* Animated background rings */}
          <div className="absolute inset-0 -m-4">
            <div
              className={`absolute inset-0 rounded-full bg-[#3D6B2C] opacity-20 transition-all duration-1000 ${
                isHovered ? "scale-150 opacity-10" : "scale-100"
              }`}
            />
            <div
              className={`absolute inset-0 rounded-full bg-[#F08C23] opacity-15 transition-all duration-700 delay-200 ${
                isHovered ? "scale-125 opacity-5" : "scale-100"
              }`}
            />
          </div>

          {/* Main CTA Card */}
          <Card
            className={`relative z-10 bg-gradient-to-br from-white to-gray-50 border-2 transition-all duration-500 ${
              isHovered
                ? "border-[#3D6B2C] shadow-2xl"
                : "border-gray-200 shadow-lg"
            }`}
            style={{
              width: "400px",
              borderRadius: "24px",
              transform: isHovered ? "translateY(-8px)" : "translateY(0)",
            }}
          >
            <div className="p-8 text-center">
              {/* Animated Icon */}
              <div className="relative mb-6">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#3D6B2C] to-[#4A7C38] transition-all duration-500 ${
                    isHovered ? "transform rotate-12 scale-110" : ""
                  }`}
                >
                  <MapPin
                    size={32}
                    className={`text-white transition-all duration-300 ${
                      isHovered ? "transform scale-125" : ""
                    }`}
                  />
                </div>

                {/* Floating badges */}
                <div
                  className={`absolute -top-2 -right-2 transition-all duration-500 ${
                    isHovered ? "transform translate-x-2 -translate-y-2" : ""
                  }`}
                >
                  <Badge
                    color="orange"
                    variant="filled"
                    className="animate-pulse"
                    style={{ backgroundColor: "#F08C23" }}
                  >
                    Live
                  </Badge>
                </div>
              </div>

              {/* Main Text */}
              <Text
                size="xl"
                className={`font-bold text-gray-800 mb-3 transition-all duration-300 ${
                  isHovered ? "transform scale-105" : ""
                }`}
              >
                Find Suppliers Near You
              </Text>

              <Text size="sm" color="dimmed" className="mb-6 leading-relaxed">
                Discover verified construction suppliers, professionals, and
                equipment rentals in your area. Get instant quotes and build
                faster.
              </Text>

              {/* Action Button */}
              <Button
                size="lg"
                className={`relative overflow-hidden transition-all duration-300 ${
                  isHovered ? "transform scale-105" : ""
                }`}
                style={{
                  backgroundColor: "#3D6B2C",
                  border: "none",
                }}
                rightSection={
                  <ArrowRight
                    size={18}
                    className={`transition-transform duration-300 ${
                      isHovered ? "transform translate-x-1" : ""
                    }`}
                  />
                }
                onClick={handleSupplier}
              >
                <span className="relative z-10">Explore Suppliers</span>
                <div
                  className={`absolute inset-0 bg-[#F08C23] transition-all duration-500 ${
                    isHovered ? "translate-x-0" : "translate-x-full"
                  }`}
                />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setLocationGranted(false);
          setSuppliers([]);
        }}
        title={
          <Group>
            <MapPin size={24} style={{ color: "#3D6B2C" }} />
            <Text size="lg" className="font-semibold">
              Suppliers Near You
            </Text>
          </Group>
        }
        size="lg"
        centered
        styles={{
          // modal: { borderRadius: "16px" },
          header: { borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" },
        }}
      >
        <Container size="100%" p={0}>
          {!locationGranted ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#3D6B2C] to-[#4A7C38] mb-4">
                  <Search size={24} className="text-white" />
                </div>
                <Text size="lg" className="font-semibold mb-2">
                  Allow Location Access
                </Text>
                <Text size="sm" color="dimmed" className="max-w-md mx-auto">
                  We need your location to show you the most relevant suppliers
                  and service providers in your area.
                </Text>
              </div>

              <Button
                size="md"
                loading={loading}
                onClick={handleLocationRequest}
                style={{ backgroundColor: "#3D6B2C" }}
                leftSection={
                  loading ? <Loader size="sm" /> : <MapPin size={18} />
                }
              >
                {loading ? "Finding Suppliers..." : "Find Suppliers Near Me"}
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-green-200">
                <Group>
                  <CheckCircle size={20} style={{ color: "#3D6B2C" }} />
                  <Text size="sm" className="font-medium">
                    Found {suppliers.length} suppliers within 5km of your
                    location
                  </Text>
                </Group>
              </div>

              <Stack gap="md">
                {suppliers.map((supplier, index) => (
                  <Transition
                    key={supplier.id}
                    mounted={true}
                    transition="slide-up"
                    duration={300}
                    timingFunction="ease"
                    //  style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {(styles) => (
                      <Card
                        style={{
                          ...styles,
                          transitionDelay: `${index * 100}ms`,
                        }}
                        className="hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-[#3D6B2C] cursor-pointer"
                        onClick={() => {
                          // Handle supplier selection
                          console.log("Selected supplier:", supplier.name);
                        }}
                      >
                        <Group className="justify-between">
                          <Group>
                            <Avatar
                              size="lg"
                              className="bg-gradient-to-br from-[#3D6B2C] to-[#4A7C38]"
                            >
                              {supplier.avatar}
                            </Avatar>

                            <div>
                              <Group gap="xs" align="center">
                                <Text className="font-semibold">
                                  {supplier.name}
                                </Text>
                                {supplier.verified && (
                                  <CheckCircle
                                    size={16}
                                    style={{ color: "#3D6B2C" }}
                                  />
                                )}
                              </Group>

                              <Group gap="xs" align="center" className="mt-1">
                                {getCategoryIcon(supplier.category)}
                                <Text size="sm" color="dimmed">
                                  {supplier.category}
                                </Text>
                              </Group>

                              <Group gap="md" className="mt-2">
                                <Group gap="xs">
                                  <Star
                                    size={14}
                                    style={{ color: "#F08C23" }}
                                  />
                                  <Text size="sm">{supplier.rating}</Text>
                                </Group>

                                <Group gap="xs">
                                  <MapPin
                                    size={14}
                                    style={{ color: "#3D6B2C" }}
                                  />
                                  <Text size="sm">{supplier.distance}</Text>
                                </Group>

                                <Group gap="xs">
                                  <Clock
                                    size={14}
                                    style={{ color: "#6B7280" }}
                                  />
                                  <Text size="sm">{supplier.responseTime}</Text>
                                </Group>
                              </Group>
                            </div>
                          </Group>

                          <ArrowRight size={20} className="text-[#3D6B2C]" />
                        </Group>

                        <Group gap="xs" className="mt-3">
                          {supplier.specialties
                            .slice(0, 3)
                            .map((specialty, idx) => (
                              <Badge
                                key={idx}
                                size="sm"
                                variant="light"
                                style={{
                                  backgroundColor: "#3D6B2C20",
                                  color: "#3D6B2C",
                                }}
                              >
                                {specialty}
                              </Badge>
                            ))}
                        </Group>
                      </Card>
                    )}
                  </Transition>
                ))}
              </Stack>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  style={{ borderColor: "#3D6B2C", color: "#3D6B2C" }}
                  className="hover:bg-[#3D6B2C] hover:text-white"
                >
                  View All Suppliers
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Modal>
    </>
  );
};

export default SuppliersNearMeCTA;
