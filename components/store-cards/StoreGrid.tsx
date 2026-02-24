"use client";
import React from "react";
import { Grid, Title, Box, Text, Anchor } from "@mantine/core";
import { Store } from "lucide-react";
import Link from "next/link";
import StoreCard from "./StoreCard";
import { ISupplierContact } from "@/components/supplier/profiles/types";

interface StoreGridProps {
  stores: ISupplierContact[];
  url?: string;
  title?: string;
  /** Max number of stores to display. Defaults to 16 (4 rows × 4 cols) */
  limit?: number;
  browseUrl?: string;
  /** When provided, shown instead of rendering nothing on empty results */
  emptyMessage?: string;
}

const StoreGrid: React.FC<StoreGridProps> = ({
  stores,
  url = "/keyman/dashboard/suppliers-near-me/",
  title = "Stores Near You",
  limit = 16,
  browseUrl = "/keyman/dashboard/suppliers-near-me",
  emptyMessage,
}) => {
  if (!stores || stores.length === 0) {
    if (!emptyMessage) return null;
    return (
      <Box mb="xl">
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Store size={18} color="#3D6B2C" />
          <Title order={4} style={{ color: "#3D6B2C" }}>
            {title}
          </Title>
        </Box>
        <Text size="sm" c="dimmed" fs="italic">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  const visible = stores.slice(0, limit);

  return (
    <Box mb="xl">
      {/* Section heading */}
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Store size={18} color="#3D6B2C" />
          <Title order={4} style={{ color: "#3D6B2C" }}>
            {title}
          </Title>
        </Box>

        {stores.length > limit && (
          <Link href={browseUrl} style={{ textDecoration: "none" }}>
            <Anchor size="sm" style={{ color: "#F08C23", fontWeight: 600 }}>
              See all {stores.length} stores →
            </Anchor>
          </Link>
        )}
      </Box>

      {/* Grid */}
      <Grid gutter={{ base: "sm", md: "md" }}>
        {visible.map((store, index) => (
          <Grid.Col key={store.id ?? index} span={{ base: 12, sm: 4, lg: 3 }}>
            <StoreCard store={store} url={url} />
          </Grid.Col>
        ))}
      </Grid>

      {stores.length > limit && (
        <Text size="xs" c="dimmed" mt={6} ta="right">
          Showing {visible.length} of {stores.length} nearby stores
        </Text>
      )}
    </Box>
  );
};

export default StoreGrid;
