"use client"
import LocationPicker from '@/components/delivery/map'
//import DeliveryMap from '@/components/delivery/map'
import { Grid, Title } from '@mantine/core'
import React from 'react'

export default function DeliveryClientComponent() {
  return (
    <div className='px-2 md:px-10'>
        <Grid>
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
