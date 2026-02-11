export const SCALE_PROFILES = {
  small: {
    label: "Small / Focused",
    costRange: "\u00A31\u201310m",
    durationRange: "3\u201312 months",
    description: "Narrow terms of reference, limited witnesses, single issue. E.g. Hutton.",
    avgCost: 5,
    avgMonths: 8,
  },
  medium: {
    label: "Medium",
    costRange: "\u00A35\u201330m",
    durationRange: "1\u20133 years",
    description: "Moderate scope, multiple witness groups, some oral hearings. E.g. Leveson.",
    avgCost: 15,
    avgMonths: 24,
  },
  large: {
    label: "Large / Complex",
    costRange: "\u00A330\u2013180m",
    durationRange: "3\u20138 years",
    description: "Broad scope, extensive documentary evidence, prolonged hearings. E.g. Grenfell, Infected Blood.",
    avgCost: 100,
    avgMonths: 60,
  },
  veryLarge: {
    label: "Very Large / Systemic",
    costRange: "\u00A3150\u2013250m+",
    durationRange: "5\u201312+ years",
    description: "Multiple modules, systemic issues, massive evidence volumes. E.g. IICSA, Covid-19.",
    avgCost: 200,
    avgMonths: 96,
  },
};
