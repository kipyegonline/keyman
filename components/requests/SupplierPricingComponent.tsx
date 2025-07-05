import React from "react";
import {
  Flex,
  FileInput,
  NumberInput,
  Box,
  Button,
  ActionIcon,
} from "@mantine/core";
import { RequestDeliveryItem } from "@/types";
import { notify } from "@/lib/notifications";
import { FilePenLine } from "lucide-react";

type PricedProps = {
  price?: number;
  quan?: number;
  checked?: boolean;
  id?: string;
  file?: File | null;
};

const PricingComponent: React.FC<{
  item: RequestDeliveryItem["items"][0];
  updateItemPrices: (item: PricedProps) => void;
  closeNext: () => void;
}> = ({ item, updateItemPrices, closeNext }) => {
  const [_item, setItem] = React.useState<null | PricedProps>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitted, setSubmitted] = React.useState(false);

  const imageRequired = item.visual_confirmation_required === 1;
  const handleQuote = () => {
    if (imageRequired && file === null) {
      notify.error("Kindly attach image for the item");
      return;
    }

    if (_item) {
      if (typeof _item.price === "number" && _item.price <= 10) {
        notify.error("Price must be greater than 10");
        return;
      }
      updateItemPrices({ ..._item, id: item?.id, file: file });
      setSubmitted(true);
    }
  };
  const editQuote = () => {
    setSubmitted(false);
    closeNext();
  };
  return (
    <Box className=" flex flex-col gap-y-4 justify-between p-2">
      <Flex gap="md" direction={{ base: "column", md: "row" }}>
        <NumberInput
          size="sm"
          label="Quantity"
          w={{ base: "100%", md: 100 }}
          disabled={isSubmitted}
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
          disabled={isSubmitted}
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
        {imageRequired && (
          <FileInput
            accept="image/png,image/jpeg, image/jpg"
            // disabled={isSubmitted}
            clearable
            required
            value={file}
            w={{ base: "100%", md: 140 }}
            onChange={setFile}
            placeholder="upload  image"
            label="Item image"
          />
        )}{" "}
      </Flex>

      {isSubmitted ? (
        <h3 className="text-sm text-gray-600 transition-all duration-300 text-center">
          <ActionIcon onClick={editQuote}>
            <FilePenLine size={10} />
          </ActionIcon>
          <small onClick={editQuote} className="ml-2"></small>
          Edit quote
        </h3>
      ) : (
        <Button onClick={handleQuote}>Add Quote</Button>
      )}
    </Box>
  );
};
export default PricingComponent;
