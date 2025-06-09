
import { COLOUR } from '@/CONSTANTS/color';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
const theme=createTheme({
    primaryColor: 'keymanGreen',
    primaryShade: 6,
    fontFamily: 'Poppins, sans-serif',
    colors:{
        keymanGreen:[
  "#f3f9f1",
  "#e5f0e1",
  "#c8e1be",
  "#a8d098",
  "#8dc378",
  "#7cba64",
  "#73b659",
  "#61a049",
  "#558e3f",
  "#3d6b2c"
],
keymanOrange:[
  "#fff4e1",
  "#ffe7cd",
  "#face9f",
  "#f6b36d",
  "#f29c42",
  "#f08c23",
  "#f08616",
  "#d57308",
  "#bf6601",
  "#a65600"
]
    }
})
export default function MantineAppProvider({children}: Readonly<{
  children: React.ReactNode;}>) {
  // MantineThemeProvider is used to provide the theme to the application
  return (
    <MantineProvider theme={theme}>
      <Notifications/>
      <NavigationProgress  color={COLOUR.secondary} />
      {/* MantineProvider is used to provide the theme to the application */}
      {children}</MantineProvider>
  )
}
