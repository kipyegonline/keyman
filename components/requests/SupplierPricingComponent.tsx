import React from "react";
import { Flex, FileInput, NumberInput, Box, Button } from "@mantine/core";
import { RequestDeliveryItem } from "@/types";
import { notify } from "@/lib/notifications";

type PricedProps = {
  price?: number;
  quan?: number;
  checked?: boolean;
  id?: string;
  file: File | null;
};

const PricingComponent: React.FC<{
  item: RequestDeliveryItem["items"][0];
  updateItemPrices: (item: PricedProps) => void;
}> = ({ item, updateItemPrices }) => {
  const [_item, setItem] = React.useState<null | PricedProps>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const imageRequired = item.visual_confirmation_required === 1;
  const handleQuote = () => {
    if (item.visual_confirmation_required === 1) {
      if (file === null) {
        notify.error("Kindly attach image for the item");
      }
    }

    if (_item) {
      updateItemPrices({ ..._item, id: item?.id, file: file });
    }
  };

  return (
    <Box className=" flex flex-col gap-y-4 justify-between p-2">
      <Flex gap="md" direction={{ base: "column", md: "row" }}>
        {imageRequired && (
          <FileInput
            accept="image/png,image/jpeg, image/jpg"
            clearable
            required
            value={file}
            w={{ base: "100%", md: 100 }}
            onChange={setFile}
            placeholder="upload  image item here"
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
              setItem({ ..._item, quan: +val });
            } else {
              setItem({ quan: +val, price: 0, id: item.id });
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
              setItem({ price: +val, quan: 0, id: item.id });
            }
          }}
          required
          w={{ base: "100%", md: 100 }}
        />
      </Flex>

      <Button onClick={handleQuote}>Add Quote</Button>
    </Box>
  );
};
export default PricingComponent;
