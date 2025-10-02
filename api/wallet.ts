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
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response, "wallet creation response....");
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

export const createCurrentAccount = async (formData: FormData) => {
  try {
    const endpoint = ENDPOINTS.wallet.CREATE_CURRENT_ACCOUNT;
    const response = await AxiosClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response, "current account creation response....");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating current account",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const initializeWallet = async (data: {
  type: "personal" | "business";
  payment_method: string;
  phone_number: string;
}) => {
  try {
    const endpoint = ENDPOINTS.wallet.VERIFICATION_FEE;
    const response = await AxiosClient.post(endpoint, data);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while initializing wallet",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const sendOTP = async (
  phoneNumber: string,
  otpType: "email" | "sms" = "email"
) => {
  try {
    const endpoint = ENDPOINTS.wallet.SEND_OTP;
    const response = await AxiosClient.post(endpoint, {
      phoneNumber,
      otp_type: otpType,
    });

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

export const confirmOTP = async (
  otp: string,
  businessId?: string,
  phoneNumber?: string
) => {
  try {
    const endpoint = ENDPOINTS.wallet.CONFIRM_OTP;
    const payload: Record<string, string> = {
      otp_code: otp,
    };

    if (businessId) {
      payload.businessId = businessId;
    }

    if (phoneNumber) {
      payload.phoneNumber = phoneNumber;
    }

    const response = await AxiosClient.post(endpoint, payload);

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

export const sendKYC = async (formData: FormData) => {
  try {
    const endpoint = ENDPOINTS.wallet.UPLOAD_KYC_DOCUMENTS;
    const response = await AxiosClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while uploading KYC documents",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const upgradeWalletAccount = async (formData: FormData) => {
  try {
    const endpoint = ENDPOINTS.wallet.UPGRADE_ACCOUNT;
    const response = await AxiosClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while upgrading wallet account",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const topUpWallet = async (data: {
  phone_number: string;
  amount: number;
}) => {
  try {
    const endpoint = ENDPOINTS.wallet.TOP_UP_WALLET;
    const response = await AxiosClient.post(endpoint, data);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while topping up wallet",
          success: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", success: false };
    }
  }
};

export const sendMoney = async (data: {
  recipient_wallet_id: string;
  amount: number;
  description: string;
}) => {
  try {
    const endpoint = ENDPOINTS.wallet.SEND_MONEY;
    const response = await AxiosClient.post(endpoint, data);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while sending money",
          success: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", success: false };
    }
  }
};

export const getSupportedCurrencies = async () => {
  try {
    const endpoint = ENDPOINTS.wallet.SUPPORTED;
    const response = await AxiosClient.get(endpoint);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching supported currencies",
          success: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", success: false };
    }
  }
};

export const getForexRates = async (currencies: string[]) => {
  try {
    const endpoint = ENDPOINTS.wallet.GET_RATES;
    const response = await AxiosClient.post(endpoint, { currencies });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while fetching forex rates",
          success: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", success: false };
    }
  }
};
