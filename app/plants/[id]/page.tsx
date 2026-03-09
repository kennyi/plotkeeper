import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getPlant, getBeds } from "@/lib/supabase";
import { SavedToast } from "@/components/ui/SavedToast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { monthRange, formatSpacing, formatGermination, formatWeeksIndoors, categoryEmoji } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { AddToBedSheet } from "@/components/beds/AddToBedSheet";

interface PlantDetailPageProps {
  params: { id: string };
  searchParams: { from?: string };
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === "–") return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export default async function PlantDetailPage({ params, searchParams }: PlantDetailPageProps) {
  let plant;
  try {
    plant = await getPlant(params.id);
  } catch {
    notFound();
  }

  const beds = await getBeds().catch(() => []);
  const bedSummaries = beds.map((b) => ({
    id:       b.id,
    name:     b.name,
    bed_type: b.bed_type,
    length_m: b.length_m,
    width_m:  b.width_m,
  }));

  // Back link — if coming from a bed, show "Back to [bed]" instead of "Plant Library"
  const from = searchParams.from;
  const backHref = from ?? "/plants";
  const backLabel = from?.startsWith("/beds/") ? "Back to bed" : "Plant Library";

  const sunLabel =
    plant.sun_requirement === "full_sun"
      ? "☀️ Full sun"
      : plant.sun_requirement === "partial_shade"
      ? "⛅ Partial shade"
      : plant.sun_requirement === "full_shade"
      ? "🌥️ Full shade"
      : null;

  const waterLabel =
    plant.water_needs === "low"
      ? "💧 Low"
      : plant.water_needs === "medium"
      ? "💧💧 Medium"
      : plant.water_needs === "high"
      ? "💧💧💧 High"
      : null;

  const slugLabel =
    plant.slug_risk === "high"
      ? "🐌🐌🐌 High risk"
      : plant.slug_risk === "medium"
      ? "🐌🐌 Medium risk"
      : plant.slug_risk === "low"
      ? "🐌 Low risk"
      : null;

  return (
    <div>
      <Suspense><SavedToast message="Plant saved" /></Suspense>

      {/* Back link + actions */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {backLabel}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <AddToBedSheet plantId={plant.id} plantName={plant.name} beds={bedSummaries} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/plants/${plant.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        {plant.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plant.photo_url}
            alt={plant.name}
            className="w-full max-h-64 object-cover rounded-lg mb-4"
          />
        )}
        <div className="flex items-start gap-3">
          {!plant.photo_url && <span className="text-4xl">{categoryEmoji(plant.category)}</span>}
          <div>
            <h1 className="text-2xl font-bold">{plant.name}</h1>
            {plant.latin_name && (
              <p className="text-muted-foreground italic">{plant.latin_name}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="garden" className="capitalize">{plant.category}</Badge>
              {plant.subcategory && (
                <Badge variant="outline" className="capitalize">{plant.subcategory.replace("_", " ")}</Badge>
              )}
              {plant.is_cut_flower && <Badge variant="outline">✂️ Cut flower</Badge>}
              {plant.is_perennial && <Badge variant="outline">♾️ Perennial</Badge>}
              {plant.frost_tender && (
                <Badge variant="outline" className="text-blue-700 border-blue-200">❄️ Frost tender</Badge>
              )}
              {plant.frost_tolerant && (
                <Badge variant="outline" className="text-green-700 border-green-200">🌡️ Frost tolerant</Badge>
              )}
              {plant.slug_risk === "high" && (
                <Badge variant="destructive">🐌 High slug risk</Badge>
              )}
            </div>
          </div>
        </div>

        {plant.description && (
          <p className="mt-4 text-muted-foreground">{plant.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sowing & planting calendar */}
        <Section title="🗓️ Sowing & Planting Calendar">
          <p className="text-xs text-muted-foreground mb-3">Calibrated for Kildare, Ireland</p>
          <InfoRow
            label="Sow indoors"
            value={monthRange(plant.sow_indoors_start, plant.sow_indoors_end)}
          />
          <InfoRow
            label="Sow outdoors"
            value={monthRange(plant.sow_outdoors_start, plant.sow_outdoors_end)}
          />
          <InfoRow
            label="Plant out / transplant"
            value={monthRange(plant.transplant_start, plant.transplant_end)}
          />
          <InfoRow
            label="Harvest window"
            value={monthRange(plant.harvest_start, plant.harvest_end)}
          />
          {plant.succession_sow && (
            <div className="mt-3 p-2 bg-garden-50 rounded-md border border-garden-200">
              <p className="text-sm text-garden-800 font-medium">
                ↻ Succession sow every {plant.succession_interval_weeks ?? 3} weeks for continuous harvest
              </p>
            </div>
          )}
        </Section>

        {/* Indoor growing */}
        {(plant.weeks_indoors_min || plant.germination_days_min) && (
          <Section title="🌱 Indoor Growing">
            <InfoRow
              label="Weeks indoors"
              value={formatWeeksIndoors(plant.weeks_indoors_min, plant.weeks_indoors_max)}
            />
            <InfoRow
              label="Hardening off"
              value={plant.hardening_off_days ? `${plant.hardening_off_days} days` : null}
            />
            <Separator className="my-2" />
            <InfoRow
              label="Germination time"
              value={formatGermination(plant.germination_days_min, plant.germination_days_max)}
            />
            <InfoRow
              label="Germination temp"
              value={
                plant.germination_temp_min
                  ? `${plant.germination_temp_min}–${plant.germination_temp_max ?? plant.germination_temp_min}°C`
                  : null
              }
            />
          </Section>
        )}

        {/* Spacing & depth */}
        <Section title="📏 Spacing & Depth">
          <InfoRow
            label="Plant spacing"
            value={formatSpacing(plant.spacing_cm, plant.row_spacing_cm)}
          />
          <InfoRow
            label="Sowing depth"
            value={plant.sowing_depth_cm ? `${plant.sowing_depth_cm}cm` : null}
          />
          <InfoRow
            label="Plant height"
            value={
              plant.height_cm_min
                ? `${plant.height_cm_min}–${plant.height_cm_max ?? plant.height_cm_min}cm`
                : null
            }
          />
          {plant.is_cut_flower && plant.vase_life_days && (
            <InfoRow label="Vase life" value={`~${plant.vase_life_days} days`} />
          )}
        </Section>

        {/* Growing conditions */}
        <Section title="🌤️ Growing Conditions">
          <InfoRow label="Sunlight" value={sunLabel} />
          <InfoRow label="Water needs" value={waterLabel} />
          <InfoRow label="Soil" value={plant.soil_preference} />
          <InfoRow label="Hardiness zone" value={plant.hardiness_zone} />
          <InfoRow label="Slug risk" value={slugLabel} />
        </Section>

        {/* Perennial info */}
        {plant.is_perennial && (
          <Section title="♾️ Perennial Info">
            <InfoRow
              label="Lifespan"
              value={plant.lifespan_years ? `${plant.lifespan_years} years` : "Long-lived"}
            />
            <InfoRow
              label="Prune in"
              value={plant.prune_month ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][plant.prune_month - 1] : null}
            />
            <InfoRow
              label="Divide in"
              value={plant.divide_month ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][plant.divide_month - 1] : null}
            />
          </Section>
        )}

        {/* Companions */}
        {(plant.companion_plants?.length || plant.avoid_near?.length) && (
          <Section title="🤝 Companion Planting">
            {plant.companion_plants?.length ? (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Grows well with</p>
                <div className="flex flex-wrap gap-1">
                  {plant.companion_plants.map((c) => (
                    <Badge key={c} variant="garden" className="capitalize text-xs">
                      {c.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {plant.avoid_near?.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Keep away from</p>
                <div className="flex flex-wrap gap-1">
                  {plant.avoid_near.map((a) => (
                    <Badge key={a} variant="destructive" className="capitalize text-xs">
                      {a.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </Section>
        )}

        {/* Pests & diseases */}
        {(plant.common_pests?.length || plant.common_diseases?.length) && (
          <Section title="🐛 Pests & Diseases">
            {plant.common_pests?.length ? (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Common pests</p>
                <p className="text-sm">{plant.common_pests.join(", ")}</p>
              </div>
            ) : null}
            {plant.common_diseases?.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Common diseases</p>
                <p className="text-sm">{plant.common_diseases.join(", ")}</p>
              </div>
            ) : null}
          </Section>
        )}
      </div>

      {/* Notes */}
      {(plant.notes || plant.growing_tips) && (
        <div className="mt-4 space-y-4">
          {plant.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📝 Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{plant.notes}</p>
              </CardContent>
            </Card>
          )}
          {plant.growing_tips && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">💡 Growing Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{plant.growing_tips}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
