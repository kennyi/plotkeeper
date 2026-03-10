"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import {
  uploadBedPhotoAction,
  deleteBedPhotoAction,
} from "@/app/actions/photos";
import type { BedPhoto } from "@/types";

interface BedPhotoAvatarProps {
  initialPhotos: BedPhoto[]; // sorted oldest-first from server
  bedId: string;
}

const today = new Date().toISOString().split("T")[0];

export function BedPhotoAvatar({ initialPhotos, bedId }: BedPhotoAvatarProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<BedPhoto[]>(initialPhotos);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync when server re-renders with fresh data
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  // Most recent = last item (sorted oldest-first)
  const profilePhoto = photos.length > 0 ? photos[photos.length - 1] : null;

  function handleDelete(photoId: string) {
    const updatedPhotos = photos.filter((p) => p.id !== photoId);
    const newProfileUrl =
      updatedPhotos.length > 0
        ? updatedPhotos[updatedPhotos.length - 1].photo_url
        : null;

    setPhotos(updatedPhotos);
    if (updatedPhotos.length === 0) setLightboxOpen(false);

    startTransition(async () => {
      await deleteBedPhotoAction(photoId, bedId, newProfileUrl);
      router.refresh();
    });
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await uploadBedPhotoAction(formData);
        setSheetOpen(false);
        router.refresh();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <>
      {/* Avatar + add button row */}
      <div className="flex items-end gap-3 mb-6">
        {/* Circular avatar — tap to open gallery */}
        <button
          onClick={() => photos.length > 0 && setLightboxOpen(true)}
          className="relative w-20 h-20 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center focus:outline-none group border-2 border-white shadow-sm"
          aria-label={photos.length > 0 ? `View ${photos.length} photo${photos.length !== 1 ? "s" : ""}` : "No photos yet"}
        >
          {profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePhoto.photo_url}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <span className="text-3xl">🌱</span>
          )}

          {/* Photo count overlay */}
          {photos.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] font-medium text-center py-0.5">
              {photos.length} photos
            </div>
          )}
        </button>

        {/* Add photo button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
          {photos.length === 0 ? "Add photo" : "Add photo"}
        </button>
      </div>

      {/* Add photo bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-end"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-6 space-y-4"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base">Add photo</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="hidden" name="bed_id" value={bedId} />

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
          initialIndex={photos.length - 1}
          onClose={() => setLightboxOpen(false)}
          onDelete={handleDelete}
          entityType="bed"
        />
      )}
    </>
  );
}
