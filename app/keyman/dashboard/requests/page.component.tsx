"use client";
import { Container, Box, Text } from "@mantine/core";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequests } from "@/api/requests";
import RequestsTable from "@/components/requests/CustomerRequests";
import LoadingComponent from "@/lib/LoadingComponent";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getToken } from "@/providers/AppContext";
import RequestChatWidget from "@/components/requests/RequestChatWidget";

export default function RequestClientComponent() {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    data: requests,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer requests"],
    queryFn: async () => await getRequests(),
  });

  //console.log(requests, "__customer requests__");
  const _requests = React.useMemo(() => {
    if (requests?.requests?.data?.length > 0) {
      return requests?.requests?.data;
    } else return [];
  }, [requests]);
  const token = getToken();
  if (isError) return <p>Something went wrong, {error?.message}</p>;

  if (isLoading) return <LoadingComponent message="Getting your requests" />;
  return (
    <Container size="lg">
      <RequestChatWidget
        userToken={token ?? ""}
        isOpen={isOpen}
        handleToggle={() => setIsOpen((prev) => !prev)}
      />
      {_requests?.length > 0 ? (
        <RequestsTable requests={_requests} />
      ) : (
        <Box p="lg">
          <Text size="md" pb="md">
            You have not created any request
          </Text>
          <Link
            className="p-2 rounded-md bg-keyman-green hover:bg-keyman-accent-hover text-white"
            href={"/keyman/dashboard/requests/create-request"}
          >
            Create your first request
          </Link>
        </Box>
      )}

      {/* Beautiful Animated Floating Button */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-r from-keyman-green to-keyman-accent hover:from-keyman-accent hover:to-keyman-green rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-keyman-green/30"
          style={{
            background: "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)",
            boxShadow: "0 10px 25px rgba(61, 107, 44, 0.3)",
          }}
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

          {/* Animated Plus Icon */}
          <div className="flex items-center justify-center w-full h-full">
            <Plus
              size={24}
              className="text-white transform transition-transform duration-300 group-hover:rotate-90"
            />
          </div>

          {/* Floating Animation Keyframes */}
          <style jsx>{`
            @keyframes float {
              0%,
              100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-3px);
              }
            }

            button {
              animation: float 3s ease-in-out infinite;
            }

            button:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Pulsing Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-keyman-green to-keyman-accent rounded-full opacity-75 blur-sm animate-pulse"></div>
        </button>

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Create New Request
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
      </div>
    </Container>
  );
}
