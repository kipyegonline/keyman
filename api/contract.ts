import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";
export const getContracts = async () => {
  try {
    const endpoint = ENDPOINTS.contracts.GET_CONTRACTS;
    const response = await AxiosClient.get(endpoint);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching contracts",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
