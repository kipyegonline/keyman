import AxiosClient from "@/config/axios"
import { ENDPOINTS } from "@/lib/endpoints"
import { AwardPayload, QuotePayload, RequestPayload } from "@/types/requests"
import { AxiosError } from "axios"

/**
 * Get all requests
 * @returns List of requests and their status
 */
export const getRequests = async () => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.requests.GET_REQUESTS)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching requests', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Create a new request
 * @param payload Request creation payload containing title, description, location and items
 * @returns Created request data
 */
export const createRequest = async (payload: RequestPayload) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.requests.CREATE_REQUESTS, payload)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while creating the request', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Get requests near the user's location
 * @returns List of nearby requests
 */
export const getNearbyRequests = async () => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.requests.NEAR_ME)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching nearby requests', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Get detailed information about a specific request
 * @param requestId The ID of the request to fetch
 * @returns Detailed request information
 */
export const getRequestDetails = async (requestId: string) => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.requests.GET_DETAILS(requestId))
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching request details', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Submit a quote for items in a request
 * @param requestId The ID of the request to quote for
 * @param payload Quote information including prices and quantities
 * @returns Quote submission status
 */
export const submitQuoteForRequest = async (requestId: string, payload: QuotePayload) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.requests.QUOTE_REQUEST_ITEMS(requestId), payload)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while submitting the quote', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Get all quotes for a specific request
 * @param requestId The ID of the request
 * @returns List of quotes for the request
 */
export const getRequestQuotes = async (requestId: string) => {
    try {
        const response = await AxiosClient.get(ENDPOINTS.requests.GET_QUOTES(requestId))
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while fetching request quotes', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}

/**
 * Award items in a request to a supplier
 * @param requestId The ID of the request
 * @param payload Award information including item IDs and supplier ID
 * @returns Award status
 */
export const awardRequestItems = async (requestId: string, payload: AwardPayload) => {
    try {
        const response = await AxiosClient.post(ENDPOINTS.requests.AWARD_ITEM(requestId), payload)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { message: 'An error occurred while awarding the items', status: false }
        } else {
            console.error('An unexpected error occurred:', error)
            return { message: 'An unexpected error occurred', status: false }
        }
    }
}
