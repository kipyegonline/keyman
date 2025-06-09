
import { nprogress } from '@mantine/nprogress';

export const navigateTo=()=>{
    nprogress.start();   
    setTimeout(()=> nprogress.complete(),1000)
}