import { RequestDeliveryItem } from "@/types";

export function calculateTotalAwardedAmount(
  items: RequestDeliveryItem["items"]
): number {
  let totalAmount = 0;

  for (const item of items) {
    // Check if quote array exists and is not empty
    if (item.quote && item.quote.length > 0) {
      for (const quoteItem of item.quote) {
        // Check if the quote is awarded
        if (quoteItem.is_awarded === 1) {
          // Convert string numbers to actual numbers
          const totalPrice = parseFloat(quoteItem.quantity);
          const unitPrice = parseFloat(quoteItem.unit_price);

          // Validate that conversion was successful
          if (!isNaN(totalPrice) && !isNaN(unitPrice)) {
            // Multiply unit_price by quantity and add to total
            totalAmount += unitPrice * totalPrice;
          }
        }
      }
    }
  }

  return totalAmount;
}
