export const ENDPOINTS = {
  auth: {
    LOGIN: "/api/login",
    LOGOUT: "/api/logout", //TOKEN
    CREATE_USER: "/api/users",
    GET_USER: "/api/user", //TOKEN
    UPDATE_USER: "/api/user", //TOKEN
    PASSWORD_RESET_REQUEST: "/api/password-reset/request",
    PASSWORD_RESET: "/api/reset/password", //TOKEN
  },
  supplier: {
    BECOME_SUPPLIER: "/api/supplier",
    SUPPLIER_TYPES: "/api/supplier/type",
    UPDATE_SUPPLIER_DETAILS: (id: string) => `/api/supplier/${id}`,
    INVITE_USER: "/api/supplier/invite-user",
    REMOVE_USER_FROM_SUPPLIER: "/api/supplier/remove-user",
    GET_DETAILS: (id: string) => `/api/supplier/${id}`, // has an id,
    GET_PRICE_LIST: (supplier_detail_id: string) =>
      `/api/supplier/${supplier_detail_id}/price_list`,
    UPDATE_PRICE_LIST: (supplier_detail_id: string) =>
      `/api/supplier/${supplier_detail_id}/update_price_list`,
  },
  orders: {
    CREATE_ORDERS: "/api/orders",
    GET: "/api/orders",
    GET_ORDER_DETAILS: (order_id: string) => `/api/orders/${order_id}`,
    ITEM_RECEIPT_CONFIRMATION: (order_id: string) =>
      `/api/order/${order_id}/receipt-confirmation`,
  },

  requests: {
    GET_REQUESTS: "/api/requests",
    CREATE_REQUESTS: "/api/requests",
    NEAR_ME: "/api/requests/near-me",
    GET_DETAILS: (request_id: string) => `/api/requests/${request_id}`,
    QUOTE_REQUEST_ITEMS: (request_id: string) =>
      `/api/request/${request_id}}/quote`,
    GET_QUOTES: (request_id: string) => `/api/request/${request_id}`,
    AWARD_ITEM: (request_id: string) => `/api/request/${request_id}/award`,
    SUPPLIERS_NEAR_ME: (lat: number, lng: number, distance?: number) =>
      `/api/supplier/near-me?latitude=${lat}&longitude=${lng}${
        distance ? `&distance=${distance}` : ""
      }`,
  },
  items: {
    GET_ITEMS: (item: string, categoryId?: string) => {
      if (categoryId)
        return `/api/items?name=${item}&item_category_id=${categoryId}`;
      else return `/api/items?name=${item}&item_category_id=`;
    },
    ADD_SUPPLIER_ITEM: `/api/item`,
    DELETE_ITEM: (id: string) => `/api/supplier/price_list/${id}`,
  },
  projects: {
    GET_PROJETCS: "/api/projects",
    CREATE_PROJECT: "/api/projects",
  },
  coin: {
    GET_COIN_USAGE: (supplierId: string) =>
      `/api/keyman-coin/usage?supplier_detail_id=${supplierId}`,
    GET_BALANCE: (supplierId: string) =>
      `/api/keyman-coin/balance?supplier_detail_id=${supplierId}`,
    USER_BALANCE: "/api/keyman-coin/balance",
    USER_USAGE: "/api/keyman-coin/usage",
    MAKE_PAYYMENT: "/api/payments/pay",
    CONFIRM_PAYMENT: "",
  },
  chatbot: {
    CREATE_THREAD: "/api/ai-chat/threads",
    GET_THREADS: "/api/ai-chat/threads",
    GET_MESSAGES: (threadId: string) => `/api/ai-chat/threads/${threadId}`,
    SEND_MESSAGE: (threadId: string) =>
      `/api/ai-chat/threads/${threadId}/messages`,
    GET_MESSAGE_COUNT: (threadId: string) =>
      `/api/ai-chat/threads/${threadId}/messages/count`,
  },
  banners: { BANNERS_NEAR_ME: "/api/banners/close-by" },
  contracts: {
    GET_CONTRACTS: "/api/keyman-contracts",
    CREATE_CONTRACT: "/api/keyman-contracts",
    GET_CONTRACT_DETAILS: (contract_id: string) =>
      `/api/keyman-contracts/${contract_id}`,
    UPDATE_CONTRACT: (contract_id: string) =>
      `/api/keyman-contracts/${contract_id}`,
    DELETE_CONTRACT: (contract_id: string) =>
      `/api/keyman-contracts/${contract_id}`,
    CREATE_MILESTONE: `/api/keyman-contract-milestones`,
    UPDATE_MILESTONE: (milestone_id: string) =>
      `/api/keyman-contract-milestones/${milestone_id}`,
    UPDATE_MILESTONE_COPY: (milestone_id: string) =>
      `/api/keyman-contract-milestones/${milestone_id}/copy`,
    DOWNLOAD_CONTRACT: (contract_id: string) =>
      `/api/keyman-contracts/${contract_id}/download`,
  },
  wallet: {
    CREATE_WALLET: "/api/user/create-wallet",
    GET_WALLET: "/api/user/wallet/details",
    SEND_OTP: "/api/choice/sendOTP",
    CONFIRM_OTP: "/api/choice/confirmOTP",
    VERIFICATION_FEE: "/api/verification/fee",
  },
};
