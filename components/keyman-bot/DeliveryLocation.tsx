import { Card, Select, Text } from "@mantine/core";
import { DatePickerInput as DateInput } from "@mantine/dates";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
type Location = { id: string; name: string };
type Props = {
  locations: Location[];
  sendLocation: (location: string) => void;
  config: { refresh: () => void; location: string };
};
export const DeliveryLocation = ({
  locations,
  sendLocation,
  config,
}: Props) => {
  const [location, setLocation] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (location) {
      sendLocation(location);
    }
  }, [location]);
  React.useEffect(() => {
    if (config.location) {
      sendLocation(config.location);
    }
  }, [config]);
  if (locations.length === 0) {
    return (
      <Card className=" bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 py-2 mb-2">
        <div className="text-center">
          <Text className=" text-gray-600" size="xs">
            You need to add delivery locations before creating a request.
          </Text>
          <Link
            target="_blank"
            href="/keyman/dashboard/delivery?return=true"
            className="inline-flex items-center gap-2 text-xs text-[#3D6B2C] hover:text-[#388E3C] font-medium"
          >
            Add Delivery Location <ExternalLink size={16} />
          </Link>
          <div className="flex justify-end">
            <button
              className="bg-keyman-orange text-white px-2 rounded-md !text-xs"
              onClick={() => config.refresh()}
            >
              <small>Refresh</small>
            </button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MapPin size={16} className="text-[#3D6B2C]" />
        Delivery Location
      </label>

      <Select
        placeholder="Choose delivery location"
        data={locations.map((loc: Location) => ({
          value: loc.id,
          label: loc.name,
        }))}
        className="transition-all duration-200 hover:scale-[1.02]"
        onChange={setLocation}
        value={location}
      />
    </div>
  );
};

export function DeliveryDate({
  sendDate,
  date: iDate,
}: {
  sendDate: (date: string) => void;
  date: string;
}) {
  const [date, setDate] = React.useState<null | string>(null);
  React.useEffect(() => {
    if (date) {
      sendDate(date);
    }
  }, [date]);
  React.useEffect(() => {
    if (iDate) {
      setDate(iDate);
    }
  }, [iDate]);
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Calendar size={16} className="text-[#3D6B2C]" />
        Delivery Date
      </label>
      <DateInput
        placeholder="Select delivery date"
        minDate={new Date()}
        className="transition-all duration-200 hover:scale-[1.02]"
        value={date}
        onChange={(value) => setDate(value)}
      />
    </div>
  );
}
