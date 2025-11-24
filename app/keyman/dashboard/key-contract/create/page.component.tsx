"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ContractWizard from "@/components/contract/ContractWizard";
import { useQuery } from "@tanstack/react-query";
import { getSupplierDetails } from "@/api/supplier";

export default function CreateContractPage() {
  const searchParams = useSearchParams();
  const [keymanId, setKeymanId] = useState<string | null>(null);

  useEffect(() => {
    const keymanIdParam = searchParams.get("keyman_id");
    if (keymanIdParam) {
      setKeymanId(keymanIdParam);
    }
  }, [searchParams]);

  const { data: supplier } = useQuery({
    queryKey: ["supplier", keymanId],
    queryFn: async () => getSupplierDetails(keymanId!),
    enabled: !!keymanId,
  });
  const _supplier = React.useMemo(() => {
    if (supplier?.supplier) {
      return supplier.supplier;
    } else return null;
  }, [supplier]);
  return <ContractWizard supplier={_supplier} />;
}
