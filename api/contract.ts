import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";
export const getContracts = async (supplierId: string) => {
  try {
    if (supplierId) {
      const endpoint = ENDPOINTS.contracts.GET_CONTRACTS(supplierId);
      const response = await AxiosClient.get(endpoint);
      return response.data;
    } else {
      const endpoint = "/api/keyman-contracts";
      const response = await AxiosClient.get(endpoint);
      return response.data;
    }
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
export const getContractDetails = async (contractId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.contracts.GET_CONTRACT_DETAILS(contractId)
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

export const downloadContract = async (contractId: string) => {
  try {
    const response = await AxiosClient.get(
      ENDPOINTS.contracts.DOWNLOAD_CONTRACT(contractId),
      {
        responseType: "blob", // Important: Handle binary data properly
      }
    );
    return {
      status: true,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while downloading the contract",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const updateMilestone = async (
  milestoneId: string,
  milestoneData: {
    name?: string;
    status?: string;
    amount?: number;
    description?: string;
    action?: string;
    mode?: string;
    number?: string;
  }
) => {
  try {
    const response = await AxiosClient.put(
      ENDPOINTS.contracts.UPDATE_MILESTONE(milestoneId),
      milestoneData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while updating the milestone",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const updateMultipleMilestones = async (payload: {
  milestones: string[];
  action: string;
  mode?: string;
  number?: string;
}) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.contracts.UPDATE_MULTIPLE_MILESTONES,
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while updating milestones",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const deleteMilestone = async (
  milestoneId: string,
  milestoneData: {
    name?: string;
    status?: string;
    amount?: number;
    description?: string;
    action?: string;
  }
) => {
  try {
    const response = await AxiosClient.delete(
      ENDPOINTS.contracts.UPDATE_MILESTONE(milestoneId),
      { data: milestoneData }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while updating the milestone",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
export const updateContract = async (
  contractId: string,
  contractData: {
    status?: string;
    action?: "start" | "complete";
    contract_amount?: number;
    contract_mode?: "client" | "service_provider";
    contract_duration_in_duration?: number;
    service_provider_signing_date?: string | null;
    contract_json?: string;
  }
) => {
  try {
    const response = await AxiosClient.put(
      ENDPOINTS.contracts.UPDATE_CONTRACT(contractId),
      contractData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while updating the contract",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const createContract = async (contractData: {
  service_provider_id: string;
  status: string;
  contract_duration_in_duration: number;
  contract_amount: number;
  contract_json: string;
}) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.contracts.CREATE_CONTRACT,
      contractData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating the contract",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

export const createMilestone = async (milestoneData: {
  keyman_contract_id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  amount: number;
}) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.contracts.CREATE_MILESTONE,
      milestoneData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating the milestone",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};

// Types for suggested milestones
export interface ISuggestedMilestone {
  name: string;
  description: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
}

export interface ISuggestedMilestonesData {
  milestones: ISuggestedMilestone[];
}

export interface ISuggestedMilestonesResponse {
  status: boolean;
  message: string;
  data: ISuggestedMilestonesData;
}

/**
 * Get AI-suggested milestones for a contract
 * @param contractId - ID of the contract
 * @returns Suggested milestones response
 */
export const getSuggestedMilestones = async (
  contractId: string
): Promise<ISuggestedMilestonesResponse> => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.contracts.GET_SUGGESTED_MILESTONES(contractId)
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          message: "An error occurred while fetching suggested milestones",
          data: { milestones: [] },
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return {
        status: false,
        message: "An unexpected error occurred",
        data: { milestones: [] },
      };
    }
  }
};

/**
 * Interface for pay full contract request data
 */
export interface IPayFullContractData {
  amount: number;
  payment_method: string;
  phone_number?: string;
  wallet_id?: string;
}

/**
 * Interface for pay full contract response
 */
export interface IPayFullContractResponse {
  status: boolean;
  message: string;
  data?: unknown;
  payable?: { txId: string };
}

/**
 * Pay full contract amount
 * @param contract_id - ID of the contract
 * @param data - Payment data including amount, payment_number, and phone_number
 * @returns Payment response
 */
export const payFullContract = async (
  contract_id: string,
  data: IPayFullContractData
): Promise<IPayFullContractResponse> => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.contracts.PAY_FULL(contract_id),
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          status: false,
          message: "An error occurred while processing the payment",
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return {
        status: false,
        message: "An unexpected error occurred",
      };
    }
  }
};
