"use client";

import { createProject } from "@/api/projects";
import MapComponent from "@/components/delivery/mapBox";
import { notify } from "@/lib/notifications";
//import DeliveryMap from '@/components/delivery/map'
import { Alert, Button, Flex, Grid, Textarea, TextInput } from "@mantine/core";
import { ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";

import React from "react";
const key = process.env.NEXT_PUBLIC_G_KEY as string;
const defaultState = { name: "", description: "", address: "" };
type Coords = { lng: number; lat: number };
export default function DeliveryClientComponent() {
  const [coords, setCoords] = React.useState<Coords | null>(null);
  const [info, setInfo] = React.useState(defaultState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const params = useSearchParams();
  const isReturn = params.get("return");

  const _setCoords = (coords: { lat: number; lng: number }) => {
    setCoords(coords);
  };

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
    console.log("Form submitted successfully! (Just kidding, this is a demo)");
    console.log("Submitting:", { coords, info });
    const payload = { ...info, latitude: coords.lat, longitude: coords.lng };
    setLoading(true);
    setError("");

    const response = await createProject(payload);
    setLoading(false);

    console.log(response);
    if (response.status) {
      setInfo(defaultState);
      setCoords({ lat: 0, lng: 0 });
      notify.success("Location created successfully");
      setSuccess(true);
    } else {
      notify.error(response.error);
    }
  };

  return (
    <div className="px-2 md:px-10 min-h-screen">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <MapComponent apiKey={key} setCoords={_setCoords} />
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
