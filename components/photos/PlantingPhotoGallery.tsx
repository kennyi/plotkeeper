"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import {
  uploadPlantingPhotoAction,
  deletePlantingPhotoAction,
} from "@/app/actions/photos";
import { PLANTING_STATUS_LABELS } from "@/lib/constants";
import type { PlantingPhoto } from "@/types";

interface PlantingPhotoGalleryProps {
  initialPhotos: PlantingPhoto[]; // sorted oldest-first from server
  plantingId: string;
  currentStatus: string;
  fallbackEmoji: string;
}

const today = new Date().toISOString().split("T")[0];

export function PlantingPhotoGallery({
  initialPhotos,
  plantingId,
  currentStatus,
  fallbackEmoji,
}: PlantingPhotoGalleryProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<PlantingPhoto[]>(initialPhotos);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync when server re-renders with fresh data
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  // Most recent = last item (sorted oldest-first)
  const profilePhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  function openLightbox() {
    if (photos.length === 0) return;
    setLightboxIndex(photos.length - 1);
    setLightboxOpen(true);
  }

  function handleDelete(photoId: string) {
    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    const newProfileUrl =
      updatedPhotos.length > 0
        ? updatedPhotos[updatedPhotos.length - 1].photo_url
        : null;

    // Optimistic update
    setPhotos(updatedPhotos);
    if (updatedPhotos.length === 0) setLightboxOpen(false);

    startTransition(async () => {
      await deletePlantingPhotoAction(photoId, plantingId, newProfileUrl);
      router.refresh();
    });
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await uploadPlantingPhotoAction(formData);
        setSheetOpen(false);
        router.refresh();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <>
      {/* Hero image area */}
      <div className="relative mb-6">
        <button
          onClick={openLightbox}
          className="w-full h-48 rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center focus:outline-none"
          disabled={photos.length === 0}
          aria-label={photos.length > 0 ? "Open photo gallery" : undefined}
        >
          {profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhoto.photo_url}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <span className="text-7xl">{fallbackEmoji}</span>
          )}
        </button>

        {/* Photo count badge */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
            {photos.length} photos
          </div>
        )}

        {/* Add photo button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
          Add photo
        </button>
      </div>

      {/* Add photo bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base">Add photo</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="hidden" name="planting_id" value={plantingId} />

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Photo
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  capture="environment"
                  required
                  className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-garden-50 file:text-garden-700"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Date taken
                </label>
                <input
                  type="date"
                  name="taken_at"
                  defaultValue={today}
                  required
                  className="block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Status at this time
                </label>
                <select
                  name="plant_status"
                  defaultValue={currentStatus}
                  className="block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white"
                >
                  {(
                    Object.entries(PLANTING_STATUS_LABELS) as [string, string][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {uploadError && (
                <p className="text-xs text-red-600">{uploadError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="flex-1 border border-stone-200 rounded-xl py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-garden-700 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? "Uploading…" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onDelete={handleDelete}
          entityType="planting"
        />
      )}
    </>
  );
}
