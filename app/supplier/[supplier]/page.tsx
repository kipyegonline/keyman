import { Container } from "@mantine/core";
import React from "react";
import SupplierClientComponent from "./page.component";
import { NavigationComponent } from "@/components/ui/Navigation";
import { getSupplierDetails } from "@/api/supplier";
import { Metadata } from "next";

type Props = {
  params: Promise<{ supplier: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { supplier: supplierId } = await params;

  // Fetch supplier data
  const response = await getSupplierDetails(supplierId);
  const supplier = response?.supplier;

  if (!supplier) {
    return {
      title: "Supplier Not Found | Keyman",
      description: "The requested supplier could not be found.",
    };
  }

  const title = `${supplier.name} - ${supplier.keyman_number}`;
  const description =
    supplier.comments ||
    `View ${supplier.name}'s profile and products on Keyman`;
  const image = supplier.photo[0] || "/og-image.png";
  const url = `https://keyman.co.ke/supplier/${supplierId}`;

  return {
    title: `${title} | Keyman`,
    description,
    keywords: [
      "Keyman",
      "Supplier",
      supplier.name,
      "Building Materials",
      "Construction",
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: "Keyman stores",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: supplier.name,
        },
      ],
      locale: "en_KE",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@keymanapp",
    },
    other: {
      // WhatsApp/Facebook use OpenGraph tags, but we can add extra hints
      "og:image:width": "1200",
      "og:image:height": "630",
    },
  };
}

export default async function Page({ params }: Props) {
  const { supplier: supplierId } = await params;

  // Fetch supplier data on the server
  const response = await getSupplierDetails(supplierId);
  const supplierData = response?.supplier || null;

  return (
    <Container size="fluid" py="md">
      <div className="relative ">
        {" "}
        <NavigationComponent isFixed={false} />
      </div>

      <SupplierClientComponent
        supplierId={supplierId}
        initialSupplierData={supplierData}
      />
    </Container>
  );
}
