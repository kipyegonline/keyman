import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Route,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  features: Array<{
    properties: {
      distance: number;
      time: number;
      mode: string;
    };
  }>;
}

const DistanceCalculator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);

  // Predefined destination coordinates (example: Nairobi CBD)
  const destinations: Coordinates = {
    lat: -1.2864,
    lng: 36.8172,
  };

  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY as string;

  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  };

  const calculateDistance = async () => {
    setIsLoading(true);
    setError(null);
    setDistance(null);
    setDuration(null);

    try {
      // Get user's current location
      const currentLocation = await getCurrentLocation();
      setUserLocation(currentLocation);

      // Call Geoapify Routing API
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${currentLocation.lat},${currentLocation.lng}|${destination?.lat},${destination?.lng}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: RouteResponse = await response.json();

      if (data.features && data.features.length > 0) {
        const route = data.features[0].properties;
        setDistance(route.distance);
        setDuration(route.time);
      } else {
        throw new Error("No route found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100 p-4 flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #f0f9ff 0%, #fff7ed 50%, #f0fdf4 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
              }}
            >
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #3D6B2C 0%, #388E3C 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              Distance Calculator
            </h1>
            <p className="text-gray-600 mt-2">
              Find the distance to your destination
            </p>
          </div>

          {/* Destination Info */}
          <div
            className="rounded-2xl p-4 mb-6 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(61, 107, 44, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)",
              borderColor: "rgba(61, 107, 44, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#3D6B2C" }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Destination</p>
                <p className="text-sm text-gray-600">
                  {destination?.lat.toFixed(4)}, {destination?.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={calculateDistance}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-lg transform transition-all duration-300 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            }`}
            style={
              !isLoading
                ? {
                    background:
                      "linear-gradient(135deg, #F08C23 0%, #3D6B2C 100%)",
                  }
                : {}
            }
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #e07a1a 0%, #2d5121 100%)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #F08C23 0%, #3D6B2C 100%)";
              }
            }}
          >
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  <span>Calculate Distance</span>
                </>
              )}
            </div>
          </button>

          {/* Results */}
          {(distance !== null || error || userLocation) && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {userLocation && (
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(56, 142, 60, 0.2) 100%)",
                    borderColor: "rgba(56, 142, 60, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: "#388E3C" }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "#3D6B2C" }}>
                        Your Location
                      </p>
                      <p className="text-sm" style={{ color: "#388E3C" }}>
                        {userLocation.lat.toFixed(4)},{" "}
                        {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {distance !== null && duration !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(61, 107, 44, 0.1) 0%, rgba(61, 107, 44, 0.15) 100%)",
                      borderColor: "rgba(61, 107, 44, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Route className="w-5 h-5" style={{ color: "#3D6B2C" }} />
                      <span
                        className="font-semibold"
                        style={{ color: "#3D6B2C" }}
                      >
                        Distance
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#3D6B2C" }}
                    >
                      {formatDistance(distance)}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(240, 140, 35, 0.1) 0%, rgba(240, 140, 35, 0.15) 100%)",
                      borderColor: "rgba(240, 140, 35, 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5" style={{ color: "#F08C23" }} />
                      <span
                        className="font-semibold"
                        style={{ color: "#F08C23" }}
                      >
                        Duration
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "#F08C23" }}
                    >
                      {formatDuration(duration)}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-800">Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Make sure to replace the API key with your actual Geoapify API key
          </p>
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;
