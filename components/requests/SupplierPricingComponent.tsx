import React from "react";
import { Flex, FileInput, NumberInput, Box, Button } from "@mantine/core";
import { RequestDeliveryItem } from "@/types";

type PricingProps = { id: string; price: number; quantity: number };

const PricingComponent: React.FC<{
  item: RequestDeliveryItem["items"][0];
  updateItemPrices: (item: PricingProps) => void;
}> = ({ item, updateItemPrices }) => {
  const [_item, setItem] = React.useState<null | PricingProps>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const handleQuote = () => {
    if (_item) {
      updateItemPrices({ ..._item, id: item?.id });
    }
  };

  return (
    <Box className=" flex flex-col gap-y-4 justify-between p-2">
      <Flex gap="md" direction={{ base: "column", md: "row" }}>
        {item.visual_confirmation_required === 1 && (
          <FileInput
            accept="image/png,image/jpeg, image/jpg"
            clearable
            value={file}
            onChange={setFile}
            placeholder="upload your image here"
            label="upload image"
          />
        )}{" "}
        <NumberInput
          size="sm"
          label="Quantity"
          w={{ base: "100%", md: 100 }}
          allowNegative={false}
          onChange={(val) => {
            if (_item !== null) {
              setItem({ ..._item, quantity: +val });
            } else {
              setItem({ quantity: +val, price: 0, id: item.id });
            }
          }}
          required
          description=""
          max={parseInt(item?.quantity)}
        />
        <NumberInput
          size="sm"
          label="Unit price"
          allowNegative={false}
          onChange={(val) => {
            if (_item !== null) {
              setItem({ ..._item, price: +val });
            } else {
              setItem({ price: +val, quantity: 0, id: item.id });
            }
          }}
          required
          w={{ base: "100%", md: 100 }}
        />
      </Flex>

      <Button onClick={handleQuote}>Send Quote</Button>
    </Box>
  );
};
export default PricingComponent;
