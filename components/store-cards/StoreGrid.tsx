"use client";
import React, { useState } from "react";
import {
  Grid,
  Title,
  Box,
  Text,
  Anchor,
  Pagination,
  TextInput,
} from "@mantine/core";
import { Store, Search } from "lucide-react";
import Link from "next/link";
import StoreCard from "./StoreCard";
import { ISupplierContact } from "@/components/supplier/profiles/types";

interface StoreGridProps {
  stores: ISupplierContact[];
  url?: string;
  title?: string;
  /** Max number of stores to display per page. Defaults to 16 (4 rows × 4 cols) */
  limit?: number;
  browseUrl?: string;
  /** When provided, shown instead of rendering nothing on empty results */
  emptyMessage?: string;
  /** Enable pagination instead of the "See all" link. Defaults to false */
  paginate?: boolean;
  /** Show a search input that filters stores by name. Defaults to false */
  searchable?: boolean;
}

const StoreGrid: React.FC<StoreGridProps> = ({
  stores,
  url = "/keyman/dashboard/suppliers-near-me/",
  title = "Stores Near You",
  limit = 16,
  browseUrl = "/keyman/dashboard/suppliers-near-me",
  emptyMessage,
  paginate = false,
  searchable = false,
}) => {
  const [activePage, setActivePage] = useState(1);
  const [query, setQuery] = useState("");

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

  const filtered =
    searchable && query.trim()
      ? stores.filter((s) =>
          [s.name, s.keyman_number, s.comments]
            .filter(Boolean)
            .some((field) =>
              field!.toLowerCase().includes(query.trim().toLowerCase()),
            ),
        )
      : stores;

  const totalPages = Math.ceil(filtered.length / limit);
  const pageStart = paginate ? (activePage - 1) * limit : 0;
  const visible = filtered.slice(pageStart, pageStart + limit);

  return (
    <Box mb="xl">
      {/* Section heading */}
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Store size={18} color="#3D6B2C" />
          <Title order={4} style={{ color: "#3D6B2C" }}>
            {title}
          </Title>
        </Box>

        {stores.length > limit && !paginate && !searchable && (
          <Link href={browseUrl} style={{ textDecoration: "none" }}>
            <Anchor size="sm" style={{ color: "#F08C23", fontWeight: 600 }}>
              See all {stores.length} stores →
            </Anchor>
          </Link>
        )}
      </Box>

      {/* Search input */}
      {searchable && (
        <TextInput
          placeholder="Search stores by name…"
          leftSection={<Search size={14} />}
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setActivePage(1);
          }}
          mb="sm"
          size="sm"
          radius="md"
          styles={{
            input: { borderColor: "#3D6B2C" },
          }}
        />
      )}

      {/* Grid */}
      <Grid gutter={{ base: "sm", md: "md" }}>
        {visible.map((store, index) => (
          <Grid.Col
            key={store.id ?? index}
            span={{ base: 12, xs: 6, sm: 4, lg: 3 }}
          >
            <StoreCard store={store} url={url} />
          </Grid.Col>
        ))}
      </Grid>

      {searchable && query.trim() ? (
        <Text size="xs" c="dimmed" mt={6} ta="right">
          {filtered.length === 0
            ? `No stores matched "${query.trim()}"`
            : `Showing ${visible.length} of ${filtered.length} result${filtered.length !== 1 ? "s" : ""} (${stores.length} total)`}
        </Text>
      ) : (
        stores.length > limit && (
          <Text size="xs" c="dimmed" mt={6} ta="right">
            Showing {visible.length} of {stores.length} nearby stores
          </Text>
        )
      )}

      {paginate && totalPages > 1 && (
        <Box
          mt="md"
          style={{
            display: "flex",
            justifyContent: "center",
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="#3D6B2C"
            size="sm"
            siblings={1}
            boundaries={1}
            withEdges
          />
        </Box>
      )}
    </Box>
  );
};

export default StoreGrid;
