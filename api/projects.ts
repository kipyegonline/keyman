import AxiosClient from "@/config/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { AxiosError } from "axios";

/**
 * Get all projects
 * @returns List of projects and their status
 */
export const getProjects = async () => {
  try {
    const response = await AxiosClient.get(ENDPOINTS.projects.GET_PROJETCS);
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

/**
 * Create a new project
 * @param payload Project creation payload. Consider creating a specific type for this.
 * @returns Created project data
 */
export const createProject = async (
  payload: Record<string, string | number>
) => {
  try {
    const response = await AxiosClient.post(
      ENDPOINTS.projects.CREATE_PROJECT,
      payload
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return (
        error.response?.data || {
          message: "An error occurred while creating the project",
          status: false,
        }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return { message: "An unexpected error occurred", status: false };
    }
  }
};
