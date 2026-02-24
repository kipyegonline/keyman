"use client";
import React from "react";
import { Card, Avatar, Text, Box, Badge, Anchor } from "@mantine/core";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import {
  ISupplierContact,
  getSupplierTheme,
} from "@/components/supplier/profiles/types";
import { useAppContext } from "@/providers/AppContext";

interface StoreCardProps {
  store: ISupplierContact;
  url?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  url = "/keyman/dashboard/suppliers-near-me/",
}) => {
  const theme = getSupplierTheme(store.type);
  const { setActiveItem } = useAppContext();

  const avatarSrc =
    store.photo && store.photo.length > 0 ? store.photo[0] : undefined;

  const initials = store.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const handleClick = () => {
    setActiveItem("suppliers-near-me");
  };
  return (
    <Link
      href={`${url}${store.id}`}
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <Card
        padding="md"
        radius="md"
        shadow="xs"
        style={{
          borderLeft: `4px solid ${theme.primary}`,
          backgroundColor: theme.background,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer",
          height: "100%",
        }}
        className="hover:shadow-md hover:scale-[1.02]"
      >
        {/* Logo + Name row */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <Avatar
            src={avatarSrc}
            radius="sm"
            size={48}
            style={{
              backgroundColor: theme.primaryLight,
              color: theme.primary,
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {!avatarSrc ? initials : undefined}
          </Avatar>

          <Box style={{ minWidth: 0, flex: 1 }}>
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <Text
                fw={700}
                size="sm"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  color: theme.primary,
                }}
              >
                {store.name}
              </Text>
              {!!store.is_user_verified && (
                <BadgeCheck size={14} color={theme.primary} />
              )}
            </Box>
            <Badge
              size="xs"
              variant="light"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeColor,
                marginTop: 2,
              }}
            >
              {store.type?.replace("_", " ") ?? "store"}
            </Badge>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          style={{
            height: 1,
            backgroundColor: theme.borderLight,
            marginBottom: 8,
          }}
        />

        {/* Description */}
        {store.comments ? (
          <Text size="xs" c="dimmed" lineClamp={2} style={{ lineHeight: 1.5 }}>
            {store.comments}
          </Text>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            No description available.
          </Text>
        )}

        {/* View link */}
        <Anchor
          size="xs"
          mt={8}
          display="block"
          style={{ color: theme.primary, fontWeight: 600 }}
          component="span"
        >
          View Store →
        </Anchor>
      </Card>
    </Link>
  );
};

export default StoreCard;
