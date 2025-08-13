import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Keyman Stores",
  description:
    "Get in touch with Keyman. Contact our support team for questions about our construction commerce platform and supplier marketplace.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
