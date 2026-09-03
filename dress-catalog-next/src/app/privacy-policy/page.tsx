import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Jain Fancy Dresses and its Google Business Profile integration.",
  alternates: {
    canonical: "https://jainfancydresses.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fff9fc] px-4 py-12 md:px-8 md:py-16">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-pink-100 bg-white px-6 py-8 shadow-xl md:px-10 md:py-12">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
            Jain Fancy Dresses
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: September 3, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-slate-600 md:text-base">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Introduction</h2>
            <p className="mt-3">
              Jain Fancy Dresses ("we", "us", or "our") operates the website
              https://jainfancydresses.in/ and provides information about our
              fancy dress costumes and related services. This Privacy Policy
              explains what information we collect, how we use it, and how we
              protect it when you use our website or authorize our Google
              Business Profile integration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Information We Collect</h2>
            <p className="mt-3">
              Depending on how you use the website, we may process information
              such as information you provide when contacting us, website
              interaction information, and information needed to operate the
              administrative functions of the site.
            </p>
            <p className="mt-3">
              When an authorized account owner connects our Google Business
              Profile integration, we may receive Google OAuth information and
              Business Profile account information made available through the
              permissions granted to the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Google User Data</h2>
            <p className="mt-3">
              Our Google integration requests access to the Google Business
              Profile API using the scope required for Business Profile access.
              The integration may receive the Google account and Business
              Profile account information necessary to identify the authorized
              Business Profile account and provide the intended business
              functionality.
            </p>
            <p className="mt-3">
              Google OAuth access and refresh tokens are used only to authorize
              requests to Google's services on behalf of the authorized account.
              Access tokens are used to make API requests, while the refresh
              token is used to obtain a new access token when required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. How We Use Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To operate and maintain the Jain Fancy Dresses website.</li>
              <li>To provide and improve our catalog and customer-facing services.</li>
              <li>To operate authorized Google Business Profile functionality.</li>
              <li>To authenticate authorized administrators and protect administrative features.</li>
              <li>To respond to questions, requests, or support needs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Google Data Sharing</h2>
            <p className="mt-3">
              We do not sell Google user data. We do not use Google user data
              for advertising or unrelated purposes. Google data is used only
              for the functionality for which the authorized user granted
              permission. We do not transfer Google user data to third parties
              except where necessary to provide the requested functionality or
              where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">6. Data Storage and Retention</h2>
            <p className="mt-3">
              Information is retained only for as long as reasonably necessary
              for the purposes described in this policy, to maintain the
              website and authorized integrations, to meet legal obligations,
              and to protect our services.
            </p>
            <p className="mt-3">
              OAuth credentials used by the application are treated as
              confidential configuration values. We do not intentionally expose
              access or refresh tokens in public pages of the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">7. Data Security</h2>
            <p className="mt-3">
              We take reasonable technical and organizational measures to
              protect information against unauthorized access, alteration,
              disclosure, or destruction. No method of transmission or storage
              is completely secure, so absolute security cannot be guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">8. Google Authorization and Revocation</h2>
            <p className="mt-3">
              A Google account owner chooses whether to authorize our Google
              integration. Authorization can be revoked through the Google
              account's security and third-party access controls. After access
              is revoked, the application will no longer be able to use the
              revoked authorization to make Google API requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">9. Your Choices and Data Deletion</h2>
            <p className="mt-3">
              You may request information about personal data we hold about you
              or ask us to delete information where deletion is permitted and
              practical. If you revoke Google authorization, you may also ask us
              to remove the Google OAuth credentials associated with that
              authorization.
            </p>
            <p className="mt-3">
              To make a privacy or deletion request, contact us using the
              details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">10. Contact Us</h2>
            <div className="mt-3 rounded-2xl bg-slate-50 p-5">
              <p className="font-bold text-slate-900">Jain Fancy Dresses</p>
              <p>Shop No. 7, Gyan Khand - 4, Indirapuram</p>
              <p>Ghaziabad, Uttar Pradesh, India</p>
              <p className="mt-2">Phone: +91 88261 63522</p>
              <p>Email: Please use the contact details provided by Jain Fancy Dresses.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">11. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy when our services, data
              practices, or legal requirements change. The updated version will
              be published on this page with a revised "Last updated" date.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
