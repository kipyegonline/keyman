"use client";

import React, { useEffect, useState } from "react";
import MainContent from "@/components/dashboard/content";
import KeymanBanner from "@/components/Banner";
import { useQuery } from "@tanstack/react-query";
import { getBannerssNearMe, getSuppliersNearMe } from "@/api/requests";
import { ISupplierContact } from "@/components/supplier/profiles/types";

export default function UserDashboardComponent() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { data: _banners } = useQuery({
    queryKey: ["banners_near_me"],
    queryFn: async () =>
      getBannerssNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0),
    enabled: !!userLocation,
  });

  const { data: _nearbySuppliers } = useQuery({
    queryKey: [
      "dashboard_stores_near_me",
      userLocation?.lat,
      userLocation?.lng,
    ],
    queryFn: async () =>
      getSuppliersNearMe(userLocation?.lat ?? 0, userLocation?.lng ?? 0),
    enabled: !!userLocation,
    refetchOnWindowFocus: false,
  });

  const nearbyStores = React.useMemo<ISupplierContact[]>(() => {
    if (_nearbySuppliers?.suppliers?.length > 0) {
      return _nearbySuppliers.suppliers;
    }
    return [];
  }, [_nearbySuppliers]);
  // Get user location on component mount
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        //setLocationError("Geolocation is not supported by this browser");
        //setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // setLoading(false);
        },
        (error) => {
          console.log(error);
          /* setLocationError(
            "Unable to retrieve your location. Try again later."
          );*/
          //  setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        },
      );
    };

    getCurrentLocation();
  }, []);

  const banners = React.useMemo(() => {
    if (_banners?.adverts?.length > 0) {
      return _banners?.adverts;
    }
    return [];
  }, [_banners]);

  return (
    <div>
      <KeymanBanner banners={banners} />

      <MainContent stores={nearbyStores} />
    </div>
  );
}
