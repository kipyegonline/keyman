import React from "react";
import { Card, Text, Group, Button, Stack, Tooltip } from "@mantine/core";
import { MapPin, Calendar, ExternalLink, Navigation } from "lucide-react";

interface Location {
  address: string;
  created_at: string;
  description: string;
  id: string;
  location: {
    type: string;
    coordinates: number[];
  };
  name: string;
  updated_at: string;
  user_id: number;
}

interface LocationCardsProps {
  locations: Location[];
  className?: string;
}

const LocationCards: React.FC<LocationCardsProps> = ({
  locations,
  className = "",
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openInGoogleMaps = (coordinates: number[]) => {
    if (coordinates.length >= 2) {
      const [lng, lat] = coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };

  if (locations.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      >
        <Navigation className="w-16 h-16 text-gray-300 mb-4" />
        <Text size="lg" c="dimmed">
          No locations found
        </Text>
        <Text size="sm" c="dimmed">
          Add your first location by clicking on the map
        </Text>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4  ${className}`}
    >
      {locations.map((location, index) => (
        <Card
          key={location.id}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer group"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "fadeInUp 0.6s ease-out forwards",
            opacity: 0,
          }}
        >
          <Card.Section className="p-4 pb-2">
            <Group justify="space-between" align="flex-start">
              <div className="flex-1">
                <Text
                  fw={600}
                  size="lg"
                  className="mb-2 group-hover:text-green-600 transition-colors duration-200"
                >
                  {location.name}
                </Text>
                <Group gap="xs" className="mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <Text size="sm" c="dimmed" className="flex-1">
                    {location.address}
                  </Text>
                </Group>
              </div>
            </Group>
          </Card.Section>

          <Card.Section className="px-4 pb-2">
            <Text size="sm" c="dimmed" className="mb-3 line-clamp-2">
              {location.description}
            </Text>

            <Group gap="xs" className="my-3">
              <Text size="xs" c="dimmed">
                <Calendar className="w-4 h-4 text-gray-500 inline-block" />
                Added {formatDate(location.created_at)}
              </Text>
            </Group>

            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Tooltip label="Open in Google Maps">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<ExternalLink className="w-3 h-3" />}
                    onClick={() =>
                      openInGoogleMaps(location.location.coordinates)
                    }
                    className="transform  w-full hover:scale-110 transition-all duration-200 hover:shadow-md"
                  >
                    View Maps
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Card.Section>
        </Card>
      ))}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LocationCards;
