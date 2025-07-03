import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

export const getBalance = async (
  supplierId: string,
  isSupplier: boolean = false
) => {
  try {
    if (isSupplier) {
      const response = await AxiosClient.get(
        ENDPOINTS.coin.GET_BALANCE(supplierId)
      );
      return response.data;
    } else {
      const response = await AxiosClient.get(ENDPOINTS.coin.USER_BALANCE);
      return response.data;
    }
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

interface PaymentFormData {
  payment_method: string;
  phone_number: string;
  type: string;
  type_id?: string;
  amount: number;
  description: string;
}

export const makePayments = async (paymentData: PaymentFormData) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.coin.MAKE_PAYYMENT,
      paymentData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || { message: "Payment failed", status: false }
      );
    }
    console.error("An unexpected error occurred:", error);
    return { message: "An unexpected error occurred", status: false };
  }
};

export const confirmPaymentTransaction = async (checkoutRequestID: string) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.coin.CONFIRM_PAYMENT, // You will replace this with your actual endpoint
      { checkout_request_id: checkoutRequestID }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "Payment confirmation failed",
          status: false,
        }
      );
    }
    console.error("An unexpected error occurred:", error);
    return { message: "An unexpected error occurred", status: false };
  }
};
