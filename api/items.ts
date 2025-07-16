import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

interface ItemResponse {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemPayload {
  supplier_detail_id: string;
  name: string;
  description: string;
  swahili_name: string;
  type: "goods" | "services" | "professional_services" | "Select Type";
  price: number;
  weight_in_kgs: number;
  transportation_type: "TUKTUK" | "PICKUP" | "LORRY";
}

/**
 * Get items by name and optionally filter by category
 * @param itemName The name of the item to search for
 * @param categoryId Optional category ID to filter items
 * @returns List of items matching the search criteria
 */
export const getItems = async (itemName: string, categoryId?: string) => {
  try {
    const endpoint = `${ENDPOINTS.items.GET_ITEMS(itemName)}${
      categoryId || ""
    }`;
    const response = await AxiosClient.get<ItemResponse[]>(endpoint);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching items",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Deletes an item.
 * @param itemId The ID of the item to delete.
 * @returns The status of the deletion.
 */
export const deleteItem = async (itemId: string) => {
  try {
    const response = await AxiosClient.delete(
      ENDPOINTS.items.DELETE_ITEM(itemId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while deleting the item",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

/**
 * Create a new item for a supplier.
 * @param payload The data for the new item.
 * @returns The created item data.
 */
export const createItem = async (payload: FormData) => {
  const hasImage = payload.getAll("image").length > 0;
  const headers = {
    "Content-Type": hasImage ? "multipart/form-data" : "application/json",
  };
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.items.ADD_SUPPLIER_ITEM,
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating the item",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
