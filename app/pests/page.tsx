import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MONTH_SHORT } from "@/lib/constants";

interface Pest {
  id: string;
  emoji: string;
  name: string;
  type: "pest" | "disease";
  peakMonths: number[]; // 1-based
  affectedPlants: string[];
  identification: string;
  prevention: string[];
  treatment: string[];
  kildareNote?: string;
}

const PESTS: Pest[] = [
  {
    id: "slugs",
    emoji: "🐌",
    name: "Slugs & Snails",
    type: "pest",
    peakMonths: [3, 4, 5, 9, 10],
    affectedPlants: ["Lettuce", "Hostas", "Seedlings", "Strawberries", "Courgette"],
    identification:
      "Irregular holes in leaves, often with silvery slime trails. Damage appears overnight. Young seedlings can be eaten to the ground.",
    prevention: [
      "Use copper tape around raised beds and pots",
      "Apply grit, crushed eggshells, or wool pellets as mulch",
      "Water in the morning so soil is drier at night",
      "Keep the area around beds clear of debris",
      "Encourage hedgehogs, frogs, and thrushes",
    ],
    treatment: [
      "Hand pick at dusk or after rain",
      "Lay beer traps — bury a cup level with soil",
      "Apply ferric phosphate pellets (safe for wildlife)",
      "Nematode treatment (Phasmarhabditis hermaphroditis) — apply May–September when soil is above 5°C",
    ],
    kildareNote:
      "Kildare's mild, damp springs make March–May extremely high risk. Protect all seedlings before planting out.",
  },
  {
    id: "aphids",
    emoji: "🦟",
    name: "Aphids",
    type: "pest",
    peakMonths: [5, 6, 7, 8],
    affectedPlants: ["Broad beans", "Roses", "Nasturtiums", "Brassicas", "Peppers"],
    identification:
      "Clusters of tiny green, black, or white insects on new growth and leaf undersides. Leaves may curl, yellow, or become sticky with honeydew. Look for attendant ants.",
    prevention: [
      "Plant nasturtiums as a trap crop",
      "Encourage ladybirds, lacewings, and hoverflies by growing umbellifers",
      "Avoid high-nitrogen feeds that promote soft leafy growth",
      "Check plants weekly during May–August",
    ],
    treatment: [
      "Blast off with a strong jet of water",
      "Squash small colonies by hand",
      "Spray with dilute washing-up liquid solution",
      "Apply insecticidal soap or pyrethrum as a last resort",
    ],
    kildareNote:
      "Black bean aphid on broad beans is near-universal by June. Pinch out growing tips once pods set to reduce colonies.",
  },
  {
    id: "carrot-fly",
    emoji: "🥕",
    name: "Carrot Fly",
    type: "pest",
    peakMonths: [5, 6, 7, 8],
    affectedPlants: ["Carrots", "Parsnips", "Parsley", "Celery", "Celeriac"],
    identification:
      "Rusty-brown tunnels and cavities in roots. Foliage may turn yellow and wilt. Adult flies are 6mm, dark-bodied with yellow head.",
    prevention: [
      "Erect a 60cm solid barrier around the bed — adults fly low",
      "Cover with fine mesh (Enviromesh) from sowing to harvest",
      "Sow thinly to avoid disturbance which releases scent",
      "Thin on still, cloudy days and remove thinnings immediately",
      "Sow mid-June to miss the first generation",
    ],
    treatment: [
      "No effective organic treatment once larvae are in the root",
      "Lift and use affected roots immediately if only lightly damaged",
      "Apply beneficial nematodes (Steinernema feltiae) in August–September",
    ],
  },
  {
    id: "cabbage-white",
    emoji: "🦋",
    name: "Cabbage White Caterpillar",
    type: "pest",
    peakMonths: [5, 6, 7, 8, 9],
    affectedPlants: ["Cabbage", "Kale", "Broccoli", "Brussels sprouts", "Cauliflower", "Nasturtiums"],
    identification:
      "Large or Small White butterflies lay eggs on leaf undersides. Caterpillars (green or yellow-and-black) eat large holes in leaves. Can reduce plants to skeletons rapidly.",
    prevention: [
      "Cover brassicas with fine mesh or fleece from planting — the most reliable control",
      "Check under leaves for egg clusters and crush immediately",
      "Plant red or purple brassica varieties — less attractive to whites",
    ],
    treatment: [
      "Hand-pick caterpillars and eggs daily",
      "Spray Bacillus thuringiensis (Bt) — targets caterpillars, harmless to other insects",
      "Pyrethrum spray as a last resort",
    ],
    kildareNote:
      "Two to three generations per year. First flush appears May–June, second July–August. Keep mesh on all season.",
  },
  {
    id: "vine-weevil",
    emoji: "🪲",
    name: "Vine Weevil",
    type: "pest",
    peakMonths: [9, 10, 3, 4],
    affectedPlants: ["Strawberries", "Cyclamen", "Begonias", "Heuchera", "Container plants"],
    identification:
      "White C-shaped grubs (to 10mm) in compost — eat roots causing sudden plant collapse. Adults notch leaf edges at night in summer. Check pots when repotting.",
    prevention: [
      "Check root balls when potting on",
      "Use copper or barrier tape around pot rims",
      "Do not leave plants in the same pot compost for years",
    ],
    treatment: [
      "Apply nematodes (Steinernema kraussei) in September–October or March–April when soil is 5°C+",
      "Remove adults at night with a torch",
      "Drench with imidacloprid-based vine weevil killer for severe infestations",
    ],
  },
  {
    id: "blight",
    emoji: "🍅",
    name: "Late Blight (Phytophthora infestans)",
    type: "disease",
    peakMonths: [6, 7, 8, 9],
    affectedPlants: ["Tomatoes", "Potatoes"],
    identification:
      "Dark brown patches on leaves with white mould on undersides in humid conditions. Spreads rapidly in warm wet weather. Potato tubers develop brown rot inside.",
    prevention: [
      "Grow blight-resistant potato varieties (Sarpo Mira, Orla)",
      "Earth up potatoes to protect tubers",
      "Stake and train tomatoes to maximise airflow",
      "Avoid overhead watering — water at the base",
      "Monitor from June onwards, especially after wet spells",
    ],
    treatment: [
      "Remove and destroy (not compost) affected foliage immediately",
      "Harvest potatoes immediately if blight found on foliage",
      "Apply copper-based fungicide (Bordeaux mixture) as a preventative in high-risk conditions",
      "No cure once established — removal is the only option",
    ],
    kildareNote:
      "Irish conditions are highly blight-prone June–September. Check tomatoes every 3–4 days during warm, wet spells.",
  },
  {
    id: "clubroot",
    emoji: "🌿",
    name: "Clubroot",
    type: "disease",
    peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    affectedPlants: ["Cabbage", "Kale", "Broccoli", "Brussels sprouts", "Turnip", "Swede"],
    identification:
      "Plants wilt in dry weather and fail to thrive despite watering. Roots show swollen, distorted club-like growths. Spores persist in soil for up to 20 years.",
    prevention: [
      "Lime the soil to raise pH above 7 — clubroot favours acidic conditions",
      "Grow resistant varieties (Kilaton cabbage, Clapton F1 broccoli)",
      "Maintain a strict 4-year brassica rotation",
      "Never bring in plants of unknown provenance",
      "Clean boots and tools before moving between beds",
    ],
    treatment: [
      "No cure — remove and bin affected plants (do not compost)",
      "Do not grow brassicas in that area for at least 7 years",
      "Apply lime to slow spread if clubroot is confirmed",
    ],
  },
];

function MonthBadges({ months }: { months: number[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {MONTH_SHORT.map((m, i) => (
        <span
          key={i}
          className={`text-xs px-1.5 py-0.5 rounded ${
            months.includes(i + 1)
              ? "bg-red-100 text-red-700 font-medium"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {m}
        </span>
      ))}
    </div>
  );
}

export default function PestGuidePage() {
  const pests = PESTS.filter((p) => p.type === "pest");
  const diseases = PESTS.filter((p) => p.type === "disease");

  return (
    <div>
      <Header
        title="Pest & Disease Guide"
        description="Common threats in Irish gardens — identification, prevention, and treatment"
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold mb-4">Pests</h2>
        <div className="space-y-4">
          {pests.map((pest) => (
            <PestCard key={pest.id} pest={pest} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-4">Diseases</h2>
        <div className="space-y-4">
          {diseases.map((pest) => (
            <PestCard key={pest.id} pest={pest} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PestCard({ pest }: { pest: Pest }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xl">{pest.emoji}</span>
            {pest.name}
          </CardTitle>
          <Badge variant={pest.type === "disease" ? "secondary" : "outline"} className="text-xs shrink-0">
            {pest.type === "disease" ? "Disease" : "Pest"}
          </Badge>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground mb-1">Peak risk</p>
          <MonthBadges months={pest.peakMonths} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Identification
          </p>
          <p className="text-sm">{pest.identification}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Commonly affects
          </p>
          <div className="flex flex-wrap gap-1">
            {pest.affectedPlants.map((p) => (
              <span key={p} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Prevention
            </p>
            <ul className="space-y-1">
              {pest.prevention.map((tip, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted-foreground shrink-0 mt-0.5">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Treatment
            </p>
            <ul className="space-y-1">
              {pest.treatment.map((tip, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted-foreground shrink-0 mt-0.5">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {pest.kildareNote && (
          <div className="bg-garden-50 border border-garden-200 rounded-md px-3 py-2">
            <p className="text-xs text-garden-800">
              <span className="font-semibold">Kildare note:</span> {pest.kildareNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
