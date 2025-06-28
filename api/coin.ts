import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

export const getBalance = async (supplierId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.coin.GET_BALANCE(supplierId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching projects",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
