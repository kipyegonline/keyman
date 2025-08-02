"use client";
import React from "react";
import SupplierDashboard from "@/components/supplier/LandingPage";

import { useQuery } from "@tanstack/react-query";
import { getSupplierDetails } from "@/api/supplier";
import { SupplierDetails } from "@/types";
import LoadingComponent from "@/lib/LoadingComponent";
import { Alert, Text } from "@mantine/core";
import { getBalance } from "@/api/coin";

export default function SupplierComponentDashboard() {
  const supplierId = globalThis?.window?.localStorage.getItem(
    "supplier_id"
  ) as string;

  const {
    data: supplier,
    isLoading,

    refetch,
  } = useQuery({
    queryKey: [supplierId],
    queryFn: async () => await getSupplierDetails(supplierId),
  });

  const { data: balance } = useQuery({
    queryKey: ["balance", supplierId],
    queryFn: async () => await getBalance(supplierId, true),
  });

  const supplierDetails = React.useMemo(() => {
    if (supplier?.supplier) return supplier?.supplier as SupplierDetails;
    else return null;
  }, [supplier]);

  //console.log(supplier, isError, error, isLoading);

  if (isLoading)
    return <LoadingComponent message="Fetching supplier details" />;
  return (
    <div className=" px-0">
      {supplier?.status === false && (
        <Alert variant="light" color="orange" title="Error">
          <Text>{supplier?.message}</Text>
          <button
            onClick={() => refetch()}
            className="px-2 py-1 mt-2 border border-keyman-orange rounded-md  "
          >
            Try again
          </button>
        </Alert>
      )}
      {supplierDetails ? (
        <SupplierDashboard
          supplierDetails={supplierDetails}
          balance={balance?.balance}
        />
      ) : null}
    </div>
  );
}
