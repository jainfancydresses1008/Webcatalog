import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://jainfancydresses.in"),

  title: {
    default: "Jain Fancy Dresses | Fancy Dress Costumes in Ghaziabad",
    template: "%s | Jain Fancy Dresses",
  },

  description:
    "Jain Fancy Dresses in Indirapuram, Ghaziabad offers fancy dress costumes for kids for school events, dance competitions, cultural programs, parties and special occasions, with rent and sale options.",

  alternates: {
    canonical: "https://jainfancydresses.in/",
  },

  keywords: [
    "fancy dresses",
    "fancy dress costumes",
    "kids fancy dress",
    "children fancy dress",
    "school fancy dress",
    "fancy dress costumes for kids",
    "fancy dress shop Ghaziabad",
    "fancy dress shop Indirapuram",
    "kids costume rental Ghaziabad",
    "Jain Fancy Dresses",
  ],

  openGraph: {
    title: "Jain Fancy Dresses | Fancy Dress Costumes in Ghaziabad",
    description:
      "Browse fancy dress costumes for kids in Indirapuram, Ghaziabad for school events, dance competitions, cultural programs, parties and special occasions.",
    url: "https://jainfancydresses.in/",
    siteName: "Jain Fancy Dresses",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/logo_r.png",
        width: 1536,
        height: 1024,
        alt: "Jain Fancy Dresses - Fancy Dress Costumes",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Jain Fancy Dresses | Fancy Dress Costumes in Ghaziabad",
    description:
      "Fancy dress costumes for kids in Indirapuram, Ghaziabad for school events, competitions, parties and special occasions.",
    images: ["/images/logo_r.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "@id": "https://jainfancydresses.in/#business",
              name: "Jain Fancy Dresses",
              url: "https://jainfancydresses.in/",
              image: "https://jainfancydresses.in/images/logo_r.png",
              telephone: "+918826163522",
              priceRange: "₹₹",
              areaServed: {
                "@type": "City",
                name: "Ghaziabad",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Shop No. 7, Gyan Khand - 4, Indirapuram",
                addressLocality: "Ghaziabad",
                addressRegion: "Uttar Pradesh",
                addressCountry: "IN",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "09:00",
                  closes: "21:00",
                },
              ],
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Jain Fancy Dresses",
              url: "https://jainfancydresses.in/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://jainfancydresses.in/?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <Header />
        {children}
      </body>
    </html>
  );
}
