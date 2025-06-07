import KeymanLanding from "@/components/landing";

import type { Metadata } from "next";
//import {Container} from "@mantine/core"
export const metadata: Metadata = {
  title: "Keyman stores",
  description: "Buy Smart Build Smart",
};
export default function Home() {
  return (
    <div  className="px-4 pt-4 md:pt-2 md:px-10  max-w-full"><KeymanLanding/></div>
   
  );
}
