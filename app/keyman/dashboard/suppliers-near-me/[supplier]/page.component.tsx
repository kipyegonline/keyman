"use client";

import { getSupplierDetails } from "@/api/supplier";
import SupplierProfile from "@/components/supplier/SupplierProfile";
import LoadingComponent from "@/lib/LoadingComponent";
import { Breadcrumbs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

export default function SupplierClientComponent({
  supplierId,
}: {
  supplierId: string;
}) {
  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => getSupplierDetails(supplierId),
    enabled: !!supplierId,
  });
  console.log(supplier, "supplier");
  const _supplier = React.useMemo(() => {
    if (supplier?.supplier) {
      return supplier.supplier;
    } else return null;
  }, [supplier]);
  if (isLoading)
    return <LoadingComponent message="Loading supplier details..." />;
  return (
    <div>
      <Breadcrumbs separator="/">
        <Link
          href="/keyman/dashboard/suppliers-near-me"
          className="text-keyman-green"
        >
          Suppliers
        </Link>
        <Link href="/" inert>
          Supplier details {supplier?.name ?? ""}
        </Link>
      </Breadcrumbs>
      <div>{_supplier ? <SupplierProfile supplier={_supplier} /> : null}</div>
    </div>
  );
}
