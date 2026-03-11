"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { PLANT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PlantSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(currentSearch);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    startTransition(() => {
      router.push(`/plants?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: search });
  }

  function clearSearch() {
    setSearch("");
    updateParams({ q: "" });
  }

  return (
    <div className="space-y-4">
      {/* Text search */}
      <form onSubmit={handleSearch} className="relative">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plants..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
          onClick={() => updateParams({ category: "" })}
        >
          All
        </Button>
        {PLANT_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={currentCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ category: cat.value })}
            className={cn(currentCategory === cat.value && "")}
          >
            {cat.emoji} {cat.label}
          </Button>
        ))}
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground">Loading...</p>
      )}
    </div>
  );
}
