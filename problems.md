# Known Problems

## Event geocoding places coordinates at the wrong location (venue-name geocoding failure)

**Status:** Open

**Severity:** High — corrupts distance sorting and "near you" discovery for affected events.

### Symptom

An MSA UBC Jumu'ah event (`org_posts.id = 983d8662-a286-430a-982d-3c832c83a3ca`) shows an absurd distance (~12,570 km from Toronto, and a wrong distance for a user only ~14 km from the real venue). Every viewer sees a wrong distance, regardless of where they are.

### Root cause

The event's stored coordinates are in **Hong Kong**, not Vancouver:

| Field                        | Stored value                                  |
| ---------------------------- | --------------------------------------------- |
| `location` (text)            | "Marine Drive Residence - Hong Kong Ballroom" |
| event `lat` / `long`         | `22.410689`, `113.977204` (Hong Kong)         |
| org (MSA UBC) `address`      | 6174 University Blvd                          |
| org `latitude` / `longitude` | `49.26528`, `-123.24951` (Vancouver, correct) |

At event creation, the free-text venue name was sent to a geocoding API. The geocoder latched onto the "Hong Kong" token in the venue name and returned a Hong Kong coordinate, ignoring that "Marine Drive Residence" is a UBC building in Vancouver.

### What is NOT broken

- Distance formula (`search_events` RPC → PostGIS `st_distance`) — correct; Toronto → Hong Kong really is ~12,500 km.
- Viewer location — correct.
- Org (MSA UBC) coordinates — correct (Vancouver).
- Only the **event record's** `lat`/`long` is wrong.

### Why it recurs

This is a data-quality issue at event creation. It will happen for any venue whose name contains a stronger place token than its actual location.

### Suggested fixes (not yet implemented)

1. Default to the org's coordinates for events at the org's own address, instead of geocoding a free-text venue name.
2. Sanity-check the geocode: if an event's resolved point is implausibly far from its org (e.g., > 100 km), reject/flag it rather than storing it.
3. Let the creator confirm the pin on a map before saving, so a bad geocode is visible immediately.

### Immediate remedy for the affected post

Correct the stored `lat`/`long` on post `983d8662-a286-430a-982d-3c832c83a3ca` to the real UBC Marine Drive Residence location.

---

## Timezone handling for event visibility is naive (partial fix applied)

**Status:** Partially fixed — quick fixes applied to both live paths; robust fix still pending.

**Severity:** Medium — events across timezones can be hidden from viewers before they actually end.

### Symptom

An event in Vancouver (BC, PST) was hidden from a viewer in Toronto (EST) even though it had not yet ended in its own timezone.

### Root cause

Event `date` + `start_time`/`end_time` are stored as naive local wall-clock values with no timezone. Comparisons treated them as either the device's timezone (client) or UTC (server), so an event looked "past" hours earlier than it actually ended.

### Quick fixes applied

- **Client (`src/Utils/announcementVisibility.ts`):** `isAnnouncementUpcoming` now accepts the org's IANA timezone and re-expresses "now" in that zone (via `Intl.DateTimeFormat`), matching the pattern already used by `JummahCard`. Wired through `fetchMyAnnouncements` (joins `organizations.timezone`) and `NotificationList`.
- **Server (`search_events` RPC):** the date-filter clause now interprets the naive end time in the org's timezone using `... AT TIME ZONE coalesce(o.timezone, 'UTC')` before comparing to `now()`.

### Proper fix (not yet implemented)

Store an absolute end instant (`timestamptz`, computed at write time from local time + org IANA zone) and compare against `now()`. This gives one source of truth instead of two parallel timezone conversions in JS and SQL. Keep the IANA zone for display only.
