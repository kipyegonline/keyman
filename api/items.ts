import AxiosClient from "@/config/axios"
import { ENDPOINTS } from "@/lib/endpoints"
import { AxiosError } from "axios"

interface ItemResponse {
    id: string;
    name: string;
    description?: string;
    category_id?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Get items by name and optionally filter by category
 * @param itemName The name of the item to search for
 * @param categoryId Optional category ID to filter items
 * @returns List of items matching the search criteria
 */
export const getItems = async (itemName: string, categoryId?: string) => {
    try {
        const endpoint = `${ENDPOINTS.items.GET_ITEMS(itemName)}${categoryId || ''}`;
        const response = await AxiosClient.get<ItemResponse[]>(endpoint);
       
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching items', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}
