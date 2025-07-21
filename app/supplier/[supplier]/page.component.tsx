"use client";

import { getProjects } from "@/api/projects";
import { createRequest } from "@/api/requests";
import { getSupplierDetails, getSupplierPriceList } from "@/api/supplier";
import {
  PublicPriceList,
  WholePriceList,
} from "@/components/supplier/priceList";
import { CartModal } from "@/components/supplierProfilePublic/CartModal";
import { PublicPricelistItem } from "@/components/supplierProfilePublic/priceListItem";
import SupplierProfile from "@/components/supplierProfilePublic/profile";
import { getCurrentLocation } from "@/lib/geolocation";
import LoadingComponent from "@/lib/LoadingComponent";
import { notify } from "@/lib/notifications";
import { ICartItem, useCart } from "@/providers/CartContext";
import { CreateRequestPayload } from "@/types/requests";
import { Project } from "@/types";
import { Breadcrumbs, Grid, Box, Pagination, Flex } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { login } from "@/api/registration";
/*eslint-disable*/

const checkGuest = () => {
  return globalThis?.window?.localStorage.getItem("keyman_user");
};
const tokenName = "auth_token";

export default function SupplierClientComponent({
  supplierId,
}: {
  supplierId: string;
}) {
  const [current, setCurrent] = React.useState(0);
  const [cartSpinner, setCartSpinner] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [, setSuccessMessage] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  const isGuest = !!!checkGuest();

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
      return priceList.price_list as WholePriceList[];
    } else return [];
  }, [priceList]);
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      return await getProjects();
    },
    enabled: !!isGuest,
  });

  const perPage = 25;

  const total = Math.ceil(_priceList?.length / perPage);
  const resetGuestState = () => {
    setDate("");
    setLocation("");
    setEmail("");
    setPhone("");
    clearCart();
    localStorage.removeItem(tokenName);
  };

  const handleCheckout = async () => {
    let selectedLocation;
    if (!isGuest) {
      selectedLocation = locations?.projects?.find(
        (loc: Project) => loc.id === location
      );
    } else {
      selectedLocation = await getCurrentLocation();
      const result = await login(
        process.env.NEXT_PUBLIC_GUEST_EMAIL as string,
        process.env.NEXT_PUBLIC_GUEST_PASSWORD as string
      );
      localStorage.setItem("auth_token", result?.token ?? "");
    }

    // validate gues fields
    if (isGuest) {
      if (email.trim().length < 7) {
        notify.error("Email is required");
        return;
      }
      if (phone.trim().length < 7) {
        notify.error("Phone is required");
        return;
      }
      if (!selectedLocation) {
        notify.error("Kindly enable your location");
        return;
      }
    }
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
    let ltd, lng;
    if (isGuest) {
      ltd = selectedLocation?.lat;
      lng = selectedLocation.lng;
    } else {
      lng = selectedLocation?.location?.coordinates[0];
      ltd = selectedLocation?.location?.coordinates[1];
    }

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
      ks_number: _supplier?.ks_number ?? "",
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
          if (isGuest) {
            resetGuestState();
          }
          setCartSpinner(false);
        }, 3000);
        setSuccessMessage(`Request created successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
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

  if (isLoading)
    return <LoadingComponent message="Loading supplier details..." />;
  return (
    <div className=" max-w-full">
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
        email={email}
        setEmail={(email: string) => setEmail(email)}
        phone={phone}
        setPhone={(phone: string) => setPhone(phone)}
        setLocation={(location) => setLocation(location)}
        location={location}
        projects={locations?.projects ?? []}
        isGuest={isGuest}
      />
      <Breadcrumbs separator="/" className="!hidden">
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
      <div className=" p-4 ">
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            {" "}
            <div>
              <h2 className="text-2xl font-semibold my-4 mb-2">Price List</h2>
              {_priceList && _priceList.length > 0 ? (
                <>
                  <Flex className="" wrap="wrap" gap="md">
                    {_priceList.map((item, index) => (
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
                  </Flex>
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
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            {_supplier ? <SupplierProfile supplier={_supplier} /> : null}
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
