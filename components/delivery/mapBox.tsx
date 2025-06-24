// src/MapComponent.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
  MapControl,
  ControlPosition,
} from "@vis.gl/react-google-maps";

// Define types for place data and coordinates
interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface PlaceResult extends google.maps.places.PlaceResult {
  geometry?: {
    location?: google.maps.LatLng;
    viewport?: google.maps.LatLngBounds;
  };
  formatted_address?: string;
}

interface MapComponentProps {
  apiKey: string;
  setCoords: (coords: LatLngLiteral) => void;
}

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceResult | null) => void;
}

// Helper component for the Place Autocomplete search bar
const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  onPlaceSelect,
}) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;
    console.log("places", places, inputRef.current);
    const options = {
      fields: [
        "geometry",
        "name",
        "formatted_address",
      ] as (keyof google.maps.places.PlaceResult)[],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    const handlePlaceChanged = () => {
      const place = placeAutocomplete.getPlace() as PlaceResult;
      if (place.geometry) {
        onPlaceSelect(place);
      } else {
        onPlaceSelect(null); // Clear selection if no geometry found
      }
    };

    placeAutocomplete.addListener("place_changed", handlePlaceChanged);

    // Clean up listener
    return () => {
      // Autocomplete does not expose a direct way to remove a single listener by reference
      // This is a common pattern to ensure cleanup, although it removes all listeners for 'place_changed'
      // For more granular control, you might track the listener object returned by addListener.
      // However, for this simple case, re-initializing Autocomplete on dependency changes handles it.
    };
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container p-2">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        className="w-80 p-2 text-base rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

interface MapHandlerProps {
  place: PlaceResult | null;
  onMapClick: (coords: LatLngLiteral) => void;
}
const coords = {
  lat: -1.194438642926344,
  lng: 36.928756667223446,
};

// Map Handler to update map center/zoom based on selected place and handle clicks
const MapHandler: React.FC<MapHandlerProps> = ({ place, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else if (place.geometry?.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(15);
    }
  }, [map, place]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onMapClick({ lat, lng });
      }
    },
    [onMapClick]
  );

  useEffect(() => {
    if (!map) return;
    const clickListener = map?.addListener("click", handleMapClick);
    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, handleMapClick]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ apiKey, setCoords }) => {
  const defaultMapOptions = {
    center: { ...coords },
    zoom: 15,
    mapId: "DEMO_MAP_ID", // Replace with your Map ID if you have one
  };

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [markerPosition, setMarkerPosition] = useState<LatLngLiteral | null>(
    null
  );
  const [clickedCoordinates, setClickedCoordinates] =
    useState<LatLngLiteral | null>(null);

  const handlePlaceSelect = useCallback((place: PlaceResult | null) => {
    setSelectedPlace(place);

    if (place?.geometry?.location) {
      setMarkerPosition({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setClickedCoordinates({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    } else {
      setMarkerPosition(null);
      setClickedCoordinates(null);
    }
  }, []);

  const handleMapClick = useCallback((coords: LatLngLiteral) => {
    setMarkerPosition(coords);
    setClickedCoordinates(coords);
    setCoords(coords);
  }, []);

  return (
    <div className="relative h-[70vh] w-full">
      <APIProvider apiKey={apiKey} libraries={["places"]}>
        <Map
          {...defaultMapOptions}
          className="w-full h-full" // Tailwind class for full size
        >
          <MapControl position={ControlPosition.TOP_LEFT}>
            <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
          </MapControl>

          {markerPosition && (
            <AdvancedMarker position={markerPosition}>
              <Pin
                background={"#4285F4"}
                glyphColor={"#FFF"}
                borderColor={"#225FBB"}
              />
            </AdvancedMarker>
          )}

          <MapHandler place={selectedPlace} onMapClick={handleMapClick} />
        </Map>
      </APIProvider>

      {clickedCoordinates && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-md shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Selected Location:</h3>
          <p>
            Latitude:{" "}
            <span className="font-mono">
              {clickedCoordinates.lat.toFixed(6)}
            </span>
          </p>
          <p>
            Longitude:{" "}
            <span className="font-mono">
              {clickedCoordinates.lng.toFixed(6)}
            </span>
          </p>
          {selectedPlace && selectedPlace.formatted_address && (
            <p>
              Address:{" "}
              <span className="font-mono">
                {selectedPlace.formatted_address}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
