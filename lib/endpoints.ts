export const ENDPOINTS={

    auth:{LOGIN:"/api/login",
    LOGOUT:"/api/logout",//TOKEN
    CREATE_USER:"/api/users",
    GET_USER:"/api/user", //TOKEN
    UPDATE_USER:"/api/user", //TOKEN
    PASSWORD_RESET_REQUEST:"/api/password-reset/request",
    PASSWORD_RESET:"/api/reset/password", //TOKEN

    
}  ,
supplier:{
    BECOME_SUPPLIER:"/api/supplier",
    SUPPLIER_TYPES:"/api/supplier/type",
    UPDATE_SUPPLIER_DETAILS:(id:string)=>`/api/supplier/${id}`,
    INVITE_USER:"/api/supplier/invite-user",
    REMOVE_USER_FROM_SUPPLIER:"/api/supplier/remove-user",
    GET_DETAILS:(id:string)=>`/api/supplier/${id}`, // has an id,
    GET_PRICE_LIST:(supplier_detail_id:string)=>`/api/supplier/${supplier_detail_id}/price_list`,
   UPDATE_PRICE_LIST:(supplier_detail_id:string)=>`/api/supplier/${supplier_detail_id}/update_price_list`
},
requests:{
    GET_REQUESTS:"/api/requests",
    CREATE_REQUESTS:"/api/requests",
    NEAR_ME:"/api/requests/near_me",
     GET_DETAILS:(request_id:string)=>`/api/requests/${request_id}`,
     QUOTE_REQUEST_ITEMS: (request_id:string)=>`/api/request/${request_id}}/quote`,
     GET_QUOTES:(request_id:string)=>`/api/request/${request_id}}`,
     AWARD_ITEM:(request_id:string)=>`/api/request/${request_id}}/award`


}

}