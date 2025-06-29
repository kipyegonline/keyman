import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TextInput,
  Button,
  Card,
  Group,
  Text,
  ActionIcon,
  Paper,
} from "@mantine/core";
import { Search, MapPin, X, Navigation, Copy, Loader } from "lucide-react";

/*eslint-disable */

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void;
  on: (event: string, handler: (e: any) => void) => void;
  removeLayer: (layer: any) => void;
  getZoom: () => number;
}

interface LeafletMarker {
  bindPopup: (content: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
}

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

interface GeoapifyFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    formatted: string;
    place_id: string;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

interface MapComponentProps {
  apiKey: string;
  onLocationSelect: (coordinates: Coordinates, name: string) => void;
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
  // State management with proper typing
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [marker, setMarker] = useState<LeafletMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentCoordinates, setCurrentCoordinates] =
    useState<Coordinates | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map with proper error handling
  useEffect(() => {
    if (!mapRef.current || isMapLoaded) return;

    const initializeMap = async (): Promise<void> => {
      try {
        // In a real implementation, you would import these:
        // import L from 'leaflet';
        // import 'leaflet/dist/leaflet.css';

        // For demo purposes, we'll load via CDN but with proper typing
        await loadLeafletLibrary();

        const L = (window as any).L;

        if (!L) {
          throw new Error("Leaflet library failed to load");
        }

        const mapInstance = L.map(mapRef.current!).setView(
          [initialCenter.lat, initialCenter.lng],
          initialZoom
        ) as LeafletMap;

        // Add Geoapify tile layer
        L.tileLayer(
          `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
          {
            attribution:
              '© <a href="https://www.geoapify.com/">Geoapify</a> | © OpenStreetMap contributors',
            maxZoom: 18,
          }
        ).addTo(mapInstance);

        // Handle map clicks with proper typing
        mapInstance.on(
          "click",
          (e: { latlng: { lat: number; lng: number } }) => {
            const { lat, lng } = e.latlng;
            handleLocationSelect(
              { lat, lng },
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            );
          }
        );

        setMap(mapInstance);
        setIsMapLoaded(true);
        setMapError(null);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize map";
        setMapError(errorMessage);
        console.error("Map initialization error:", error);
      }
    };

    initializeMap();

    // Cleanup function
    return (): void => {
      if (map && typeof (map as any).remove === "function") {
        (map as any).remove();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [apiKey, initialCenter.lat, initialCenter.lng, initialZoom, isMapLoaded]);

  // Load Leaflet library dynamically with proper typing
  const loadLeafletLibrary = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const cssLink: HTMLLinkElement = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        cssLink.integrity =
          "sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==";
        cssLink.crossOrigin = "anonymous";
        document.head.appendChild(cssLink);
      }

      // Load JS
      if (!(window as any).L) {
        const script: HTMLScriptElement = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
        script.integrity =
          "sha512-BwHfrr4c9kmRkLw6iXFdzcdWV/PGkVgiIyIWLLlTSXzWQzxuSg4DiQUCpauz/EWjgk5TYQqX/kvn9pG1NpYfqg==";
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Leaflet library"));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  };

  // Handle location selection with proper typing
  const handleLocationSelect = useCallback(
    (coordinates: Coordinates, displayName?: string): void => {
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
        // className: "custom-div-icon",
      });

      // Add new marker
      const newMarker: LeafletMarker = L.marker(
        [coordinates.lat, coordinates.lng],
        { icon: customIcon }
      ).addTo(map);

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
      onLocationSelect(coordinates, displayName ?? "");

      // Hide search results
      setShowResults(false);
    },
    [map, marker, onLocationSelect]
  );

  // Search function with proper error handling and typing
  const searchLocation = useCallback(
    async (query: string): Promise<void> => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);

      try {
        const response: Response = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            query
          )}&apiKey=${apiKey}&limit=5`
        );

        if (!response.ok) {
          throw new Error(
            `Search failed: ${response.status} ${response.statusText}`
          );
        }

        const data: GeoapifyResponse = await response.json();
        const results: SearchResult[] = data.features.map(
          (feature: GeoapifyFeature) => ({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            display_name: feature.properties.formatted,
            place_id: feature.properties.place_id,
          })
        );

        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Search failed";
        console.error("Search error:", errorMessage);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    },
    [apiKey]
  );

  // Debounced search with proper cleanup
  useEffect((): (() => void) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);

    return (): void => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocation]);

  // Clear marker function
  const clearMarker = (): void => {
    if (marker && map) {
      map.removeLayer(marker);
      setMarker(null);
      setCurrentCoordinates(null);
    }
  };

  // Get user's current location with proper error handling
  const getCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        handleLocationSelect(coordinates, "Current Location");
      },
      (error: GeolocationPositionError) => {
        console.error("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Handle search input change
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(event.target.value);
  };

  // Handle search clear
  const handleSearchClear = (): void => {
    setSearchQuery("");
    setShowResults(false);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult): void => {
    handleLocationSelect(
      { lat: result.lat, lng: result.lon },
      result.display_name
    );
  };

  // Render error state
  if (mapError) {
    return (
      <div
        className={`w-full h-full min-h-[500px] flex items-center  justify-center ${className}`}
      >
        <Card className="p-6 text-center max-w-md">
          <Text
            size="lg"
            fw={600}
            style={{ color: "#F08C23" }}
            className="mb-2"
          >
            Map Error
          </Text>
          <Text size="sm" c="dimmed" className="mb-4">
            {mapError}
          </Text>
          <Button
            onClick={() => {
              setMapError(null);
              setIsMapLoaded(false);
            }}
            style={{
              backgroundColor: "#3D6B2C",
              "&:hover": { backgroundColor: "#388E3C" },
            }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full min-h-[500px] max-w-[360px] md:max-w-[680px]  relative ${className}`}
    >
      {/* Search Controls */}
      <h3 className="relative -top-4 ml-4 font-semibold">
        Search for a location
      </h3>
      <Paper
        shadow="md"
        // display={"none"}
        className="absolute  top-4 left-4 right-4 z-[10] p-4"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex gap-2 mb-2">
          <TextInput
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="flex-1"
            leftSection={<Search size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon variant="subtle" onClick={handleSearchClear}>
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
            <MapPin size={14} style={{ color: "#3D6B2C" }} />
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
                <Loader size={20} style={{ color: "#3D6B2C" }} />
                <Text size="sm" className="ml-2">
                  Searching...
                </Text>
              </div>
            ) : (
              <div>
                {searchResults.map((result: SearchResult, index: number) => (
                  <div
                    key={result.place_id || index}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <Group gap="xs">
                      <MapPin size={14} style={{ color: "#3D6B2C" }} />
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
      {!isMapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader size={32} style={{ color: "#3D6B2C" }} />
            <Text className="mt-2" style={{ color: "#3D6B2C" }}>
              Loading map...
            </Text>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Paper
        shadow="md"
        className="absolute bottom-4 left-4 p-3 max-w-xs "
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

// Example usage component with proper typing
const MapExample: React.FC = () => {
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(null);

  const handleLocationSelect = (coordinates: Coordinates): void => {
    setSelectedCoordinates(coordinates);
  };

  const handleCopyCoordinates = async (): Promise<void> => {
    if (!selectedCoordinates) return;

    try {
      await navigator.clipboard.writeText(
        `${selectedCoordinates.lat}, ${selectedCoordinates.lng}`
      );
    } catch (error: unknown) {
      console.error("Failed to copy coordinates:", error);
    }
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
                    onClick={handleCopyCoordinates}
                  >
                    <Copy size={16} style={{ marginRight: "8px" }} />
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

export default GeoapifyMapInterface;
