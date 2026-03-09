import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  monthRange,
  formatSpacing,
  formatGermination,
  formatWeeksIndoors,
} from "@/lib/utils";
import type { Plant } from "@/types";

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

interface PlantLibraryInfoProps {
  plant: Plant;
}

export function PlantLibraryInfo({ plant }: PlantLibraryInfoProps) {
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
    <div className="space-y-4">
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
        <div className="space-y-4">
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
