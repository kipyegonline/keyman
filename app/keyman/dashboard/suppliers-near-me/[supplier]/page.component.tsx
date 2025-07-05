"use client";

import { getSupplierDetails, getSupplierPriceList } from "@/api/supplier";
import { Pricelist, PricelistItem } from "@/components/supplier/priceList";
import SupplierProfile from "@/components/supplier/SupplierProfile";
import LoadingComponent from "@/lib/LoadingComponent";
import { Breadcrumbs, Grid, Box, Pagination } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

export default function SupplierClientComponent({
  supplierId,
}: {
  supplierId: string;
}) {
  const [current, setCurrent] = React.useState(0);
  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => getSupplierDetails(supplierId),
    enabled: !!supplierId,
  });
  const { data: priceList } = useQuery({
    queryKey: ["pricelist", supplierId],
    queryFn: async () => getSupplierPriceList(supplierId),
    enabled: !!supplierId,
  });

  const _supplier = React.useMemo(() => {
    if (supplier?.supplier) {
      return supplier.supplier;
    } else return null;
  }, [supplier]);
  const _priceList = React.useMemo(() => {
    if (priceList?.price_list) {
      return priceList.price_list as Pricelist[];
    } else return [];
  }, [priceList]);

  const perPage = 25;

  const total = Math.ceil(_priceList?.length / perPage);

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
          {_supplier?.name ?? "supplier"}
        </Link>
      </Breadcrumbs>
      <div className="max-w-4xl mx-auto p-4">
        {_supplier ? <SupplierProfile supplier={_supplier} /> : null}
        <div>
          <h2 className="text-2xl font-semibold my-4 mb-2">
            Price List for {_supplier?.name ?? "Supplier"}
          </h2>
          {_priceList && _priceList.length > 0 ? (
            <>
              <Grid>
                {_priceList.map((item, index) => (
                  <PricelistItem
                    item={item}
                    index={index}
                    key={item.id}
                    hideControls={true}
                    handleEditClick={() => null}
                  />
                ))}
              </Grid>
              <Box my="md">
                {_priceList.length > perPage && (
                  <Pagination
                    total={total}
                    onChange={(num) => setCurrent(num - 1)}
                    value={current + 1}
                  />
                )}
              </Box>
            </>
          ) : (
            <div className=" text-gray-500">No price list available</div>
          )}
        </div>
      </div>
    </div>
  );
}
