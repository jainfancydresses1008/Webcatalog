import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://jainfancydresses.in"),

  title: {
    default: "Jain Fancy Dresses | Fancy Dress Costumes for Kids",
    template: "%s | Jain Fancy Dresses",
  },

  description:
    "Jain Fancy Dresses offers a wide collection of fancy dress costumes for kids, school events, competitions, parties and special occasions.",

  keywords: [
    "fancy dresses",
    "fancy dress costumes",
    "kids fancy dress",
    "children fancy dress",
    "school fancy dress",
    "fancy dress costumes for kids",
    "Jain Fancy Dresses",
  ],

  openGraph: {
    title: "Jain Fancy Dresses | Fancy Dress Costumes for Kids",
    description:
      "Browse fancy dress costumes for kids, school events, competitions, parties and special occasions.",
    url: "https://jainfancydresses.in/",
    siteName: "Jain Fancy Dresses",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Jain Fancy Dresses",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
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
              name: "Jain Fancy Dresses",
              url: "https://jainfancydresses.in/",
              telephone: "+918826163522",
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

        <Header />
        {children}
      </body>
    </html>
  );
}
