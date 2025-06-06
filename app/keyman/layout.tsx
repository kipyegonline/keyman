import { Container, Flex,Box } from '@mantine/core'
import React from 'react'
type Props={children:React.ReactNode}
export default function Keymanlayout({children}:Props) {
  return (
    <Container>
        <Flex>
            <Box>Side menu</Box>
            <Box>{children}</Box>
        </Flex>
    </Container>
  )
}
