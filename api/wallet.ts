import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

export const getWallet = async () => {
  try {
    const endpoint = ENDPOINTS.wallet.GET_WALLET;
    const response = await AxiosClient.get(endpoint);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching wallet",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const createWallet = async () => {
  try {
    const endpoint = ENDPOINTS.wallet.CREATE_WALLET;
    const response = await AxiosClient.post(endpoint);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating wallet",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const createWalletWithData = async (formData: FormData) => {
  try {
    const endpoint = ENDPOINTS.wallet.CREATE_WALLET;
    const response = await AxiosClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating wallet",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const sendOTP = async (phoneNumber: string) => {
  try {
    const endpoint = ENDPOINTS.wallet.SEND_OTP;
    const response = await AxiosClient.post(endpoint, { phoneNumber });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while sending OTP",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const confirmOTP = async (phoneNumber: string, otp: string) => {
  try {
    const endpoint = ENDPOINTS.wallet.CONFIRM_OTP;
    const response = await AxiosClient.post(endpoint, { phoneNumber, otp });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while confirming OTP",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
