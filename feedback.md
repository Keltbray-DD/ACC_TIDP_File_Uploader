# ACC TIDP Creator/Uploader — Feedback & Improvements Backlog

Living list of issues, fixes, and improvements. Items are grouped by category, not priority — a `[P0]`/`[P1]`/`[P2]` tag on each marks suggested priority. `[DONE]` marks items already shipped in the current branch.

---

## 1. Already done in this session

- **[DONE] XSS hardening** — filename and spreadsheet `Information identification` cells now go through `textContent` instead of `innerHTML`. (`js/extractData.js`, `js/uploadData.js`)
- **[DONE] Sequential uploads with real error reporting** — uploads now run one at a time via `for...of` + `await`, each wrapped in try/catch. Summary at the end is `"X of Y uploaded; Z failed"` instead of an unconditional success message. Failed rows are listed in the browser console. (`js/uploadData.js`)
- **[DONE] Removed dead `sessionStorage` write** — `setItem('userDetails', userDetails)` was storing the literal string `"[object Object]"`. (`js/login.js`)
- **[DONE] Project dropdown empty on first load** — added a `loginReady` promise resolved only after `getUserDetailsFill()` completes; `gatherArrays()` awaits it before calling `listProjects()`. Also made `checkLogin` actually `await refreshToken()` and made the OAuth `.then` callbacks await `getUserDetailsFill()` so userID is guaranteed to be in sessionStorage before the project list fetch runs. (`js/variables.js`, `js/login.js`, `js/getACCData.js`)
- **[DONE] Single-file TIDP generation** — `convertToExcelTable` now fetches the static template, opens it as a ZIP via JSZip, and surgically replaces only the `<sheetData>` block inside `xl/worksheets/sheet3.xml` (the Dropdown list sheet). Every other file in the archive — including the TIDP sheet's Excel Table, conditional formatting, calcChain, drawings, styles, and shared strings — stays byte-identical. Downloads one merged `<projectName>_TIDP.xlsx`. Initial attempts via SheetJS round-trip (lost styles) and ExcelJS round-trip (corrupted the TIDP sheet's Table and produced a "we found a problem with some content" repair dialog) were both replaced by this surgical approach. (`index.html`, `js/getACCData.js`)
- **[DONE] V2 template support — Status & Document Classification + column renames** — fetch path moved to `TIDP_Template_V2.xlsx`. Dropdown list layout now M = Document Classification, N = Status, O–P = Templates, Q–R = Folders (Paper Size and Scale columns dropped). Status and Document Classification options pulled at TIDP-generate time from the ACC docs custom-attribute-definitions endpoint (first deliverable folder). Upload mapping rewritten: `Title Line` → ACC `Title Line 1`, `File Description` → ACC `File Description`, `Status` → ACC `Status`, `Document Classification` → ACC `Document Classification`. Blank cells fall back to placeholder defaults (Title Line → IIA filename, File Description → `"TIDP Placeholder File"`, Status / Document Classification → first allowed value from the project). Revision still hardcoded at `P01.01`. Project Stage / Paper Size / Scale attributes are no longer set. (`index.html`, `js/getACCData.js`, `js/uploadData.js`)

---

## 2. Blocking / must-fix

These break or threaten production usage.

- **[P0] Client secret exposed in browser** — `js/login.js:117`, `js/login.js:173` ship a hardcoded `Basic` auth header that base64-decodes to `client_id:client_secret`. Anyone with devtools can extract it.
  - **Recommended fix: PKCE.** Pure code change. Requires enabling PKCE on the Autodesk app in the APS console first, otherwise login breaks.
  - **Alternative: extend the existing Power Automate proxy** (`js/getACCData.js:205`) to also handle the user-OAuth code exchange and refresh, mirroring the pattern already in use for app tokens.

- **[P0] Refresh token in `localStorage`** — combined with the secret above, an XSS gives an attacker permanent ACC access on the user's behalf. Tied to the auth refactor above; with PKCE, the refresh token can move to `sessionStorage` (cleared on tab close).

---

## 3. UX & workflow

User-facing wins. None are show-stoppers but all reduce friction or risk.

- **[P1] Dry-run / confirmation screen before uploading**
  - For a tool that creates hundreds of files, currently one click and uploads start firing.
  - Show: row count, target folder, parsed preview, count of any rows skipped due to validation. Confirm before running.

- **[P1] Validate the TIDP client-side before uploading**
  - Catch missing required columns, blank required cells, invalid scale/paper-size/status/classification values, and duplicate filenames *before* any API calls.
  - Much faster feedback than discovering it row-by-row mid-upload.

- **[P2] Partial-failure recovery export**
  - When some uploads fail, give the user a downloadable CSV/XLSX of just the failed rows so they can fix and re-run without creating duplicates.

- **[P2] Progress bar should reflect failures**
  - Currently increments unconditionally even when an item errored. Consider colouring failed segments differently or showing `succeeded/total` numerically next to the bar.

---

## 4. Configurable values (currently hardcoded)

- **[P1] Per-row revision and description hardcoded**
  - `js/uploadData.js`: every uploaded item gets `revision = "P01.01"` and `description = "TIDP Placeholder File"`.
  - **Decision needed:**
    1. Are these intentional defaults for placeholders? If yes, lift to named constants in `js/variables.js` so they live in one place.
    2. Or should they come from new TIDP columns? If yes, name the columns and wire them up alongside Stage/Scale/Sheet size.

- **[P2] Hardcoded Keltbray tenant** — `js/variables.js:7-10` bakes hub ID, account ID, bucket, and folder URN. If the tool is meant to serve other Aureos clients, derive these from the logged-in user's accessible hubs (or move to a config file).

---

## 5. Architecture & maintainability

Lower priority but high-leverage if the tool is going to keep growing.

- **[P2] ~50 mutable globals in `js/variables.js`** — every file reads and writes shared state. Wrap into a single state object or split into modules; would have made the upload-loop fix far smaller.
- **[P2] Duplicate `<script>` tags** — `index.html` loads PapaParse twice (lines 15, 22) and jQuery twice (lines 17, 20). Remove duplicates.
- **[P2] Drop jQuery** — barely used; codebase is otherwise vanilla DOM. Saves a dependency and ~90 KB.
- **[P2] Add a build step + linter** — minimal Vite + ESLint setup would have caught the upload-loop bug, the duplicate scripts, and the broken `sessionStorage` write automatically.
- **[P2] Swallowed errors elsewhere** — most API helpers still end with `.catch(error => console.error(...))`, returning `undefined` instead of propagating. The upload path now handles this defensively, but other call sites (e.g. token fetch, project list) still hide failures from the UI.

---

## 6. Smaller wins

- **[P2] Feedback widget assets are loaded inside `<body>`** (`index.html:110-112`) — move CSS/JS to `<head>` for consistency.
- **[P2] No `.xlsx` validation on drag-drop** — the `accept=".xlsx"` attribute isn't enforced for dropped files; `js/extractData.js` will try to parse anything.
- **[P2] Version string hand-edited** — `js/variables.js:2`. A one-line `npm version` script would keep it in sync with git tags.

---

## Suggested order of attack

1. **First sprint (unblock production):** P0 Forma fields (Status + Document Classification) → P0 first-load dropdown bug → P0 auth refactor (decide PKCE vs proxy first).
2. **Second sprint (UX wins):** single-file TIDP generation → client-side validation → dry-run preview.
3. **Third sprint (cleanup):** duplicate scripts, jQuery removal, lift hardcoded values to config, consider build step.
