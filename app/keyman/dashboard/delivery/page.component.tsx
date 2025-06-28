"use client";

import { createProject } from "@/api/projects";

import GeoapifyMapInterface from "@/components/requests/GeoApifymap";
import { notify } from "@/lib/notifications";
//import DeliveryMap from '@/components/delivery/map'
import { Alert, Button, Flex, Grid, Textarea, TextInput } from "@mantine/core";
import { ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";

import React from "react";

const geoAPIKey = process.env.NEXT_PUBLIC_GEOAPIFY as string;
const defaultState = { name: "", description: "", address: "" };

interface Coordinates {
  lat: number;
  lng: number;
}
export default function DeliveryClientComponent() {
  const [info, setInfo] = React.useState(defaultState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [coords, setSelectedCoordinates] = React.useState<Coordinates | null>(
    null
  );

  const handleLocationSelect = (coordinates: Coordinates, name: string) => {
    setSelectedCoordinates(coordinates);
    setInfo({ ...info, name });
  };
  const params = useSearchParams();
  const isReturn = params.get("return");

  const handleSubmit = async () => {
    setSuccess(false);
    // Validate coordinates
    if (coords === null) {
      notify.error("Please select a location on the map.");
      return;
    }

    // Validate name, description, and address fields
    if (!info.name.trim()) {
      notify.error("Please enter a name.");
      return;
    }
    if (!info.address.trim()) {
      notify.error("Please enter an address.");
      return;
    }
    if (!info.description.trim()) {
      notify.error("Please enter a description.");
      return;
    }
    // If all validations pass, you can proceed with your submission logic here

    console.log("Submitting:", { coords, info });
    const payload = { ...info, latitude: coords.lat, longitude: coords.lng };
    setLoading(true);
    setError("");

    const response = await createProject(payload);
    setLoading(false);

    if (response.status) {
      setInfo(defaultState);
      setSelectedCoordinates(null);
      notify.success("Location created successfully");
      setSuccess(true);
    } else {
      notify.error(response.error);
    }
  };

  return (
    <div className="px-2 md:px-10 min-h-screen">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }} className="mb-4 p-2 md:p-4 ">
          <GeoapifyMapInterface
            apiKey={geoAPIKey} // Replace with your actual API key
            onLocationSelect={handleLocationSelect}
            initialCenter={{ lat: -1.2921, lng: 36.8219 }} // Nairobi
            initialZoom={12}
            className="h-full ml-2 md:ml-[40px]"
          />
        </Grid.Col>
        {coords && (
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Flex direction={"column"} gap="md" p="md">
              <TextInput
                label="Name"
                placeholder="Enter name"
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                value={info.name}
              />
              <TextInput
                label="Address"
                placeholder="Enter address"
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
                value={info.address}
              />
              <Textarea
                label="Description"
                placeholder="Enter description"
                onChange={(e) =>
                  setInfo({ ...info, description: e.target.value })
                }
                value={info.description}
              />
              {error && <p className="text-red-500 text-sm py-2">{error}</p>}
              <Button loading={loading} onClick={handleSubmit}>
                Submit location
              </Button>
              {success && isReturn && (
                <Alert
                  variant="filled"
                  color="orange"
                  icon={<ExternalLink />}
                  className="cursor-pointer"
                  onClick={() =>
                    (window.location.href =
                      "/keyman/dashboard/requests/create-request")
                  }
                >
                  Return to requests page
                </Alert>
              )}
            </Flex>
          </Grid.Col>
        )}
      </Grid>
    </div>
  );
}
/*
const userLocation = ref({
	lat: -1.194438642926344,
	lng: 36.928756667223446
});
const zoom = ref(15);*/
