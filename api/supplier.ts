import AxiosClient from "@/config/axios"
import { ENDPOINTS } from "@/lib/endpoints"
import { SupplierInfo } from "@/types";
import { AxiosError } from "axios";

export const getSupplierTypes=async()=>{
    try {
        const response=await AxiosClient.get(ENDPOINTS.supplier.SUPPLIER_TYPES)
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching supplier types', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            // Consider returning a standardized error response or re-throwing
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

export const becomeSupplier = async (payload: SupplierInfo) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.supplier.BECOME_SUPPLIER, payload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred during supplier registration', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

export const updateSupplierDetails = async (id: string, payload: Partial<SupplierInfo>) => {
    try {
       
        const response = await AxiosClient.post(ENDPOINTS.supplier.UPDATE_SUPPLIER_DETAILS(id), payload);
        
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while updating supplier details', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

type InviteUserPayload = {
    email: string;
    // Add other relevant fields if necessary, e.g., supplierId
};

export const inviteUserToSupplier = async (payload: InviteUserPayload) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.supplier.INVITE_USER, payload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while inviting user', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

type RemoveUserPayload = {
    userId: string | number;
    // Add other relevant fields if necessary, e.g., supplierId
};
export const removeUserFromSupplier = async (payload: RemoveUserPayload) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.supplier.REMOVE_USER_FROM_SUPPLIER, payload); // Or AxiosClient.delete if appropriate
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while removing user from supplier', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

export const getSupplierDetails = async (id: string) => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.supplier.GET_DETAILS(id));
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching supplier details', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

export const getSupplierPriceList = async (supplierDetailId: string) => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.supplier.GET_PRICE_LIST(supplierDetailId));
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching price list', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}

export const updateSupplierPriceList = async (supplierDetailId: string, payload: [{item_id:string,price:number}]) => { // Define a more specific type for payload if possible
    try {
       
        const response = await AxiosClient.post(ENDPOINTS.supplier.UPDATE_PRICE_LIST(supplierDetailId), payload); // Or AxiosClient.put
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while updating price list', status: false };
        } else {
            console.error('An unexpected error occurred:', error);
            return { message: 'An unexpected error occurred', status: false };
        }
    }
}
