import { NavigationComponent } from "@/components/ui/Navigation";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Keyman Stores",
  description:
    "Read our terms of use for the Keyman construction commerce platform. Understand your rights and responsibilities as a user.",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationComponent isFixed />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Keyman Stores, you accept and agree to be
                bound by the terms and provision of this agreement. Keyman
                Stores is a platform designed for the construction industry,
                connecting users and suppliers for item searches, requests, and
                quote responses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                2. Platform Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Keyman Stores provides a digital marketplace for construction
                industry professionals, including contractors, builders, and
                suppliers. Our platform facilitates the search for construction
                materials, submission of item requests, and enables suppliers to
                respond with competitive quotes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Provide accurate and current information when creating
                  requests
                </li>
                <li>
                  Use the platform only for legitimate construction industry
                  purposes
                </li>
                <li>
                  Respect intellectual property rights of all content on the
                  platform
                </li>
                <li>
                  Maintain the confidentiality of your account credentials
                </li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                4. Supplier Obligations
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate product information and pricing</li>
                <li>Honor quoted prices for the specified duration</li>
                <li>Maintain appropriate licenses and certifications</li>
                <li>Deliver products as specified in accepted quotes</li>
                <li>Respond to requests in a timely and professional manner</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                5. Prohibited Uses
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our platform to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Transmit any unlawful, harmful, or objectionable content
                </li>
                <li>Impersonate any person or entity</li>
                <li>
                  Interfere with or disrupt the platform&apos;s functionality
                </li>
                <li>Harvest or collect user information without consent</li>
                <li>
                  Use the platform for any fraudulent or illegal activities
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Keyman Stores acts as a facilitator between users and suppliers.
                We are not responsible for the quality, safety, or legality of
                items listed, the truth or accuracy of listings, or the ability
                of suppliers to deliver products as promised. Users engage with
                suppliers at their own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                7. Account Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend accounts that
                violate these terms, engage in fraudulent activity, or misuse
                the platform. Users may also terminate their accounts at any
                time by contacting our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Users
                will be notified of significant changes via email or platform
                notifications. Continued use of the platform after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                9. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms of Use, please contact us
                through our platform&apos;s support system or customer service
                channels.
              </p>
            </section>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
