"use client";
import React from "react";
import {
  Card,
  Badge,
  Group,
  Text,
  Button,
  Stack,
  Avatar,
  Divider,
  Box,
  ScrollArea,
} from "@mantine/core";
import {
  Phone,
  Mail,
  User,
  MessageCircle,
  Star,
  BadgeCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { SupplierCardProps, supplierTypeThemes } from "./types";

const theme = supplierTypeThemes.services;

const ServicesCard: React.FC<SupplierCardProps> = ({
  supplier,
  url,
  styles,
  index,
  onStartKeyContract,
  onCall,
  onRequestQuote,
}) => {
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="lg"
      style={{
        ...styles,
        border: `2px solid ${theme.borderLight}`,
        backgroundColor: theme.background,
        transition: "all 0.3s ease",
        cursor: "pointer",
        animationDelay: `${index * 100}ms`,
      }}
      className="hover:shadow-xl hover:scale-105"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.borderLight;
      }}
    >
      <Stack gap="md">
        {/* Type Badge */}
        <Group justify="space-between" align="center">
          <Badge
            size="sm"
            leftSection={<Wrench size={12} />}
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeColor,
            }}
          >
            Services
          </Badge>
        </Group>

        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Link href={`${url}${supplier.id}`}>
            <Avatar
              radius="md"
              style={{
                backgroundColor: theme.primaryLight,
                color: theme.primary,
              }}
              size={120}
              alt={supplier?.photo?.[0]}
              src={
                supplier?.photo && supplier?.photo?.length > 0
                  ? supplier?.photo?.[0]
                  : null
              }
            >
              {supplier?.photo && supplier?.photo?.length === 0 && <User />}
            </Avatar>
          </Link>

          <Badge
            color="orange"
            variant="light"
            size="sm"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.primary,
            }}
          >
            {supplier.keyman_number}
          </Badge>
        </Group>

        {/* Supplier Name */}
        <Link href={`${url}${supplier.id}`}>
          <Text
            size="lg"
            fw={600}
            style={{ color: "#1F2937", lineHeight: 1.3 }}
            lineClamp={2}
          >
            {supplier.name}{" "}
            {supplier && supplier?.is_user_verified > 0 && (
              <BadgeCheck
                size={28}
                fill={theme.primary}
                stroke="white"
                className="inline-block relative -top-1"
              />
            )}
          </Text>
        </Link>

        <Box>
          <Button
            fullWidth
            onClick={onStartKeyContract(supplier)}
            style={{ backgroundColor: theme.primary }}
          >
            Start KeyContract
          </Button>
        </Box>

        <Box style={{ height: 70 }}>
          <ScrollArea h={70} type="auto" scrollbarSize={4}>
            <Text size="sm" c="dimmed">
              {supplier.comments || "No description...."}
            </Text>
          </ScrollArea>
        </Box>

        <Divider color={theme.borderLight} />

        {/* Contact Info */}
        <Stack gap="xs" display={"none"}>
          <Group gap="xs">
            <Phone size={16} style={{ color: "#6B7280" }} />
            <Text size="sm" c="dimmed" style={{ fontSize: "0.875rem" }}>
              {supplier.phone}
            </Text>
          </Group>
          <Group gap="xs">
            <Mail size={16} style={{ color: "#6B7280" }} />
            <Text
              size="sm"
              c="dimmed"
              style={{ fontSize: "0.875rem" }}
              lineClamp={1}
            >
              {supplier.email}
            </Text>
          </Group>
        </Stack>

        {/* Rating Stars */}
        <Group justify="center" gap="xs" mt="md">
          {[...Array(5)].map((item, i) => (
            <Star
              size={20}
              key={i}
              fill={
                supplier?.supplier_rating !== null
                  ? i < Number(supplier?.supplier_rating)
                    ? theme.primary
                    : "transparent"
                  : i <= 0
                  ? theme.primary
                  : "transparent"
              }
              color={
                supplier?.supplier_rating !== null
                  ? i < Number(supplier?.supplier_rating)
                    ? theme.primary
                    : "gray"
                  : i <= 0
                  ? theme.primary
                  : "gray"
              }
            />
          ))}
        </Group>

        {/* Action Buttons */}
        <Group justify="apart" gap="xs" mt="md" display={"none"}>
          <Button
            variant="outline"
            size="sm"
            leftSection={<Phone size={16} />}
            onClick={() => onCall(supplier.phone)}
            style={{
              borderColor: theme.primary,
              color: theme.primary,
              flex: 1,
            }}
          >
            Call
          </Button>
          <Button
            size="sm"
            leftSection={<MessageCircle size={16} />}
            onClick={() => onRequestQuote(supplier)}
            style={{
              backgroundColor: theme.primary,
              flex: 1,
            }}
          >
            Quote
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default ServicesCard;
