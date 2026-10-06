# ChronicalizeASean — TODO / Future Sean Problems

## Ground rules
- Do one thing at a time. Kiro times out trying to one-shot everything.
- Get the app working before aesthetics (responsiveness is last).

---

## Up next (priority order)

- Glubb data audit: the Fate of Empires timeline has abstract concepts as objective events with dates (wrong) — needs a rewrite
- Add the media/propaganda timeline data (see Default Timeline to Add section)

---

## Backlog

- make app responsive, currently only works for large screen (this is a future, future, future sean problem, still have to get the app to work before aesthetics)
- Instead of a timeLINE, what about a fractal circle? where you can scroll in infinitely, like start at year '0' and scroll out to current day
- Don't forget the heat map for schizochartmaxxing (tag connection heatmap)
- maybe make a way to invert the spiral timeline? which makes more intuitive sense? outward events happening inward making you the person/timeline you are today - or past events happening outward reaching out in a fractal spiral infinitely 'prime mover' vs 'unmoved mover' - maybe add a toggle?
- also, for some reason, the AI took 'Sir John Glubbs the Fate of Empires' literally, and took abstract concepts like 'the age of decadence' as objective physical events with dates (which is wrong) - needs a data audit/rewrite

---

## Default Timeline to Add (Media / Propaganda history)

- Gutenberg Printing Press
- 'Propaganda' 1622 - Pope Gregory XV - 'Sacra Congretio de Propaganda Fide'
- 1770 Pamphleteers America
- 1830 chartist movement - penny press - northern star press
- 1853 Crimean War Vs John Thadeus Delane (The Times London) Vs Horace Greely (NY Tribune)
- WT Stead Writes 'Govern by Journalism' 1886
- Alfred Milner + WT Stead + Cecil Rhodes Roundtable Groups Origins - 1891
- 1897-1905 (Milners Kindergarten)
- 1909 Roundtable Group Vs Carrol Quigley
- 1919 (Chatham House - RIIA = Royal Institute for International Affairs)
- 1921 CFR
- 1923 Edward Bernays 'Crystalizing Public Opinion' 1928 'Propaganda'
- Opium Wars - Sassoons - British East India Co
- Enclosure Movement
- Treaty of Westphalia
- War of 1812 / Battle of Waterloo
- Bank of England

---

## Completed

- Hierarchical drill-down: click "🔍 Drill in" on any event with children (detail panel or popover) → timeline/spiral filters to that event + all descendants. Breadcrumb bar shows the drill path with clickable crumbs to navigate up. "⬆ Up" goes one level, "✕ All events" clears. "under ParentName" in the detail panel is a clickable link to drill into the parent. Escape also clears drill. Drill resets on timeline switch.
- Layout / Rows controls now work: Layout (Wrap rows / Single strip) and Rows (Auto / 2–8) selects were never wired to event listeners or initialized from persisted state — both now respond immediately and persist across reloads. Rows select is disabled when in Single strip mode.
- Slice view fixed: grain select (All / Decade / Century) + ‹ › buttons now navigate time windows derived from actual record year range. Chip bar appears below controls showing all windows; click any chip to jump. Switching to "All time" clears the date range.
- Parent marker indicator: events with children show a small amber ring below their emoji on both the SVG timeline and the spiral canvas — makes drill-down discoverable at a glance.
- Screensaver staged reveal: name appears first, then dates fade in after ⅓ of the slide duration, then description + tags after ⅔. Pausing fast-forwards to fully revealed. Stop/skip restore full visibility.
- Spiral zoom-to-pointer: scroll wheel now zooms toward the cursor position rather than always re-centering. Pan offset is maintained across renders. Zoom-reset (⊙) also resets pan to center.
- Schema button removed (was dead — no listener, no modal).
- Favicon added (⏳ emoji SVG data URI, no image file needed).
- "How to use" fully rewritten to cover drill-down, spiral, slice, layout/rows, staged slideshow, and all current fields.
- Spiral click reliability fixed: minimum hit radius raised to 14px so small/low-importance events are always clickable.
- Export format picker: 💾 Export button now opens a dropdown with CSV (.csv) and TSV (tab-separated, pastes directly into Google Sheets without an import wizard). Old single-click CSV still works as before; just pick from the menu.
- Hide/Show Controls toggle: ⊟ button at the left of the controls bar collapses the entire row to a single button (⊞ to restore). Frees up screen real estate when you want more canvas.
- Depth filter: Depth select in controls bar (All levels / Root only / Root+1 / Root+2) hides child events beyond the chosen level. "Root only" fixes the busy screen problem — shows just the top-level events, drill down to see children. Clear filters resets depth too.
- Spiral click fix (for real this time): canvas CSS size (100%×100%) was mismatched with the canvas pixel buffer size, so `getBoundingClientRect()` coords didn't map to the same space as SPIRAL_HITS. All click/hover/wheel handlers now apply `scaleX = canvas.width / rect.width` and `scaleY = canvas.height / rect.height` to correct the mismatch.
- UI: Add/Edit event modal now has Parent event (dropdown of other events), People (`@handle`s), and Location
- Schema: added `parent_id` for unlimited-depth sub-events (Roman Empire → Punic Wars → Battle of Zama)
- Schema: added `people` field for `@handle` linking to People tab
- Schema: added `location` field
- People schema: added `handle` and `nationality` fields
- Google Sheets: merged two-spreadsheet architecture into one file with tabs (Events tabs + People tab)
- Google Sheets: duplicate creation guard — checks if spreadsheet already exists before creating
- Google Sheets: `ensureSheetHeaders()` — auto-migrates sheet headers when schema changes, no manual column editing needed
- Google Sheets: People tab now syncs from same spreadsheet on every event sync
- Google Sheets: `formatSheetHeaders()` — frozen header row, bold/dark styling, per-column notes with format hints, auto-resize
- Google Sheets: rich column labels (`*` for required, `(auto)` for app-filled, format hints for dates/people/tags)
- UI: Events Sheet and People Sheet buttons now hidden until a spreadsheet is connected
- UI: both sheet buttons now open the connect modal if clicked without a spreadsheet, instead of silently going to `#`
- Timeline: fixed row wrapping — duration bars for multi-row events now draw continuous segments across every row they span (start row → full-width intermediate rows → end row)
- Timeline: added end-year label at the right edge of each row so the wrap reads as a continuous chronological flow
- `end date` is not mandatory (only `start date` is required)
- rows and layout buttons weren't working — fixed
- add a favicon — done
- why is there a schema button there — removed
- screensaver mode should display the name of the event first, then the date, then the details and other tags — done
- there should be a way in the schema to link people to events using tags `@tony_blair` — done (`people` field, `@handle` linking)
- 'end date' shouldn't be mandatory — fixed
- you should be able to create subevents / father-child events — done (`parent_id` column, unlimited depth)
- user should then be able to click on a 'main event' and see just the timeline of that and it's subevents — done (drill-down)
- fix 'slice' — done
- update the how to, so the user knows how to use it — done
- make the spiral zoom in relative to where the pointer is — done
- Spiral layout doesn't allow you to click on some events — fixed (minimum hit radius)

# Future Sean Problems : 
- make app responsive, currently only works for large screen (this is a future, future, future sean problem, still have to get the app to work before aesthetics)
- rows look wonky, it starts each row back on the left hand side, which is not how timelines should look
- you should be able to create subevents of the main events like for carthage delende est, you would have the 'Punic Wars' event, and then each 'Battle' could be a subevent, but 'The Punic Wars' would be a subevent of 'The Roman Empire', figure out a way to make that work with link/join those, the schema is gonna need alot of work, because I need to be able to link events, subevents, sub-sub events, people, dates, etc. 
- add view toggles for each subevent - maybe layers? I'm trying to think of ways to reduce how much stuff needs to be on screen at once, right now, with just the examples, things look very 'busy'
- Don't forget the heat map for schizochartmaxxing
- update the schema, make it visual - maybe have the defeault as a spreadsheet to use as an example - it should be clearly labeled what each row is, which ones to fill in, which ones are mandatory, which to leave empty for the app to fill - I want these overly descriptive so there is no doubt, what to do on the spreadsheet, and if something breaks, I tried, it's your fault
- make the spiral zoom in relative to where the pointer is - so instead of it always zooming back, it can zoom / slice to a certain time, like if I want to zoom in on a specific time period on the spiral, I just have to hover and scroll wheel up - if I want to 
- Spiral layout doesn't allow you to click on some events
