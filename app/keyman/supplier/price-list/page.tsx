import React from 'react'
import PriceListClientcomponent from './page.component'


const request={status:"",
    delivery_state:"SUBMITTED",
    latitude:"",
    longitude:""
    ,created_from:"items", //which is array of items below
    ks_number:"",
    items:[{name:"",itemId:"",quanity:"",description:"",visual_confirmation:false}]}
export default function PriceListPage() {
  return (
    <div className='px-20'>
      <PriceListClientcomponent/>
    </div>
  )
}
