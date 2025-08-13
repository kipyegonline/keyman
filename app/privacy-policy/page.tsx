import { NavigationComponent } from "@/components/ui/Navigation";
import Link from "next/link";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Keyman Stores",
  description:
    "Learn how Keyman protects your privacy and handles your personal information on our construction commerce platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationComponent isFixed />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
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
                1. Information We Collect
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Company information and business credentials</li>
                  <li>Billing and payment information</li>
                  <li>Profile information and preferences</li>
                </ul>

                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Construction-Related Data
                </h3>
                <ul className="list-disc list-inside mb-4 space-y-1">
                  <li>Item requests and specifications</li>
                  <li>Project details and requirements</li>
                  <li>Supplier quotes and responses</li>
                  <li>Transaction history and order details</li>
                </ul>

                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Platform usage patterns and preferences</li>
                  <li>Device information and IP addresses</li>
                  <li>Search queries and browsing behavior</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Facilitate connections between users and suppliers</li>
                <li>Process and manage item requests and quotes</li>
                <li>
                  Improve our platform&apos;s functionality and user experience
                </li>
                <li>Send important updates about your requests and orders</li>
                <li>Provide customer support and resolve issues</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and industry regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                3. Information Sharing
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>With Suppliers:</strong> When you submit a request,
                    relevant details are shared with matching suppliers
                  </li>
                  <li>
                    <strong>With Users:</strong> Suppliers can view request
                    details to provide accurate quotes
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Trusted third parties
                    who assist in platform operations
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> When required by law or
                    to protect our rights and users
                  </li>
                </ul>
                <p className="mt-4">
                  We never sell your personal information to third parties.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your
                information, including encryption, secure servers, and regular
                security audits. However, no method of transmission over the
                internet is 100% secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                5. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as necessary to provide
                our services, comply with legal obligations, resolve disputes,
                and enforce our agreements. Account information is typically
                retained for the duration of your account plus applicable legal
                retention periods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                6. Your Rights
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or limit the processing of your data</li>
                  <li>Download your data in a portable format</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to enhance your
                experience, remember your preferences, and analyze platform
                usage. You can control cookie settings through your browser,
                though some features may not function properly if cookies are
                disabled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is designed for business use in the construction
                industry and is not intended for children under 18. We do not
                knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy to reflect changes in our
                practices or legal requirements. We will notify users of
                significant changes via email or platform notifications. Your
                continued use of the platform after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                10. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this privacy policy or how we handle
                your information, please contact us through our platform&apos;s
                support system or customer service channels. We&apos;re
                committed to addressing your privacy concerns promptly and
                transparently.
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
