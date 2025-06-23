import React, { useState, useCallback, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, type MapProps } from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { Search, MapPin, Navigation, Copy, Check, Loader2, X } from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
  formattedAddress?: string;
}

interface LocationPickerProps {
  onLocationSelect?: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}
 
  const API_KEY =process.env.NEXT_PUBLIC_G_KEY as string
const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation = { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
  height = '500px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);



  const handleMapLoad: NonNullable<MapProps['load']> = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);
console.log(API_KEY,'api key')
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 border-green">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            📍 Location Pick
          </h2>
          <p className="text-sm text-gray-600">
            Search for a location or click on the map to select coordinates
          </p>
        </div>

        <APIProvider apiKey={API_KEY}   onLoad={handleMapLoad}>
          <LocationSearchComponent
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            predictions={predictions}
            setPredictions={setPredictions}
            showPredictions={showPredictions}
            setShowPredictions={setShowPredictions}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onLocationSelect={(location) => {
              setSelectedLocation(location);
              onLocationSelect?.(location);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 3000);
            }}
            mapInstance={map}
          />

          <div className="relative mt-4 rounded-lg  shadow-lg">
            <Map
              id="map"
              defaultCenter={initialLocation}
              defaultZoom={12}
              style={{ 
                height: 500,
                width: 500,
                border:"1px solid red"
              }}
              gestureHandling="greedy"
              disableDefaultUI={false}
             
              onClick={(event: MapMouseEvent) => {
                if (event.detail.latLng) {
                  handleMapClick(
                    event.detail.latLng,
                    setSelectedLocation,
                    setIsLoading,
                    onLocationSelect,
                    setShowNotification
                  );
                }
              }}
              className="w-full border border-gray-300"
            >
              {selectedLocation && (
                <AdvancedMarker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
                  <Pin
                    background="#3D6B2C"
                    borderColor="#388E3C"
                    glyphColor="white"
                    scale={1.2}
                  />
                </AdvancedMarker>
              )}
            </Map>

            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#3D6B2C]" />
                  <span className="text-sm font-medium">Getting location details...</span>
                </div>
              </div>
            )}
          </div>

          {selectedLocation && (
            <LocationDetailsCard
              location={selectedLocation}
              copied={copied}
              setCopied={setCopied}
            />
          )}
        </APIProvider>
      </div>

      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center space-x-2">
            <Check size={16} />
            <span className="font-medium">Location Selected!</span>
          </div>
          <p className="text-sm">Location coordinates captured successfully</p>
          <button 
            onClick={() => setShowNotification(false)}
            className="absolute top-1 right-1 text-green-700 hover:text-green-900"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const LocationSearchComponent: React.FC<{
  searchValue: string;
  setSearchValue: (value: string) => void;
  predictions: google.maps.places.AutocompletePrediction[];
  setPredictions: (predictions: google.maps.places.AutocompletePrediction[]) => void;
  showPredictions: boolean;
  setShowPredictions: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onLocationSelect: (location: LocationData) => void;
  mapInstance: google.maps.Map | null;
}> = ({
  searchValue,
  setSearchValue,
  predictions,
  setPredictions,
  showPredictions,
  setShowPredictions,
  setIsLoading,
  onLocationSelect,
  mapInstance,
}) => {
  const places = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!places) return;
    
    setAutocompleteService(new places.AutocompleteService());
    if (mapInstance) {
      setPlacesService(new places.PlacesService(mapInstance));
    }
  }, [places, mapInstance]);

  const handleSearch = useCallback(
    (query: string) => {
      if (!autocompleteService || !query.trim()) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      const request = {
        input: query,
        types: ['establishment', 'geocode']
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    },
    [autocompleteService, setPredictions, setShowPredictions]
  );

  const handlePredictionSelect = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesService) return;

      setIsLoading(true);
      setShowPredictions(false);
      setSearchValue(prediction.description);

      const request = {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address', 'name']
      };

      placesService.getDetails(request, (place, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location: LocationData = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || prediction.description,
            placeId: prediction.place_id,
            formattedAddress: place.formatted_address
          };

          onLocationSelect(location);
          
          if (mapInstance) {
            mapInstance.panTo(location);
            mapInstance.setZoom(15);
          }
        }
      });
    },
    [placesService, setIsLoading, setShowPredictions, setSearchValue, onLocationSelect, mapInstance]
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-10 pr-10 py-3 border-2 border-[#3D6B2C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:border-transparent"
        />
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue('');
              setPredictions([]);
              setShowPredictions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showPredictions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handlePredictionSelect(prediction)}
            >
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-[#3D6B2C] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LocationDetailsCard: React.FC<{
  location: LocationData;
  copied: boolean;
  setCopied: (copied: boolean) => void;
}> = ({ location, copied, setCopied }) => {
  const copyCoordinates = () => {
    const coordsText = `${location.lat}, ${location.lng}`;
    navigator.clipboard.writeText(coordsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 bg-gradient-to-r from-green-50 to-orange-50 border border-green-200 rounded-md p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📍 Selected Location
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {location.address}
            </p>
          </div>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Captured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Latitude
            </p>
            <div className="flex items-center space-x-2">
              <Navigation size={14} className="text-[#3D6B2C]" />
              <span className="text-sm font-mono">
                {location.lat.toFixed(6)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Longitude
            </p>
            <div className="flex items-center space-x-2">
              <Navigation size={14} className="text-[#3D6B2C]" />
              <span className="text-sm font-mono">
                {location.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={copyCoordinates}
          className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
            copied 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-[#3D6B2C] hover:bg-[#388E3C] text-white'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Coordinates'}</span>
        </button>
      </div>
    </div>
  );
};

// Helper function for map click handling
const handleMapClick = async (
  latLng: google.maps.LatLngLiteral,
  setSelectedLocation: (location: LocationData) => void,
  setIsLoading: (loading: boolean) => void,
  onLocationSelect?: (location: LocationData) => void,
  setShowNotification?: (show: boolean) => void
) => {
  setIsLoading(true);
  
  const geocoder = new google.maps.Geocoder();
  const lat = latLng.lat;
  const lng = latLng.lng;

  try {
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results) {
          resolve(results);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });

    const location: LocationData = {
      lat,
      lng,
      address: result[0]?.formatted_address || `${lat}, ${lng}`,
      formattedAddress: result[0]?.formatted_address
    };

    setSelectedLocation(location);
    onLocationSelect?.(location);
    setShowNotification?.(true);
    setTimeout(() => setShowNotification?.(false), 3000);
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    const location: LocationData = {
      lat,
      lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    
    setSelectedLocation(location);
    onLocationSelect?.(location);
  } finally {
    setIsLoading(false);
  }
};

export default LocationPicker;