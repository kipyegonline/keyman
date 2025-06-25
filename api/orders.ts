import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

export const createOrders = async (payload: Record<string, string>) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.orders.CREATE_ORDERS,
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating orders",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const getOrders = async (supplierId: string) => {
  try {
    const response = await AxiosClient.get(ENDPOINTS.orders.GET, {
      params: { supplier_detail_id: supplierId },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching orders",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const getOrderDetails = async (orderId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.orders.GET_ORDER_DETAILS(orderId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching order details",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const confirmItemReceipt = async (orderId: string) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.orders.ITEM_RECEIPT_CONFIRMATION(orderId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred during item receipt confirmation",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
