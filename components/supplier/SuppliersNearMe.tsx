import React, { useState, useEffect } from "react";
import {
  TextInput,
  Badge,
  Group,
  Text,
  Button,
  Stack,
  Container,
  Grid,
  Loader,
  ActionIcon,
  Transition,
  Paper,
  Alert,
  Box,
  Pagination,
  Title,
} from "@mantine/core";
import { Search, MapPin, Filter, Navigation, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuppliersNearMe } from "@/api/requests";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/lib/helpers";
import { useAppContext } from "@/providers/AppContext";
import {
  GoodsCard,
  ServicesCard,
  ProfessionalServicesCard,
  MasterCard,
  ISupplierContact,
} from "./profiles";

const SuppliersNearMe: React.FC<{
  url?: string;
  initialSearchQuery?: string;
}> = ({
  url = `/keyman/dashboard/suppliers-near-me/`,
  initialSearchQuery = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useExtendedSearch, setUseExtendedSearch] = useState(false);
  const { setActiveItem } = useAppContext();
  //getSuppliersNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0)
  const {
    data: _suppliers,
    isLoading,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: ["suppliers_near_me"],
    queryFn: async () =>
      getSuppliersNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0),
    enabled: !!userLocation && !useExtendedSearch,
  });
  //console.log(_suppliers, "suppliers near me");
  // Extended search query with 400km distance
  const {
    data: _extendedSuppliers,
    isLoading: isExtendedLoading,
    refetch: refetchExtendedSuppliers,
  } = useQuery({
    queryKey: ["suppliers_near_me_extended", 4000000],
    queryFn: async () =>
      getSuppliersNearMe(
        userLocation?.lat ?? 0,
        userLocation?.lng ?? 0,
        400000
      ),
    enabled: !!userLocation && useExtendedSearch,
  });
  const router = useRouter();

  // Retry fetching suppliers
  const handleRetryFetch = () => {
    setLocationError(null);
    if (useExtendedSearch) {
      refetchExtendedSuppliers();
    } else {
      refetchSuppliers();
    }
  };

  // Update search query when initialSearchQuery prop changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const currentSuppliers = useExtendedSearch ? _extendedSuppliers : _suppliers;
  const currentLoading = useExtendedSearch ? isExtendedLoading : isLoading;
  const filteredSuppliers: ISupplierContact[] = React.useMemo(() => {
    if (searchQuery.trim())
      return currentSuppliers?.suppliers?.filter(
        (supplier: ISupplierContact) =>
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.keyman_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (supplier.comments !== null &&
            supplier.comments.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    if (currentSuppliers?.suppliers) return currentSuppliers?.suppliers;
    else return [];
  }, [currentSuppliers, searchQuery]);
  //console.log("filteredSuppliers", filteredSuppliers);
  // Get user location on component mount
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.log(error);
          setLocationError(
            "Unable to retrieve your location. Try again later."
          );
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    };

    getCurrentLocation();
  }, []);
  /*
  // Filter suppliers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.keyman_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
       const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };
  }, [searchQuery, suppliers]);*/
  //console.log("filteredSuppliers", filteredSuppliers);
  const handleStartKeyContract = (supplier: ISupplierContact) => () => {
    //console.log("Starting KeyContract with:", supplier);
    navigateTo();
    setActiveItem("key-contract");
    router.push(
      `/keyman/dashboard/key-contract/create?keyman_id=${supplier.id}`
    );
  };
  const perPage = 25,
    total = Math.ceil(filteredSuppliers?.length / perPage);
  const [current, setCurrent] = useState(0);
  const startIndex = current * perPage;
  const endIndex = startIndex + perPage;
  const paginatedSuppliers = filteredSuppliers?.slice(startIndex, endIndex);
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleRequestQuote = (supplier: ISupplierContact) => {
    // Placeholder for quote request functionality
    console.log("Requesting quote from:", supplier.name);
  };

  if (loading || currentLoading) {
    return (
      <Container size="lg" py="xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader size="lg" style={{ color: "#3D6B2C" }} />
          <Text size="lg" c="dimmed">
            Finding suppliers near you...
          </Text>
          <Text size="sm" c="dimmed">
            Getting your location to show the best options
          </Text>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Stack gap="xl">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <Group justify="center" gap="xs">
            <Navigation size={32} style={{ color: "#3D6B2C" }} />
            <Text
              size="xl"
              fw={700}
              style={{
                color: "#3D6B2C",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              Suppliers Near You
            </Text>
          </Group>
          <Text size="lg" c="dimmed" className="hidden md:block">
            Connect with trusted construction suppliers in your area
          </Text>
        </div>

        {/* Introductory Section */}
        <Paper
          p="xl"
          radius="md"
          withBorder
          display={{ base: "none", md: "block" }}
          style={{ borderColor: "#3D6B2C20" }}
        >
          <Stack gap="md">
            <Title
              order={2}
              style={{
                color: "#3D6B2C",
                fontSize: "1.75rem",
                fontWeight: 600,
              }}
            >
              {`You've got the right stores — now trade the right way.`}
            </Title>
            <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
              Find a store → Create a contract → Escrow holds your money →
              Delivery → Release.
            </Text>
            <Text
              size="md"
              style={{
                fontStyle: "italic",
                color: "#3D6B2C",
                fontWeight: 500,
              }}
            >
              Here, trust is the currency.
            </Text>
          </Stack>
        </Paper>
        <Paper
          p="sm"
          radius="md"
          withBorder
          style={{ borderColor: "#3D6B2C20" }}
          display={{ md: "none" }}
        >
          <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
            Find a store → Create a contract → Escrow holds your money →
            Delivery → Release.
          </Text>
          <Text
            size="md"
            style={{
              fontStyle: "italic",
              color: "#3D6B2C",
              fontWeight: 500,
            }}
          >
            Here, trust is the currency.
          </Text>
        </Paper>

        {/* Location Alert */}
        {locationError && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Location Notice"
            color="orange"
            variant="light"
          >
            {locationError}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper
          shadow="sm"
          p="md"
          radius="lg"
          style={{ border: "1px solid #E5E7EB" }}
        >
          <Group gap="md">
            <TextInput
              placeholder="Search suppliers by name, email, or keyman number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<Search size={20} style={{ color: "#6B7280" }} />}
              size="lg"
              radius="md"
              style={{ flex: 1 }}
              styles={{
                input: {
                  borderColor: "#D1D5DB",
                  "&:focus": {
                    borderColor: "#3D6B2C",
                  },
                },
              }}
            />
            <ActionIcon
              size="lg"
              radius="md"
              style={{ backgroundColor: "#3D6B2C" }}
              onClick={() => {
                /* Filter functionality */
              }}
            >
              <Filter size={20} color="white" />
            </ActionIcon>
          </Group>
        </Paper>

        {/* Results Counter */}
        <Group justify="space-between" align="center">
          <Text size="md" c="dimmed">
            {filteredSuppliers.length} supplier
            {filteredSuppliers.length !== 1 ? "s" : ""} found
          </Text>
          {userLocation && (
            <Group gap="xs">
              <Badge
                color="green"
                variant="light"
                leftSection={<MapPin size={14} />}
                size="lg"
              >
                Location-based results
              </Badge>
              <Badge
                color="orange"
                variant="light"
                leftSection={<Navigation size={14} />}
                size="lg"
                style={{ cursor: "pointer" }}
                onClick={() => setUseExtendedSearch(!useExtendedSearch)}
              >
                {useExtendedSearch ? "Viewing all stores" : "View All stores"}
              </Badge>
            </Group>
          )}
        </Group>

        {/* Suppliers Grid */}
        <Grid>
          {paginatedSuppliers.map((supplier, index: number) => (
            <Grid.Col key={supplier.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Transition
                mounted={true}
                transition="slide-up"
                duration={300}
                timingFunction="ease"
                exitDuration={200}
              >
                {(styles) => {
                  // Determine supplier type with fallback to 'goods'
                  const supplierType = supplier.type || "goods";

                  const cardProps = {
                    supplier,
                    url,
                    styles,
                    index,
                    onStartKeyContract: handleStartKeyContract,
                    onCall: handleCall,
                    onRequestQuote: handleRequestQuote,
                  };

                  switch (supplierType) {
                    case "services":
                      return <ServicesCard {...cardProps} />;
                    case "professional_services":
                      return <ProfessionalServicesCard {...cardProps} />;
                    case "master":
                      return <MasterCard {...cardProps} />;
                    case "goods":
                    default:
                      return <GoodsCard {...cardProps} />;
                  }
                }}
              </Transition>
            </Grid.Col>
          ))}
        </Grid>
        <Box my="md">
          {filteredSuppliers.length > perPage && (
            <Pagination
              total={total}
              onChange={(num) => {
                setCurrent(num - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              value={current + 1}
            />
          )}
        </Box>

        {/* No Results State */}
        {filteredSuppliers.length === 0 && !loading && (
          <Paper
            p="xl"
            radius="lg"
            ta="center"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <Stack gap="md" align="center">
              <Search size={48} style={{ color: "#D1D5DB" }} />
              <Text size="lg" fw={500} c="dimmed">
                No suppliers found
              </Text>
              <Text size="sm" c="dimmed">
                Try adjusting your search terms or check back later
              </Text>
              <Group gap="sm">
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  style={{ borderColor: "#3D6B2C", color: "#3D6B2C" }}
                >
                  Clear Search
                </Button>
                <Button
                  variant="filled"
                  onClick={handleRetryFetch}
                  style={{ backgroundColor: "#3D6B2C" }}
                  leftSection={<Navigation size={16} />}
                >
                  Retry Location
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default SuppliersNearMe;
