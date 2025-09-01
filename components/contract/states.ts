const isSupplierMode = false;
const serviceProviderCompletionDate = null;
const clientCompletionDate = null;
const milestoneStatus = "in_progress";

//visible for client - isSupplierMode = false, serviceProviderCompletionDate = not empty, clientCompletionDate should be empty
const clientVisible =
  isSupplierMode == false &&
  serviceProviderCompletionDate != null &&
  serviceProviderCompletionDate != "" &&
  (clientCompletionDate == "" || clientCompletionDate == null);

//Visible for Supplier - isSupplierMode is true, serviceProviderCompletionDate is empty, milestoneStatus is in_progress.
const supplierVisible =
  isSupplierMode &&
  (serviceProviderCompletionDate == "" ||
    serviceProviderCompletionDate == null) &&
  milestoneStatus == "in_progress";

export const actionType = clientVisible
  ? "complete"
  : supplierVisible
  ? "service_provider_complete"
  : null;
