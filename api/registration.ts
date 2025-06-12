import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const login = async (email: string, password: string) => {
    try {
         const response = await AxiosClient.post(BASE_URL+ENDPOINTS.auth.LOGIN, { email, password,fcm_token:"" });

 
 return response.data;
    } catch (error) {
        if(error instanceof AxiosError){
           return error.response?.data || { message: 'An error occurred during login' ,status:false};
        }else      throw error;
       
        
    }
 
}
type payload=Record<string, string|number|boolean>;
export const registerUser = async (payload:payload) => {
    try {
         const response = await AxiosClient.post(`${BASE_URL}${ENDPOINTS.auth.CREATE_USER}`,payload)


  return response.data;
    } catch (error) {
        if(error instanceof AxiosError){
           
           return error.response?.data || { message: 'An error occurred during registration' ,status:false};
        }else      throw error;
        
    }
 
}

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await AxiosClient.post(`${BASE_URL}${ENDPOINTS.auth.PASSWORD_RESET_REQUEST}`, { email });
        return {status:true,data:response.data};
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while requesting password reset', status: false };
        } else {
            throw error;
        }
    }
}
type ResetPasswordPayload = {
    email:string;
    reset_code:string;
    password:string;
    password_confirmation:string;}
export const resetPassword = async (payload:ResetPasswordPayload ) => {
    try {
        const response = await AxiosClient.post(`${BASE_URL}${ENDPOINTS.auth.PASSWORD_RESET}`, payload);
       
        return response.data;
    } catch (error) {
        
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while resetting password', status: false };
        } else {
            throw error;
        }
    }
}
export const logOutKeymanUser = async () => {
    try {
        const response = await AxiosClient.post(`${BASE_URL}${ENDPOINTS.auth.LOGOUT}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred during logout', status: false };
        } else {
            throw error;
        }
    }
}

export const getUserDetails = async () => {
    try {
        const response = await AxiosClient.get(`${BASE_URL}${ENDPOINTS.auth.GET_USER}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching user details', status: false };
        } else {
            // It's good practice to log the unexpected error for server-side debugging
            console.error('An unexpected error occurred while fetching user details:', error);
            // And then re-throw or return a generic error message
            // throw error; // Option 1: Re-throw the error
            return { message: 'An unexpected error occurred while fetching user details', status: false }; // Option 2: Return a generic error
        }
    }
}
