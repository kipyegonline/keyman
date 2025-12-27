"use client";
import { Select, Group, Text, ThemeIcon, Stack, Box } from "@mantine/core";
import { Smartphone } from "lucide-react";
import { forwardRef } from "react";

export interface MobileMoneyOperator {
  value: string;
  label: string;
  description: string;
  placeholder: string;
}

export const mobileMoneyOperators: MobileMoneyOperator[] = [
  {
    value: "mpesa",
    label: "M-Pesa",
    description: "Send to M-Pesa mobile number",
    placeholder: "254712345678",
  },
  {
    value: "airtel",
    label: "Airtel Money",
    description: "Send to Airtel Money mobile number",
    placeholder: "254733000000",
  },
  {
    value: "t_kash",
    label: "T-Kash",

    description: "Send to T-Kash mobile number",
    placeholder: "254733000000",
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={32} radius="md" variant="light" color="green">
          <Smartphone size={16} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        </Stack>
      </Group>
    </div>
  )
);

SelectItem.displayName = "SelectItem";

interface MobileMoneyOperatorSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const MobileMoneyOperatorSelect: React.FC<MobileMoneyOperatorSelectProps> = ({
  value,
  onChange,
  label = "Mobile Money Operator",
  placeholder = "Select operator",
  error,
  required = false,
  disabled = false,
  size = "sm",
  className,
}) => {
  const selectData = mobileMoneyOperators.map((operator) => ({
    value: operator.value,
    label: operator.label,
    description: operator.description,
  }));

  return (
    <Box className={className}>
      <Select
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data={selectData}
        leftSection={<Smartphone size={16} />}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        allowDeselect={false}
        renderOption={({ option }) => {
          const operator = mobileMoneyOperators.find(
            (op) => op.value === option.value
          );
          return (
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon size={32} radius="md" variant="light" color="green">
                <Smartphone size={16} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {option.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {operator?.description}
                </Text>
              </Stack>
            </Group>
          );
        }}
        styles={{
          input: {
            borderColor: value ? "#3D6B2C" : undefined,
          },
        }}
      />
    </Box>
  );
};

export default MobileMoneyOperatorSelect;

// Helper function to get operator details by value
export const getOperatorByValue = (
  value: string
): MobileMoneyOperator | undefined => {
  return mobileMoneyOperators.find((op) => op.value === value);
};
