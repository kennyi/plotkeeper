"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

/**
 * Drop this into any server-page that receives ?saved=1 after a redirect.
 * It fires a toast and strips the param from the URL.
 */
export function SavedToast({ message = "Saved successfully" }: { message?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get("saved") === "1") {
      toast.success(message);
      // Remove ?saved=1 from the URL without reloading
      const next = new URLSearchParams(params.toString());
      next.delete("saved");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
