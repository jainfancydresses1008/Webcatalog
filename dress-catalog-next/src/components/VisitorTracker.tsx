"use client";

import { useEffect } from "react";

const VISITOR_KEY = "jain-fancy-dresses-unique-visitor-v1";

export default function VisitorTracker() {
  useEffect(() => {
    const alreadyCounted = window.localStorage.getItem(VISITOR_KEY);

    if (alreadyCounted === "yes") {
      return;
    }

    window.localStorage.setItem(VISITOR_KEY, "yes");

    fetch("/api/visitor", {
      method: "POST",
      cache: "no-store",
    }).catch((error) => {
      console.error("Unable to register visitor:", error);
    });
  }, []);

  return null;
}
