import type { GardenBed } from "@/types";

interface BedTypeIconProps {
  bedType: GardenBed["bed_type"];
  size?: number;
  className?: string;
}

export function BedTypeIcon({ bedType, size = 64, className = "" }: BedTypeIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {ICONS[bedType]}
    </svg>
  );
}

const ICONS: Record<GardenBed["bed_type"], React.ReactNode> = {
  raised_bed: (
    // Wooden-framed rectangle, top-down view
    <>
      <rect x="4" y="14" width="56" height="36" rx="3" fill="#8B6340" />
      {/* Inner soil */}
      <rect x="10" y="20" width="44" height="24" rx="1" fill="#5C7A35" opacity="0.80" />
      {/* Corner joints */}
      <rect x="4"  y="14" width="8" height="8" rx="1" fill="#6B4A28" />
      <rect x="52" y="14" width="8" height="8" rx="1" fill="#6B4A28" />
      <rect x="4"  y="42" width="8" height="8" rx="1" fill="#6B4A28" />
      <rect x="52" y="42" width="8" height="8" rx="1" fill="#6B4A28" />
      {/* Wood grain lines */}
      <line x1="4"  y1="26" x2="10" y2="26" stroke="#6B4A28" strokeWidth="1" opacity="0.6" />
      <line x1="4"  y1="34" x2="10" y2="34" stroke="#6B4A28" strokeWidth="1" opacity="0.6" />
      <line x1="54" y1="26" x2="60" y2="26" stroke="#6B4A28" strokeWidth="1" opacity="0.6" />
      <line x1="54" y1="34" x2="60" y2="34" stroke="#6B4A28" strokeWidth="1" opacity="0.6" />
    </>
  ),

  ground_bed: (
    // Irregular ground-level bed with soil texture
    <>
      <rect x="4" y="14" width="56" height="36" rx="2" fill="#9B7A55" opacity="0.9" />
      <rect x="8" y="18" width="48" height="28" fill="#6B8F40" opacity="0.65" />
      {/* Soil texture marks */}
      <line x1="14" y1="24" x2="18" y2="30" stroke="#4A6A28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="28" y1="20" x2="32" y2="27" stroke="#4A6A28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="44" y1="30" x2="48" y2="36" stroke="#4A6A28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="20" y1="36" x2="23" y2="42" stroke="#4A6A28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="38" y1="22" x2="41" y2="27" stroke="#4A6A28" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </>
  ),

  pot: (
    // Circle/urn from above — concentric rings
    <>
      <circle cx="32" cy="32" r="27" fill="#B85C28" />
      <circle cx="32" cy="32" r="21" fill="#C8733D" opacity="0.55" />
      <circle cx="32" cy="32" r="17" fill="#6B8F40" opacity="0.72" />
      {/* Rim highlight */}
      <circle cx="32" cy="32" r="27" fill="none" stroke="#8B4020" strokeWidth="2" opacity="0.5" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#9B5A30" strokeWidth="1" opacity="0.4" />
    </>
  ),

  planter: (
    // Wide shallow rectangle — like a trough planter
    <>
      <rect x="4" y="19" width="56" height="26" rx="4" fill="#8B6340" />
      <rect x="8" y="23" width="48" height="18" rx="2" fill="#6B8F40" opacity="0.72" />
      {/* Bottom shadow edge */}
      <rect x="6" y="41" width="52" height="4" rx="2" fill="#6B4A28" opacity="0.45" />
      {/* Side division */}
      <line x1="32" y1="23" x2="32" y2="41" stroke="#6B4A28" strokeWidth="1" opacity="0.35" />
    </>
  ),

  greenhouse_bed: (
    // House/arch shape — viewed from above, showing the ridge and panes
    <>
      <path d="M32 5 L58 24 L58 60 L6 60 L6 24 Z" fill="#A8C882" opacity="0.65" />
      {/* Roof triangle */}
      <path d="M32 5 L58 24 L6 24 Z" fill="#7AAA5A" />
      {/* Ridge pole */}
      <line x1="32" y1="5" x2="32" y2="60" stroke="#4A7A30" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
      {/* Vertical pane dividers */}
      <line x1="19" y1="24" x2="19" y2="60" stroke="#4A7A30" strokeWidth="1" opacity="0.45" />
      <line x1="45" y1="24" x2="45" y2="60" stroke="#4A7A30" strokeWidth="1" opacity="0.45" />
      {/* Horizontal pane divider */}
      <line x1="6" y1="42" x2="58" y2="42" stroke="#4A7A30" strokeWidth="1" opacity="0.45" />
    </>
  ),

  window_box: (
    // Very narrow horizontal trough
    <>
      <rect x="2"  y="23" width="60" height="18" rx="3" fill="#8B6340" />
      <rect x="5"  y="26" width="54" height="12" rx="1" fill="#6B8F40" opacity="0.72" />
      {/* Dividers — 3 sections */}
      <line x1="22" y1="26" x2="22" y2="38" stroke="#6B4A28" strokeWidth="1.5" opacity="0.55" />
      <line x1="42" y1="26" x2="42" y2="38" stroke="#6B4A28" strokeWidth="1.5" opacity="0.55" />
      {/* Bottom edge */}
      <rect x="4" y="39" width="56" height="2" rx="1" fill="#6B4A28" opacity="0.35" />
    </>
  ),

  grow_bag: (
    // Rounded bag shape — slightly irregular, bulging
    <>
      <ellipse cx="32" cy="36" rx="26" ry="22" fill="#3A2A1A" />
      <ellipse cx="32" cy="34" rx="22" ry="18" fill="#5A3A1A" opacity="0.85" />
      <ellipse cx="32" cy="33" rx="18" ry="14" fill="#6B8F40" opacity="0.68" />
      {/* Bag tie / clip at top */}
      <ellipse cx="32" cy="15" rx="7" ry="4" fill="#2A1A0A" />
      <line x1="32" y1="15" x2="32" y2="20" stroke="#2A1A0A" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};
