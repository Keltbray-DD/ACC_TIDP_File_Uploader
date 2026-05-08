# Forma TIDP Creator/Uploader — Feedback & Improvements Backlog

Living list of issues, fixes, and improvements. Items are grouped by category, not priority — a `[P0]`/`[P1]`/`[P2]` tag on each marks suggested priority. `[DONE]` marks items already shipped in the current branch.

---

## 1. Already done in this session

- **[DONE] XSS hardening** — filename and spreadsheet `Information identification` cells now go through `textContent` instead of `innerHTML`. (`js/extractData.js`, `js/uploadData.js`)
- **[DONE] Sequential uploads with real error reporting** — uploads now run one at a time via `for...of` + `await`, each wrapped in try/catch. Summary at the end is `"X of Y uploaded; Z failed"` instead of an unconditional success message. Failed rows are listed in the browser console. (`js/uploadData.js`)
- **[DONE] Removed dead `sessionStorage` write** — `setItem('userDetails', userDetails)` was storing the literal string `"[object Object]"`. (`js/login.js`)
- **[DONE] Project dropdown empty on first load** — added a `loginReady` promise resolved only after `getUserDetailsFill()` completes; `gatherArrays()` awaits it before calling `listProjects()`. Also made `checkLogin` actually `await refreshToken()` and made the OAuth `.then` callbacks await `getUserDetailsFill()` so userID is guaranteed to be in sessionStorage before the project list fetch runs. (`js/variables.js`, `js/login.js`, `js/getACCData.js`)
- **[DONE] Single-file TIDP generation** — `convertToExcelTable` now fetches the static template, opens it as a ZIP via JSZip, and surgically replaces only the `<sheetData>` block inside `xl/worksheets/sheet3.xml` (the Dropdown list sheet). Every other file in the archive — including the TIDP sheet's Excel Table, conditional formatting, calcChain, drawings, styles, and shared strings — stays byte-identical. Downloads one merged `<projectName>_TIDP.xlsx`. Initial attempts via SheetJS round-trip (lost styles) and ExcelJS round-trip (corrupted the TIDP sheet's Table and produced a "we found a problem with some content" repair dialog) were both replaced by this surgical approach. (`index.html`, `js/getACCData.js`)
- **[DONE] V2 template support — Status & Document Classification + column renames** — fetch path moved to `TIDP_Template_V2.xlsx`. Dropdown list layout now M = Document Classification, N = Status, O–P = Templates, Q–R = Folders (Paper Size and Scale columns dropped). Status and Document Classification options pulled at TIDP-generate time from the ACC docs custom-attribute-definitions endpoint (first deliverable folder). Upload mapping rewritten: `Title Line` → ACC `Title Line 1`, `File Description` → ACC `File Description`, `Status` → ACC `Status`, `Document Classification` → ACC `Document Classification`. Blank cells fall back to placeholder defaults (Title Line → IIA filename, File Description → `"TIDP Placeholder File"`, Status / Document Classification → first allowed value from the project). Revision still hardcoded at `P01.01`. Project Stage / Paper Size / Scale attributes are no longer set. (`index.html`, `js/getACCData.js`, `js/uploadData.js`)
- **[DONE] V2 parser fix** — Excel-side parser was hardcoded to read headers from row 10 (V1 layout). Now reads from row 1 across A:P, matching V2's table position. (`js/extractData.js`)
- **[DONE] Pre-upload row-level validation** — every row is checked before any API calls. Mandatory: `Title Line`, `Placeholder Template`, `Target Folder`, and a complete IIA (all 7 components — Project PIN, Originator, Functional Breakdown, Spatial Breakdown, Form, Discipline, Number). Recommended: `File Description`, `Status`, `Document Classification` (warning, defaults applied). Errors block the upload entirely. (`js/uploadData.js`)
- **[DONE] Console-style upload log panel** — scrollable, colour-coded, timestamped panel under the upload buttons surfaces validation issues and per-row upload outcomes inline rather than burying them in the browser console. Includes a Clear button. Persists max-height (260px) with overflow scrolling. (`index.html`, `assets/css/main.css`, `js/uploadData.js`)
- **[DONE] Two-stage validate → confirm flow** — `Validate TIDP` button runs validation only and reveals the `Confirm Upload to ACC` button. Confirm is visible-but-disabled by default with a tooltip explaining why; only enables when validation passes. Both buttons lock during the upload to prevent users from kicking off a second pass. File re-upload or any new validation pass resets the gate. (`index.html`, `js/uploadData.js`, `js/extractData.js`)
- **[DONE] Robust template editing — dynamic sheet path & style** — sheet path for the Dropdown list is now resolved via `xl/workbook.xml` + `xl/_rels/workbook.xml.rels` instead of hardcoded `sheet3.xml`, so adding/removing/rearranging tabs in the template no longer breaks generation. Empty-cell style index is also detected from the existing A1 cell rather than hardcoded, so restyling the Dropdown list sheet won't break formatting either. (`js/getACCData.js`)
- **[DONE] PKCE auth — client secret removed from the browser** — replaced confidential-client OAuth (with hardcoded `Basic client_id:secret`) with PKCE (RFC 7636). `signin()` now generates a 64-byte verifier + SHA-256 S256 challenge per flow; the verifier is held in sessionStorage across the redirect and submitted with the code at `/token`. `getAuthorisation` and `refreshToken` no longer send any `Authorization` header — just `client_id` (now `apsClientId` in `variables.js`) and the verifier in the body. The verifier is wiped after a successful exchange so a leaked code can't be replayed. Restored the await chain in `checkLogin` → `refreshToken` → `getUserDetailsFill` so `loginReady` doesn't resolve until userID is in sessionStorage. Both `/token` callers now check `response.ok` before parsing JSON and wipe + reload on any non-2xx so a stale or wrong-client refresh token can't poison the session. **Existing users have a one-time re-login** since refresh tokens are scoped to the previous client ID. (`js/variables.js`, `js/login.js`)
- **[DONE] Cleanup pass** — removed two duplicate `<script>` tags for jQuery and two for PapaParse from `index.html`; PapaParse was never called in any JS file and jQuery was used in only two `$("#id").val()` calls in `extractData.js`, both replaced with vanilla `document.getElementById(...).value`. `.xlsx` file type is now enforced at the JS layer in `handleFile()` so drag-drop can't bypass the `<input accept=".xlsx">`. OAuth `state` is now a random 16-byte base64url token per flow, stored in sessionStorage and verified on redirect; mismatches restart the OAuth flow rather than redeem an attacker-controlled code. (`index.html`, `js/extractData.js`, `js/login.js`)
- **[DECIDED — keep `localStorage`]** Refresh token storage. Now that PKCE has removed the shared secret, the marginal XSS risk of `localStorage` is small for an internal tool with controlled JS surface, while the UX cost of `sessionStorage` (re-login per tab + on browser restart) is constant. Keeping current behaviour.
- **[DECIDED — keep hardcoded]** Placeholder Revision (`P01.01`) and File Description fallback (`TIDP Placeholder File`). Validation now warns when these cells are blank, so the fallback is rarely hit; not worth the churn of lifting to constants or wiring to new TIDP columns. Values stay inline in `js/uploadData.js`.

---

## 2. Blocking / must-fix

_(Empty — all P0/P1 items resolved.)_

---

## 3. UX & workflow

User-facing wins. None are show-stoppers but all reduce friction or risk.

- **[P2] Partial-failure recovery export**
  - When some uploads fail, give the user a downloadable CSV/XLSX of just the failed rows so they can fix and re-run without creating duplicates.

- **[P2] Progress bar should reflect failures**
  - Currently increments unconditionally even when an item errored. Consider colouring failed segments differently or showing `succeeded/total` numerically next to the bar.

- **[P2] Duplicate filename / IIA detection**
  - Validation currently checks each row in isolation. If two rows produce the same Information Identification value (and therefore the same filename), only one will land in ACC and the other will fail or overwrite. Catch this in the validation pass and flag both rows.

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
- **[P2] Add a build step + linter** — minimal Vite + ESLint setup would have caught the upload-loop bug, the duplicate scripts, and the broken `sessionStorage` write automatically.
- **[P2] Swallowed errors elsewhere** — most API helpers still end with `.catch(error => console.error(...))`, returning `undefined` instead of propagating. The upload and token paths now handle this defensively, but other call sites (e.g. project list, folder list, naming standard fetch) still hide failures from the UI.

---

## 6. Smaller wins

- **[P2] Feedback widget assets are loaded inside `<body>`** (`index.html:110-112`) — move CSS/JS to `<head>` for consistency.
- **[P2] Version string hand-edited** — `js/variables.js:2`. A one-line `npm version` script would keep it in sync with git tags.

---

## Suggested order of attack

1. **Auth hardening (P0)** — client secret + refresh-token in localStorage. Single biggest outstanding risk; needs your call on PKCE vs Power Automate proxy.
2. **Hardcoded revision/description (P1)** — quick decision: keep as named constants or pull from new TIDP columns?
3. **Cleanup pass (P2)** — duplicate `<script>` tags, drop jQuery, drag-drop xlsx validation, swallowed `.catch` errors. All small; could land as one bundled PR.
4. **Polish (P2)** — duplicate IIA detection, partial-failure CSV export, progress bar colouring failures, hardcoded tenant.
5. **Architecture (P2)** — globals refactor + build step. Big, do when the codebase next needs significant changes.
