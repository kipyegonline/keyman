import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Keyman Stores",
  description:
    "Learn about Keyman's mission to revolutionize construction commerce through our transparent, efficient marketplace connecting builders with quality suppliers.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
