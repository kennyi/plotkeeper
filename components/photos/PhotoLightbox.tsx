"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxPhoto {
  id: string;
  photo_url: string;
  taken_at: string;
  plant_status?: string | null; // undefined / null for bed photos
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[]; // sorted oldest-first
  initialIndex: number;
  onClose: () => void;
  onDelete: (photoId: string) => void;
  entityType: "planting" | "bed";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
  onDelete,
  entityType,
}: PhotoLightboxProps) {
  const [index, setIndex] = useState(
    Math.min(initialIndex, photos.length - 1)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const photo = photos[index];

  const goPrev = useCallback(() => {
    setConfirmDelete(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setConfirmDelete(false);
    setIndex((i) => Math.min(photos.length - 1, i + 1));
  }, [photos.length]);

  // Keyboard navigation + prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose, goPrev, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(photo.id);
    setConfirmDelete(false);
  }

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-white/50 text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white p-1 rounded-full"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Photo area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {/* Desktop prev arrow */}
        {index > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.photo_url}
          alt=""
          className="max-h-full max-w-full object-contain rounded-lg"
          draggable={false}
        />

        {/* Desktop next arrow */}
        {index < photos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom metadata + delete */}
      <div className="flex items-end justify-between px-5 py-5 flex-shrink-0 gap-4">
        <div className="text-sm space-y-0.5">
          <p className="text-white/80 font-medium">{formatDate(photo.taken_at)}</p>
          {entityType === "planting" && photo.plant_status && (
            <p className="text-white/45">{formatStatus(photo.plant_status)}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {confirmDelete && (
            <>
              <span className="text-red-400 text-sm">Delete photo?</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-white/50 hover:text-white/80 text-sm"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={handleDeleteClick}
            className={`p-2 rounded-full transition-colors ${
              confirmDelete
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
            aria-label="Delete photo"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
