"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Stack,
  Group,
  Button,
  Title,
  Text,
  Paper,
  Box,
  TextInput,
  Badge,
  Avatar,
  Loader,
  Alert,
  Grid,
  Pagination,
  ActionIcon,
  Transition,
} from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  BadgeCheck,
  Filter,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSuppliersNearMe } from "@/api/requests";

interface ISupplierContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  keyman_number: string;
  comments: string | null;
  photo?: string[];
  supplier_rating: null | string;
  is_user_verified: number;
}

interface StoreSearchProps {
  onComplete: (store: ISupplierContact) => void;
  onBack: () => void;
  initialStoreId?: string | null;
}

const StoreSearch: React.FC<StoreSearchProps> = ({
  onComplete,
  onBack,
  initialStoreId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<ISupplierContact | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [useExtendedSearch, setUseExtendedSearch] = useState(false);
  const [current, setCurrent] = useState(0);
  const perPage = 12;

  // Fetch suppliers near the user
  const {
    data: _suppliers,
    isLoading,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: ["suppliers_near_me_contract"],
    queryFn: async () =>
      getSuppliersNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0),
    enabled: !!userLocation && !useExtendedSearch,
  });

  // Extended search query with 400km distance
  const {
    data: _extendedSuppliers,
    isLoading: isExtendedLoading,
    refetch: refetchExtendedSuppliers,
  } = useQuery({
    queryKey: ["suppliers_near_me_extended_contract", 400000],
    queryFn: async () =>
      getSuppliersNearMe(
        userLocation?.lat ?? 0,
        userLocation?.lng ?? 0,
        400000
      ),
    enabled: !!userLocation && useExtendedSearch,
  });

  const currentSuppliers = useExtendedSearch ? _extendedSuppliers : _suppliers;
  const currentLoading = useExtendedSearch ? isExtendedLoading : isLoading;

  // Retry fetching stores
  const handleRetryFetch = () => {
    if (useExtendedSearch) {
      refetchExtendedSuppliers();
    } else {
      refetchSuppliers();
    }
  };

  // Filter suppliers based on search query
  const filteredSuppliers: ISupplierContact[] = useMemo(() => {
    const suppliers = currentSuppliers?.suppliers || [];
    if (searchQuery.trim()) {
      return suppliers.filter(
        (supplier: ISupplierContact) =>
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.keyman_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (supplier.comments !== null &&
            supplier.comments.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return suppliers;
  }, [currentSuppliers, searchQuery]);

  // Pagination
  const total = Math.ceil(filteredSuppliers.length / perPage);
  const startIndex = current * perPage;
  const endIndex = startIndex + perPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

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
            "Unable to retrieve your location. Showing all stores."
          );
          setLoading(false);
          setUseExtendedSearch(true);
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

  // Pre-select store if initialStoreId is provided
  useEffect(() => {
    if (initialStoreId && filteredSuppliers.length > 0) {
      const preSelected = filteredSuppliers.find(
        (s) => s.keyman_number === initialStoreId
      );
      if (preSelected) {
        setSelectedStore(preSelected);
      }
    }
  }, [initialStoreId, filteredSuppliers]);

  const handleSelectStore = (store: ISupplierContact) => {
    setSelectedStore(store);
  };

  const handleContinue = () => {
    if (selectedStore) {
      onComplete(selectedStore);
    }
  };

  if (loading || currentLoading) {
    return (
      <Container size="lg" py="xl">
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <Loader size="lg" color="green.7" />
          <Text size="lg" c="dimmed" mt="md">
            Finding stores near you...
          </Text>
          <Text size="sm" c="dimmed">
            Getting your location to show the best options
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container size="fluid" py="md">
      <Stack gap="xl">
        {/* Header Section */}
        <Box style={{ textAlign: "center" }}>
          <Group justify="center" gap="xs" mb="md">
            <Store size={32} style={{ color: "#3D6B2C" }} />
            <Title
              order={1}
              style={{
                color: "#3D6B2C",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              Select a Store
            </Title>
          </Group>
          <Text size="lg" c="dimmed">
            Search store or material and select the store you want to create a
            contract with
          </Text>
        </Box>

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

        {/* Pre-selected Store Alert */}
        {initialStoreId && selectedStore && (
          <Alert
            icon={<CheckCircle2 size={16} />}
            color="green"
            variant="light"
          >
            <Text size="sm">
              Store <strong>{selectedStore.name}</strong> has been pre-selected.
              You can change your selection below.
            </Text>
          </Alert>
        )}

        {/* Search Bar */}
        <Paper shadow="sm" p="md" radius="lg" withBorder>
          <Group gap="md">
            <TextInput
              placeholder="Search stores by name, email, or KS number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<Search size={20} style={{ color: "#6B7280" }} />}
              size="lg"
              radius="md"
              style={{ flex: 1 }}
            />
            <ActionIcon
              size="lg"
              radius="md"
              color="green.7"
              variant="light"
              onClick={() => setSearchQuery("")}
            >
              <Filter size={20} />
            </ActionIcon>
          </Group>
        </Paper>

        {/* Results Counter */}
        <Group justify="space-between" align="center">
          <Text size="md" c="dimmed">
            {filteredSuppliers.length} store
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
                onClick={() => {
                  setUseExtendedSearch(!useExtendedSearch);
                  setCurrent(0);
                }}
              >
                {useExtendedSearch ? "Viewing all stores" : "View all stores"}
              </Badge>
            </Group>
          )}
        </Group>

        {/* Stores Grid */}
        <Grid>
          {paginatedSuppliers.map((supplier) => (
            <Grid.Col
              key={supplier.id}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            >
              <Transition
                mounted={true}
                transition="slide-up"
                duration={300}
                timingFunction="ease"
              >
                {(styles) => (
                  <Paper
                    shadow="sm"
                    p="md"
                    radius="lg"
                    withBorder
                    style={{
                      ...styles,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border:
                        selectedStore?.id === supplier.id
                          ? "2px solid #3D6B2C"
                          : "1px solid #E5E7EB",
                      backgroundColor:
                        selectedStore?.id === supplier.id ? "#f0f9ff" : "white",
                      height: "100%",
                    }}
                    onClick={() => handleSelectStore(supplier)}
                    className="hover:shadow-lg hover:scale-105"
                  >
                    <Stack gap="sm">
                      {/* Avatar */}
                      <Group justify="center">
                        <Avatar
                          size={80}
                          radius="md"
                          alt={supplier.name}
                          src={
                            supplier?.photo && supplier.photo.length > 0
                              ? supplier.photo[0]
                              : null
                          }
                          style={{
                            backgroundColor: "#F0F9FF",
                            color: "#3D6B2C",
                          }}
                        >
                          <Store size={40} />
                        </Avatar>
                      </Group>

                      {/* Store Name */}
                      <Box style={{ textAlign: "center" }}>
                        <Text
                          size="md"
                          fw={600}
                          style={{ lineHeight: 1.3 }}
                          lineClamp={2}
                        >
                          {supplier.name}
                        </Text>
                        {supplier.is_user_verified > 0 && (
                          <BadgeCheck
                            size={20}
                            fill="#3D6B2C"
                            stroke="white"
                            style={{ display: "inline-block", marginLeft: 4 }}
                          />
                        )}
                      </Box>

                      {/* KS Number Badge */}
                      <Group justify="center">
                        <Badge color="orange" variant="light" size="sm">
                          {supplier.keyman_number}
                        </Badge>
                      </Group>

                      {/* Rating */}
                      <Group justify="center" gap={4}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            size={14}
                            key={i}
                            fill={
                              supplier.supplier_rating !== null &&
                              i < Number(supplier.supplier_rating)
                                ? "orange"
                                : "none"
                            }
                            color={
                              supplier.supplier_rating !== null &&
                              i < Number(supplier.supplier_rating)
                                ? "orange"
                                : "gray"
                            }
                          />
                        ))}
                      </Group>

                      {/* Selection Indicator */}
                      {selectedStore?.id === supplier.id && (
                        <Box
                          style={{
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinue();
                          }}
                        >
                          <Badge
                            color="green"
                            variant="filled"
                            size="lg"
                            rightSection={<ArrowRight size={14} />}
                            style={{
                              cursor: "pointer",
                              padding: "8px 12px",
                            }}
                          >
                            Continue with Store
                          </Badge>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Transition>
            </Grid.Col>
          ))}
        </Grid>

        {/* Pagination */}
        {filteredSuppliers.length > perPage && (
          <Group justify="center" mt="md">
            <Pagination
              total={total}
              value={current + 1}
              onChange={(num) => {
                setCurrent(num - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              color="green.7"
            />
          </Group>
        )}

        {/* No Results State */}
        {filteredSuppliers.length === 0 && !loading && (
          <Paper p="xl" radius="lg" ta="center" withBorder>
            <Stack gap="md" align="center">
              <Search size={48} style={{ color: "#D1D5DB" }} />
              <Text size="lg" fw={500} c="dimmed">
                No stores found
              </Text>
              <Text size="sm" c="dimmed">
                Try adjusting your search terms or check back later
              </Text>
              <Group gap="sm">
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  color="green.7"
                >
                  Clear Search
                </Button>
                <Button
                  variant="filled"
                  onClick={handleRetryFetch}
                  color="green.7"
                  leftSection={<Navigation size={16} />}
                >
                  Retry Location
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Actions */}
        <Group justify="flex-start" mt="xl">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onBack}
            color="gray"
            size="md"
          >
            Back
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default StoreSearch;
