"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";

interface PhotoUploadProps {
  /** The form field name — stores the resulting URL */
  name: string;
  /** Current photo URL (when editing an existing record) */
  defaultValue?: string | null;
  /** Storage sub-folder: "plants", "beds", "plantings" */
  folder: string;
  label?: string;
}

export function PhotoUpload({
  name,
  defaultValue,
  folder,
  label = "Photo",
}: PhotoUploadProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Pre-auth fallback: use 'shared' until auth is live in Phase 4
      const userId = user?.id ?? "shared";

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${folder}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      setUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>

      {/* Hidden field carries the URL into the form */}
      <input type="hidden" name={name} value={url} />

      <div
        className="relative flex items-center justify-center w-full h-36 rounded-lg border-2 border-dashed border-input bg-muted/30 cursor-pointer overflow-hidden hover:border-garden-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Uploaded photo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-muted-foreground pointer-events-none">
            <p className="text-sm font-medium">
              {uploading ? "Uploading…" : "Tap to add photo"}
            </p>
            <p className="text-xs mt-0.5">Camera or gallery</p>
          </div>
        )}

        {url && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-medium">Change photo</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </div>
        )}

        {/* File input — hidden, triggered by div click */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          // On mobile this offers the camera
          capture="environment"
          onChange={handleFile}
          disabled={uploading}
          className="sr-only"
          aria-label={`Upload ${label.toLowerCase()}`}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {url && (
        <button
          type="button"
          onClick={() => setUrl("")}
          className="text-xs text-muted-foreground underline"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}
