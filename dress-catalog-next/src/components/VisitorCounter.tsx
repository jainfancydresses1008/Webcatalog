"use client";

import { useEffect, useState } from "react";

type Props = {
  initialCount: number;
};

const VISITOR_KEY = "jain-fancy-dresses-unique-visitor-v1";

export default function VisitorCounter({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const alreadyCounted = window.localStorage.getItem(VISITOR_KEY);

    if (alreadyCounted === "yes") {
      return;
    }

    window.localStorage.setItem(VISITOR_KEY, "yes");

    async function incrementVisitor() {
      try {
        const response = await fetch("/api/visitor", {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          visitorCount?: number;
        };

        if (typeof data.visitorCount === "number") {
          setCount(data.visitorCount);
        }
      } catch (error) {
        console.error("Unable to register visitor:", error);
      }
    }

    incrementVisitor();
  }, []);

  return (
    <div className="rounded-2xl border border-white bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
      <p className="text-xl font-black text-fuchsia-600">{count}</p>
      <p className="text-xs font-semibold text-slate-500">Visitors</p>
    </div>
  );
}
