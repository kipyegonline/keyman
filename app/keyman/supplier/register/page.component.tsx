"use client";
import { getUserDetails } from "@/api/registration";
import { getSupplierTypes } from "@/api/supplier";
import SupplierAlreadyRegistered from "@/components/supplier/AlreadyRegistered";
import SupplierRegistrationForm from "@/components/supplier/SupplierRegistrationForm";
import SupplierRegistrationLoading from "@/components/supplier/SupplierregistrationLoading";
import { navigateTo } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import React from "react";

export default function SupplierComponent() {
  const { data: supplierTypes } = useQuery({
    queryKey: ["supplierTypes"],
    queryFn: getSupplierTypes,
  });

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUserDetails,
  });
  const router = useRouter();
  const _user = React.useMemo(() => {
    if (data?.status) {
      return data?.user;
    }
    return null;
  }, [data]);
  const handleProceedToDashboard = () => {
    navigateTo();
    globalThis?.window?.localStorage.setItem(
      "supplier_id",
      _user?.supplier_details?.id
    );
    //setActiveItem("dashboard");
    router.push(`/keyman/supplier`);
  };
  const isNotRegistered = _user && _user?.supplier_details === null;
  return (
    <SupplierRegistrationForm
      supplierTypes={supplierTypes?.supplier}
      refresh={() => refetch()}
    />
  );
  if (isLoading) return <SupplierRegistrationLoading />;
  return (
    <div className="">
      {isNotRegistered ? (
        <SupplierRegistrationForm
          supplierTypes={supplierTypes?.supplier}
          refresh={() => refetch()}
        />
      ) : (
        <SupplierAlreadyRegistered
          onProceedToDashboard={handleProceedToDashboard}
          businessName={_user?.supplier_details?.name}
          supplierType={_user?.supplier_details?.type}
        />
      )}
    </div>
  );
}
