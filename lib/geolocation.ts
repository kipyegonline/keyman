interface Coordinates {
  lat: number;
  lng: number;
}

interface DetailedCoordinates extends Coordinates {
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error: GeolocationPositionError) => {
        // Handle different error cases
        let errorMessage: string =
          "Unable to retrieve your location. Try again later.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  });
};

// Advanced version with more options and detailed return data
const getCurrentLocationAdvanced = (
  options: GeolocationOptions = {}
): Promise<DetailedCoordinates> => {
  const defaultOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 600000,
  };

  const finalOptions: PositionOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const {
          latitude,
          longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
        } = position.coords;

        resolve({
          lat: latitude,
          lng: longitude,
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
          timestamp: position.timestamp,
        });
      },
      (error: GeolocationPositionError) => {
        reject(error);
      },
      finalOptions
    );
  });
};

export const getDetailedLocation = async (): Promise<void> => {
  try {
    const location: DetailedCoordinates = await getCurrentLocationAdvanced({
      enableHighAccuracy: true,
      timeout: 5000,
    });
    console.log("Detailed location:", location);
  } catch (error) {
    if (error instanceof GeolocationPositionError) {
      console.error("Geolocation error code:", error.code);
      console.error("Geolocation error message:", error.message);
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
};

// Export the functions and types
export { getCurrentLocation, getCurrentLocationAdvanced };
export type { Coordinates, DetailedCoordinates, GeolocationOptions };
