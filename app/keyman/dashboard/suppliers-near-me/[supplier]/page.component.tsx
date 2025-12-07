"use client";

import { getProjects } from "@/api/projects";
import { createRequest } from "@/api/requests";
import { getSupplierDetails, getSupplierPriceList } from "@/api/supplier";
import {
  PublicPriceList,
  WholePriceList,
} from "@/components/supplier/priceList";
import SupplierProfile from "@/components/supplier/SupplierProfile";
import { CartModal } from "@/components/supplierProfilePublic/CartModal";
import { PublicPricelistItem } from "@/components/supplierProfilePublic/priceListItem";
import LoadingComponent from "@/lib/LoadingComponent";
import { notify } from "@/lib/notifications";
import { CreateRequestPayload } from "@/types/requests";
import { useCart, ICartItem } from "@/providers/CartContext";
import { Breadcrumbs, Grid, Box, Pagination } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { Project } from "@/types";
import { useAppContext } from "@/providers/AppContext";
/*eslint-disable*/

export default function SupplierClientComponent({
  supplierId,
}: {
  supplierId: string;
}) {
  const [current, setCurrent] = React.useState(0);
  const [cartSpinner, setCartSpinner] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const { setVerified } = useAppContext();
  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => getSupplierDetails(supplierId),
    enabled: !!supplierId,
  });
  console.log(supplier, "supplier");
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
      return priceList.price_list as WholePriceList[];
    } else return [];
  }, [priceList]);
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      return await getProjects();
    },
  });

  React.useEffect(() => {
    if (supplier) {
      setVerified(supplier?.supplier?.is_user_verified ?? 0);
    }
  }, [supplier]);
  const {
    addToCart,
    cart,

    updateQuantity,
    getItemQuantity,
    clearCart,
    isItemInCart,
    modalOpen: cartModalOpened,
    setModalOpen: setCartModalOpened,
  } = useCart();

  const perPage = 9;

  const total = Math.ceil(_priceList?.length / perPage);
  const handleCheckout = async () => {
    const selectedLocation = locations?.projects?.find(
      (loc: Project) => loc.id === location
    );

    const items = cart.items.map((cartItem) => ({
      ...cartItem,
      item_id: cartItem.item_id,
      description: "",
      visual_confirmation_required: 0,
    }));

    if (!selectedLocation) {
      notify.error("Looks like you did not add a delivery location ");
      return;
    }
    if (!date) {
      notify.error("Looks like you did not add a delivery date ");
      return;
    }
    const lng = selectedLocation?.location?.coordinates[0];
    const ltd = selectedLocation?.location?.coordinates[1];

    for (const item of items) {
      if ("photo" in item) {
        //@ts-ignore
        delete item?.["photo"];
      }
    }

    const payload: CreateRequestPayload = {
      status: "SUBMITTED",
      delivery_date: date ?? "",
      latitude: ltd,
      longitude: lng,
      ks_number: _supplier?.keyman_number ?? "",
      supplier_id: _supplier?.id,
      created_from: "items",
      //@ts-expect-error
      items,
    };

    setCartSpinner(true);
    try {
      const response = await createRequest(payload);

      if (response.status) {
        notify.success("Request created successfully");
        //resetState();
        setTimeout(() => {
          setCartModalOpened(false);

          resetState();

          setCartSpinner(false);
        }, 3000);
      } else {
        notify.error("Something went wrong. Try again later.");
      }
    } catch (err) {
      notify.error("Failed to submit request. Please try again.");
      console.log(err);
    } finally {
      setCartSpinner(!true);
    }
  };
  const resetState = () => {
    clearCart();
    setDate("");
    setLocation("");
    // setCurrent(0);
  };

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

      <CartModal
        cartModalOpened={cartModalOpened}
        setCartModalOpened={() => setCartModalOpened(false)}
        cart={cart}
        cartSpinner={cartSpinner}
        handleCheckout={handleCheckout}
        //projects={_supplier?.projects}
        refreshLocation={() => {
          setCurrent(0);
        }}
        date={date}
        setDate={(date) => {
          setDate(date);
        }}
        email={""}
        setEmail={(email: string) => console.log(email)}
        phone={""}
        setPhone={(phone: string) => console.log(phone)}
        setLocation={(location) => setLocation(location)}
        location={location}
        projects={locations?.projects ?? []}
        isGuest={false}
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          {" "}
          {_supplier ? <SupplierProfile supplier={_supplier} /> : null}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <div className="">
            <h2 className="text-2xl font-semibold my-4 mb-2">
              Price List for {_supplier?.name ?? "Supplier"}
            </h2>

            {_priceList && _priceList.length > 0 ? (
              <div>
                <div className="flex flex-wrap justify-start  gap-4 ">
                  {_priceList
                    .slice(current * perPage, current * perPage + perPage)
                    .map((item, index) => (
                      <PublicPricelistItem
                        item={item as PublicPriceList}
                        index={index}
                        key={item.id}
                        handleAddCart={() =>
                          addToCart(item as ICartItem & WholePriceList)
                        }
                        handleIncreaseQuantity={() => {
                          const currentQty = getItemQuantity(item.id as string);
                          updateQuantity(item.id as string, currentQty + 1);
                        }}
                        handleDecreaseQuantity={() => {
                          const currentQty = getItemQuantity(item.id as string);
                          updateQuantity(item.id as string, currentQty - 1);
                        }}
                        isInCart={isItemInCart(item.id as string)}
                        cartQuantity={getItemQuantity(item.id as string)}
                      />
                    ))}
                </div>

                <Box my="md">
                  {_priceList.length > perPage && (
                    <Pagination
                      total={total}
                      onChange={(num) => setCurrent(num - 1)}
                      value={current + 1}
                    />
                  )}
                </Box>
              </div>
            ) : (
              <div className=" text-gray-500">No price list available</div>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
}
