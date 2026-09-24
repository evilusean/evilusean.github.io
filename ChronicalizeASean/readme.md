# ChronicalizeASean — TODO / Future Sean Problems

## Ground rules
- Do one thing at a time. Kiro times out trying to one-shot everything.
- Get the app working before aesthetics (responsiveness is last).

---

## Up next (priority order)

### C — Expose parent_id and people fields in the Add/Edit event modal
The schema has `parent_id` and `people (@handle)` but the CRUD form doesn't show them yet.
Users can't set hierarchical relationships through the app — only by editing the sheet directly.
- `parent_id` field: dropdown or text input to pick/type the parent event id
- `people` field: text input for `@handle1 @handle2` style entry

### D — Hierarchical drill-down view
Click a parent event → timeline filters to show only that event and all its descendants.
Uses `parent_id` traversal (already in schema). Needs a "back to full timeline" breadcrumb.
Add view toggles / layer controls to reduce visual busyness — the current built-in data is crowded.

---

## Backlog

- Fix 'slice' — was meant to let user view a slice of the timeline, AI misinterpreted it
- Screensaver mode: display event name first, then date, then description and tags
- Export: let user pick CSV or spreadsheet format; user should be able to edit their sheet manually and re-import
- 'rows' and 'layout' buttons aren't working
- Add a favicon
- Remove or repurpose the 'Schema' button — unclear why it's in the toolbar
- Make app responsive for smaller screens (future, future problem)
- Fractal circle view? Scroll in/out infinitely from year 0 to current day
- Heatmap for tag connections (schizochartmaxxing)
- Screensaver froze previously — investigate if still broken after row wrapping fix

---

## Completed
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

TODO / Future Sean Problems :
- The screensaver mode/slideshow froze, ran out of tokens, also, future Sean, do one of these at a time, kiro timed out a bunch trying to 'one shot' it
- ran out of tokens, mid-prompt, again - I left off trying to improve the timeline, so it can go multi level or side scroll 
- make app responsive, currently only works for large screen (this is a future, future, future sean problem, still have to get the app to work before aesthetics)
- events sheet / people sheet don't work yet, I should allow the user to create a timeline, and open that up on their google sheets, top row should be clearly labeled, all mandatory entries should have a mandatory * asterisk or whatever the user should leave empty (like id)
- rows look wonky, it starts each row back on the left hand side, which is not how timelines should look
- 'rows' and 'layout' buttons aren't working 
- add a favicon
- why is there a schema button there
- screensaver mode works now, it should display the name of the event first, then the date, then the details and other tags
- there should be a way in the schema to link people to events using tags '@tony_blair' (intentionally left uncapitalized) or whatever
- 'export'  should allow the user to download the current timeline they have worked on, so they can 'import' it again whenever they want to use it, it should be spreadsheet or csv (let the user pick what to download as) - they should also be able to edit their own on google sheets by manually filling in the columns
- 'end date' shouldn't be mandatory (only 'start date') 
- you should be able to create subevents of the main events like for carthage delende est, you would have the 'Punic Wars' event, and then each 'Battle' could be a subevent, but 'The Punic Wars' would be a subevent of 'The Roman Empire', figure out a way to make that work with link/join those, the schema is gonna need alot of work, because I need to be able to link events, subevents, sub-sub events, people, dates, etc. 
- add view toggles for each subevent - maybe layers? I'm trying to think of ways to reduce how much stuff needs to be on screen at once, right now, with just the examples, things look very 'busy'
- user should then be able to click on a 'main event' and see just the timeline of that and it's subevents
- So, will probably need a way to father-child events, maybe a new column? 
- fix 'slice' I was trying to allow the user to 'slice' one part of the timeline, but AI misinterpreted that 
- also, for some reason, the AI took 'Sir John Glubbs the Fate of Empires' literally, and took abstract concepts like 'the age of decadence' as objective physical events with dates (which is wrong) 
- Instead of a timeLINE, what about a fractal circle? where you can scroll in infinitely, like start at year '0' and scroll out to current day
- Don't forget the heat map for schizochartmaxxing
- update the schema, make it visual - maybe have the defeault as a spreadsheet to use as an example - it should be clearly labeled what each row is, which ones to fill in, which ones are mandatory, which to leave empty for the app to fill - I want these overly descriptive so there is no doubt, what to do on the spreadsheet, and if something breaks, I tried, it's your fault
- update the how to, so the user knows how to use it
- make the spiral zoom in relative to where the pointer is - so instead of it always zooming back, it can zoom / slice to a certain time, like if I want to zoom in on a specific time period on the spiral, I just have to hover and scroll wheel up - if I want to 
- maybe make a way to invert the spiral timeline? which makes more intuitive sense? outward events happening inward making you the person/timeline you are today - or past events happening outward reaching out in a fractal spiral infinitely 'prime mover' vs 'unmoved mover' - maybe add a toggle? - I've already got 2 rows of buttons 