import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TextInput,
  Button,
  Card,
  Group,
  Text,
  ActionIcon,
  Loader,
  Paper,
} from "@mantine/core";
import { Search, MapPin, X, Navigation, Copy, Loader } from "lucide-react";

// TypeScript interfaces
interface Coordinates {
  lat: number;
  lng: number;
}

interface SearchResult {
  lat: number;
  lon: number;
  display_name: string;
  place_id: string;
}

interface MapComponentProps {
  apiKey: string;
  onLocationSelect: (coordinates: Coordinates) => void;
  initialCenter?: Coordinates;
  initialZoom?: number;
  className?: string;
}

const GeoapifyMapInterface: React.FC<MapComponentProps> = ({
  apiKey,
  onLocationSelect,
  initialCenter = { lat: -1.2921, lng: 36.8219 }, // Nairobi default
  initialZoom = 12,
  className = "",
}) => {
  // State management
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] =
    useState<Coordinates | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isMapLoaded) return;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(cssLink);
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;

      const mapInstance = L.map(mapRef.current).setView(
        [initialCenter.lat, initialCenter.lng],
        initialZoom
      );

      // Add Geoapify tile layer
      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        {
          attribution:
            '© <a href="https://www.geoapify.com/">Geoapify</a> | © OpenStreetMap contributors',
          maxZoom: 18,
        }
      ).addTo(mapInstance);

      // Handle map clicks
      mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        handleLocationSelect(
          { lat, lng },
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      });

      setMap(mapInstance);
      setIsMapLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [apiKey, initialCenter, initialZoom]);

  // Handle location selection (from search or click)
  const handleLocationSelect = useCallback(
    (coordinates: Coordinates, displayName?: string) => {
      if (!map) return;

      const L = (window as any).L;

      // Remove existing marker
      if (marker) {
        map.removeLayer(marker);
      }

      // Create custom marker icon with primary color
      const customIcon = L.divIcon({
        html: `<div style="background-color: #3D6B2C; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; position: absolute; top: 6px; left: 6px;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: "custom-div-icon",
      });

      // Add new marker
      const newMarker = L.marker([coordinates.lat, coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      // Add popup with coordinates
      newMarker
        .bindPopup(
          `
      <div style="font-family: system-ui; padding: 4px;">
        <strong style="color: #3D6B2C;">${
          displayName || "Selected Location"
        }</strong><br/>
        <small>Lat: ${coordinates.lat.toFixed(
          6
        )}<br/>Lng: ${coordinates.lng.toFixed(6)}</small>
      </div>
    `
        )
        .openPopup();

      setMarker(newMarker);
      setCurrentCoordinates(coordinates);

      // Center map on selected location
      map.setView([coordinates.lat, coordinates.lng], map.getZoom());

      // Call the callback with coordinates
      onLocationSelect(coordinates);

      // Hide search results
      setShowResults(false);
    },
    [map, marker, onLocationSelect]
  );

  // Search function
  const searchLocation = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            query
          )}&apiKey=${apiKey}&limit=5`
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();
        const results: SearchResult[] = data.features.map((feature: any) => ({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          display_name: feature.properties.formatted,
          place_id: feature.properties.place_id,
        }));

        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    },
    [apiKey]
  );

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocation]);

  // Clear marker
  const clearMarker = () => {
    if (marker && map) {
      map.removeLayer(marker);
      setMarker(null);
      setCurrentCoordinates(null);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        handleLocationSelect(coordinates, "Current Location");
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <div className={`w-full h-full min-h-[500px] relative ${className}`}>
      {/* Search Controls */}
      <Paper
        shadow="md"
        className="absolute top-4 left-4 right-4 z-[1000] p-4"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex gap-2 mb-2">
          <TextInput
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            leftSection={<Search size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                >
                  <X size={14} />
                </ActionIcon>
              ) : null
            }
            styles={{
              input: {
                borderColor: "#3D6B2C",
                "&:focus": {
                  borderColor: "#3D6B2C",
                  boxShadow: `0 0 0 1px #3D6B2C`,
                },
              },
            }}
          />

          <Button
            variant="outline"
            onClick={getCurrentLocation}
            style={{
              borderColor: "#3D6B2C",
              color: "#3D6B2C",
              "&:hover": { backgroundColor: "#3D6B2C", color: "white" },
            }}
          >
            <Navigation size={16} />
          </Button>

          {currentCoordinates && (
            <Button
              variant="outline"
              onClick={clearMarker}
              style={{
                borderColor: "#F08C23",
                color: "#F08C23",
                "&:hover": { backgroundColor: "#F08C23", color: "white" },
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Current Coordinates Display */}
        {currentCoordinates && (
          <Group gap="xs" className="text-sm">
            <IconMapPin size={14} style={{ color: "#3D6B2C" }} />
            <Text size="sm" style={{ color: "#3D6B2C" }}>
              {currentCoordinates.lat.toFixed(6)},{" "}
              {currentCoordinates.lng.toFixed(6)}
            </Text>
          </Group>
        )}

        {/* Search Results */}
        {showResults && (
          <Card className="mt-2 max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader size="sm" style={{ color: "#3D6B2C" }} />
                <Text size="sm" className="ml-2">
                  Searching...
                </Text>
              </div>
            ) : (
              <div>
                {searchResults.map((result, index) => (
                  <div
                    key={result.place_id || index}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() =>
                      handleLocationSelect(
                        { lat: result.lat, lng: result.lon },
                        result.display_name
                      )
                    }
                  >
                    <Group gap="xs">
                      <IconMapPin size={14} style={{ color: "#3D6B2C" }} />
                      <Text size="sm" className="flex-1">
                        {result.display_name}
                      </Text>
                    </Group>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </Paper>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px] rounded-lg"
        style={{ zIndex: 1 }}
      />

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader size="lg" style={{ color: "#3D6B2C" }} />
            <Text className="mt-2" style={{ color: "#3D6B2C" }}>
              Loading map...
            </Text>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Paper
        shadow="md"
        className="absolute bottom-4 left-4 p-3 max-w-xs"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
      >
        <Text size="xs" style={{ color: "#3D6B2C" }}>
          💡 <strong>Tips:</strong> Search for locations above or click anywhere
          on the map to drop a pin and get coordinates.
        </Text>
      </Paper>
    </div>
  );
};

// Example usage component
const MapExample: React.FC = () => {
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(null);

  const handleLocationSelect = (coordinates: Coordinates) => {
    setSelectedCoordinates(coordinates);
    console.log("Selected coordinates:", coordinates);
  };

  return (
    <div className="w-full h-screen p-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Text size="xl" fw={700} style={{ color: "#3D6B2C" }}>
            Interactive Location Picker
          </Text>
          <Text size="sm" c="dimmed">
            Search or click on the map to select a location
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
          <div className="lg:col-span-3">
            <GeoapifyMapInterface
              apiKey="YOUR_GEOAPIFY_API_KEY" // Replace with your actual API key
              onLocationSelect={handleLocationSelect}
              initialCenter={{ lat: -1.2921, lng: 36.8219 }} // Nairobi
              initialZoom={12}
              className="h-full"
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <Text fw={600} mb="md" style={{ color: "#3D6B2C" }}>
                Selected Location
              </Text>

              {selectedCoordinates ? (
                <div className="space-y-3">
                  <div>
                    <Text size="sm" fw={500} style={{ color: "#388E3C" }}>
                      Latitude
                    </Text>
                    <Text size="sm" ff="monospace">
                      {selectedCoordinates.lat.toFixed(6)}
                    </Text>
                  </div>

                  <div>
                    <Text size="sm" fw={500} style={{ color: "#388E3C" }}>
                      Longitude
                    </Text>
                    <Text size="sm" ff="monospace">
                      {selectedCoordinates.lng.toFixed(6)}
                    </Text>
                  </div>

                  <Button
                    fullWidth
                    variant="light"
                    style={{
                      backgroundColor: "#3D6B2C",
                      color: "white",
                      "&:hover": { backgroundColor: "#388E3C" },
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${selectedCoordinates.lat}, ${selectedCoordinates.lng}`
                      );
                    }}
                  >
                    Copy Coordinates
                  </Button>
                </div>
              ) : (
                <Text size="sm" c="dimmed">
                  No location selected yet. Click on the map or search for a
                  location.
                </Text>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExample;
