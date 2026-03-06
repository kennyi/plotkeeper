import type { Plant } from "@/types";

interface PlantTopDownIconProps {
  category?: Plant["category"] | null;
  size?: number;
  className?: string;
}

/**
 * Simple flat top-down plant illustration keyed by plant category.
 * Designed to sit inside grid slots — bold shapes, no fine detail.
 */
export function PlantTopDownIcon({ category, size = 40, className = "" }: PlantTopDownIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {PLANT_ICONS[category ?? "default"] ?? PLANT_ICONS["default"]}
    </svg>
  );
}

const PLANT_ICONS: Record<string, React.ReactNode> = {
  // Vegetables — green rosette/leafy shape
  vegetable: (
    <>
      <circle cx="24" cy="24" r="14" fill="#4CAF50" opacity="0.85" />
      <ellipse cx="24" cy="12" rx="5" ry="9" fill="#388E3C" opacity="0.9" />
      <ellipse cx="12" cy="24" rx="9" ry="5" fill="#388E3C" opacity="0.9" />
      <ellipse cx="36" cy="24" rx="9" ry="5" fill="#388E3C" opacity="0.9" />
      <ellipse cx="24" cy="36" rx="5" ry="9" fill="#388E3C" opacity="0.9" />
      <circle cx="24" cy="24" r="5" fill="#2E7D32" />
    </>
  ),

  // Flowers — colourful petal arrangement
  flower: (
    <>
      {/* Petals */}
      <ellipse cx="24" cy="10" rx="5" ry="9" fill="#EF5350" opacity="0.9" />
      <ellipse cx="24" cy="38" rx="5" ry="9" fill="#EF5350" opacity="0.9" />
      <ellipse cx="10" cy="24" rx="9" ry="5" fill="#EF5350" opacity="0.9" />
      <ellipse cx="38" cy="24" rx="9" ry="5" fill="#EF5350" opacity="0.9" />
      {/* Diagonal petals */}
      <ellipse cx="13" cy="13" rx="5" ry="9" fill="#FF7043" opacity="0.75" transform="rotate(-45 13 13)" />
      <ellipse cx="35" cy="13" rx="5" ry="9" fill="#FF7043" opacity="0.75" transform="rotate(45 35 13)" />
      <ellipse cx="13" cy="35" rx="5" ry="9" fill="#FF7043" opacity="0.75" transform="rotate(45 13 35)" />
      <ellipse cx="35" cy="35" rx="5" ry="9" fill="#FF7043" opacity="0.75" transform="rotate(-45 35 35)" />
      {/* Centre */}
      <circle cx="24" cy="24" r="7" fill="#FDD835" />
      <circle cx="24" cy="24" r="4" fill="#F9A825" />
    </>
  ),

  // Herbs — small dense leaf cluster
  herb: (
    <>
      <ellipse cx="24" cy="28" rx="10" ry="13" fill="#66BB6A" opacity="0.9" />
      <ellipse cx="14" cy="30" rx="8" ry="11" fill="#4CAF50" opacity="0.85" />
      <ellipse cx="34" cy="30" rx="8" ry="11" fill="#4CAF50" opacity="0.85" />
      <ellipse cx="24" cy="16" rx="7" ry="10" fill="#81C784" opacity="0.9" />
      <circle cx="24" cy="26" r="4" fill="#2E7D32" opacity="0.7" />
    </>
  ),

  // Fruit — round fruit with leaf stub at top
  fruit: (
    <>
      <circle cx="24" cy="28" r="17" fill="#FF8F00" opacity="0.9" />
      <circle cx="24" cy="28" r="11" fill="#FFA726" opacity="0.6" />
      {/* Stalk and leaf */}
      <line x1="24" y1="11" x2="24" y2="17" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="30" cy="10" rx="6" ry="4" fill="#4CAF50" transform="rotate(-30 30 10)" />
    </>
  ),

  // Perennials — star/rosette with a permanent centre
  perennial: (
    <>
      <ellipse cx="24" cy="10" rx="5" ry="10" fill="#66BB6A" opacity="0.9" />
      <ellipse cx="24" cy="38" rx="5" ry="10" fill="#66BB6A" opacity="0.9" />
      <ellipse cx="10" cy="24" rx="10" ry="5" fill="#4CAF50" opacity="0.9" />
      <ellipse cx="38" cy="24" rx="10" ry="5" fill="#4CAF50" opacity="0.9" />
      <ellipse cx="14" cy="14" rx="5" ry="10" fill="#81C784" opacity="0.75" transform="rotate(-45 14 14)" />
      <ellipse cx="34" cy="14" rx="5" ry="10" fill="#81C784" opacity="0.75" transform="rotate(45 34 14)" />
      <ellipse cx="14" cy="34" rx="5" ry="10" fill="#81C784" opacity="0.75" transform="rotate(45 14 34)" />
      <ellipse cx="34" cy="34" rx="5" ry="10" fill="#81C784" opacity="0.75" transform="rotate(-45 34 34)" />
      <circle cx="24" cy="24" r="7" fill="#2E7D32" />
    </>
  ),

  // Annuals — simple single open leaf
  annual: (
    <>
      <ellipse cx="24" cy="26" rx="14" ry="18" fill="#A5D6A7" opacity="0.9" />
      <ellipse cx="24" cy="24" rx="9" ry="13" fill="#66BB6A" opacity="0.85" />
      <line x1="24" y1="44" x2="24" y2="16" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="30" x2="16" y2="24" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="28" x2="32" y2="22" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </>
  ),

  // Bulbs — oval bulb shape, purple/lilac
  bulb: (
    <>
      <ellipse cx="24" cy="30" rx="13" ry="16" fill="#CE93D8" opacity="0.85" />
      <ellipse cx="24" cy="28" rx="8" ry="10" fill="#BA68C8" opacity="0.6" />
      {/* Shoot tips */}
      <line x1="24" y1="14" x2="24" y2="6"  stroke="#7B1FA2" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="16" x2="15" y2="8"  stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="16" x2="33" y2="8"  stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  // Shrubs — multi-circle canopy cluster
  shrub: (
    <>
      <circle cx="16" cy="30" r="13" fill="#388E3C" opacity="0.85" />
      <circle cx="32" cy="30" r="13" fill="#2E7D32" opacity="0.85" />
      <circle cx="24" cy="18" r="13" fill="#4CAF50" opacity="0.85" />
      <circle cx="24" cy="24" r="5"  fill="#1B5E20" opacity="0.5" />
    </>
  ),

  // Biennials — two-leaf pair
  biennial: (
    <>
      <ellipse cx="16" cy="26" rx="11" ry="16" fill="#81C784" opacity="0.9" transform="rotate(-15 16 26)" />
      <ellipse cx="32" cy="26" rx="11" ry="16" fill="#66BB6A" opacity="0.9" transform="rotate(15 32 26)" />
      <line x1="24" y1="42" x2="24" y2="20" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),

  // Default fallback — simple circle
  default: (
    <>
      <circle cx="24" cy="24" r="17" fill="#A5D6A7" opacity="0.85" />
      <circle cx="24" cy="24" r="9"  fill="#66BB6A" opacity="0.7" />
      <circle cx="24" cy="24" r="4"  fill="#388E3C" />
    </>
  ),
};
