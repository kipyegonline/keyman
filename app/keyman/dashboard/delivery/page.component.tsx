"use client"
import LocationPicker from '@/components/delivery/map'
//import DeliveryMap from '@/components/delivery/map'
import { Grid, Title } from '@mantine/core'
import { APIProvider,Map } from '@vis.gl/react-google-maps'
import React from 'react'
const key=process.env.NEXT_PUBLIC_G_KEY as string
const coords={
	lat: -1.194438642926344,
	lng: 36.928756667223446
}
export default function DeliveryClientComponent() {
  console.log(key,'key')
  return (
    <div className='px-2 md:px-10 min-h-screen'>
      <div className='p-20'> 
        <APIProvider apiKey={key}>
         <Map
      style={{width: '100vw', height: '100vh'}}
      defaultCenter={coords}
      defaultZoom={17}
      //gestureHandling={'greedy'}
      //disableDefaultUI={false}
    />
       </APIProvider></div>
      
        <Grid >
            <Grid.Col span={{base:12, md:8}}>
                 <LocationPicker/>
            </Grid.Col>
            <Grid.Col>
                <Title>Your locations</Title>
                

            </Grid.Col>
        </Grid>
     
    </div>
  )
}
/*
const userLocation = ref({
	lat: -1.194438642926344,
	lng: 36.928756667223446
});
const zoom = ref(15);*/