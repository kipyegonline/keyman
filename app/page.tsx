import KeymanLanding from "@/components/landing";

import type { Metadata } from "next";
import {Container} from "@mantine/core"
export const metadata: Metadata = {
  title: "Keyman stores",
  description: "Buy Smart Build Smart",
};
export default function Home() {
  return (
    <Container maw="fluid" className="px-10"><KeymanLanding/></Container>
   
  );
}
