// src/constants/theme.ts
//
// Read from the live ranchrodeo.pro stylesheet rather than from the spine
// document. Where the two disagree the shipped site wins: a user opening
// the app straight off the website should not feel a colour change.

export const colors = {
  background: '#14100c',
  surface: '#1e1813',
  card: '#261f18',
  border: '#3f342a',
  text: '#e3d8c8',
  muted: '#ac9c86',
  accent: '#b3402f',
  accentAlt: '#d8a05c',
  cream: '#f1e6d4',
  success: '#4ba36b',
  warning: '#d99a2b',
  danger: '#c8503f',
} as const;

/**
 * The events this app covers, EXACTLY as their codes appear in the
 * `reference_options` table.
 *
 * Deliberately separate from `app.eventType` below, which is the app's own
 * slug and does not match the database ("tiedown" vs "tie_down_roping").
 * Reusing the slug as a filter silently matched nothing: the query succeeded,
 * the screen said the producer was not running this event, and there was no
 * error anywhere to notice.
 *
 * A list because the mapping is genuinely one-to-many, and the entries are NOT
 * interchangeable. Heading and heeling are two ends of the same run and a
 * roper does one of them; steer wrestling and chute dogging are different
 * events with different rules; ranch rodeo is a whole card. Filing every run
 * under the first code turned a heeler into a header and collapsed ten ranch
 * events into one.
 *
 * `resultKind` is per event because it genuinely varies within a card:
 * roughstock is two judges marking the horse and the rider out of 25 each,
 * where the eight seconds is a pass/fail gate rather than the result, and
 * everything else is on the clock.
 */
export type AppEvent = {
  /** The `reference_options` code, not the app slug. */
  code: string;
  label: string;
  resultKind: 'time' | 'score';
};

const EVENTS = [
  { code: "ranch_bronc", label: "Ranch bronc", resultKind: "score" },
  { code: "wild_cow_milking", label: "Wild cow milking", resultKind: "time" },
  { code: "team_penning", label: "Team penning", resultKind: "time" },
  { code: "team_sorting", label: "Team sorting", resultKind: "time" },
  { code: "ranch_doctoring", label: "Doctoring", resultKind: "time" },
  { code: "wild_horse_race", label: "Wild horse race", resultKind: "time" },
  { code: "ranch_branding", label: "Branding", resultKind: "time" },
  { code: "steer_mugging", label: "Steer mugging", resultKind: "time" },
  { code: "trailer_loading", label: "Trailer loading", resultKind: "time" },
  { code: "ranch_sorting", label: "Ranch sorting", resultKind: "time" },
] as const;

/**
 * The event a run is filed under when nothing says otherwise.
 *
 * Separate from `app.events[0]` so callers get a value that is always there.
 * Indexing a list gives `AppEvent | undefined` under this tsconfig, and the
 * `?? something` that silences it is exactly the kind of quiet default that
 * put a heeler's run under the header's code in the first place.
 */
export const primaryEvent: AppEvent = EVENTS[0];

export const app = {
  name: "Ranch Rodeo",
  short: "RanchRodeo",
  domain: "ranchrodeo.pro",
  eventType: "ranchrodeo",
  events: EVENTS as readonly AppEvent[],
  eventCodes: EVENTS.map((e) => e.code) as readonly string[],
  /**
   * What a run in this event is actually measured in.
   *
   * Roughstock is judged, not timed: a bronc ride is two judges marking the
   * horse and the rider out of 25 each, and the eight seconds is a pass/fail
   * gate rather than the result. Asking a bronc rider for "Time (seconds)" and
   * filing their 82-point ride in `final_time` records the wrong number in the
   * wrong column, and it reads back as an 82-second ride.
   *
   * "either" is for ranch rodeo, where the card is genuinely mixed — ranch
   * bronc is judged and every other event on it is timed.
   */
  resultKind: "either" as "time" | "score" | "either",
  eventLabel: "Ranch rodeo",
  tagline: "Placings become points before the dust settles.",
  associations: ["WRCA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
