# Miles & Meals Operating Manual

## Standard Production Flow

```text
Capture
-> Ingest
-> Organize
-> AI Enhancement
-> Lightroom / CapCut
-> Caption Studio
-> Approval
-> Schedule
-> Publish
-> Analytics
-> Archive
```

## 1. Capture

Capture authentic destination, food, people, atmosphere, and movement. Record enough context to support accurate captions later.

Recommended capture notes:

- Destination.
- Exact location or neighborhood.
- Date.
- Meal or attraction name.
- Personal memory or story angle.
- Weather and time of day.
- Any restrictions, cultural notes, or source credits.

## 2. Ingest

Move raw media into `folder_structure/RAW`.

Suggested naming convention:

```text
YYYY-MM-DD_COUNTRY-CITY_LOCATION_SEQUENCE.ext
```

Example:

```text
2026-06-27_PH-Manila_Binondo_001.CR3
```

## 3. Organize

Group media by destination or campaign before editing.

Recommended metadata tags:

- Destination.
- Country.
- City.
- Content pillar.
- Scene type.
- Food type.
- Platform target.
- Status.

## 4. AI Enhancement

Move AI-enhanced photo outputs to `folder_structure/Enhanced`.

Enhancement limits:

- Do not change recognizable locations.
- Do not invent skies, landmarks, dishes, or people.
- Do not alter facial identity.
- Do not make food look materially different from reality.
- Do not remove context that affects authenticity.

## 5. Lightroom Studio

Move edited selects to `folder_structure/Lightroom Ready`.

Choose presets by creative intent:

- Alpine Swiss - crisp mountain air, clean whites, restrained blues.
- Tropical Paradise - warm beaches, lively greens, gentle contrast.
- Emerald Forest - rich greens, protected highlights, earthy depth.
- Golden Escape - warm city walks, sunset glow, soft contrast.
- City Explorer - architectural clarity, natural contrast, balanced color.
- Cafe Stories - cozy interiors, soft skin tones, inviting food color.
- Night Lights - controlled highlights, cinematic shadow detail.

## 6. Video Enhancement

Move cleaned footage to `folder_structure/Video Ready`.

Recommended checks:

- Stabilization does not crop too aggressively.
- Denoise does not smear details.
- Sharpening does not create halos.
- Motion still feels natural.

## 7. CapCut Studio

Move active edits to `folder_structure/CapCut Projects`.

Final exported reels go to `folder_structure/Instagram Ready`.

Recommended reel structure:

```text
Hook -> Place/food reveal -> sensory detail -> movement -> payoff -> soft CTA
```

## 8. Caption Studio

Create caption drafts using `03_Caption_Studio.md` and save post metadata in `templates/post_brief_template.md`.

Caption rules:

- Be specific.
- Avoid pretending to know facts not captured.
- Keep the voice elegant, curious, and grounded.
- Include accessibility ALT text.
- Include destination and food context.

## 9. Approval

No post publishes automatically. Use `02_Approval_Checklist.md`.

Statuses:

- Draft.
- Needs edit.
- Approved.
- Scheduled.
- Published.
- Archived.

## 10. Publishing

Move published assets to `folder_structure/Published`.

Record:

- Platform.
- Publish date.
- Caption.
- Hashtags.
- Asset filenames.
- Link.
- Initial notes.

## 11. Analytics

Track performance in `templates/analytics_log.csv`.

Review:

- 24 hours after publishing.
- 7 days after publishing.
- 30 days after publishing.

## 12. Archive

Move completed projects to `folder_structure/Archive`.

Archive should preserve:

- Raw media.
- Enhanced media.
- Final exports.
- Caption records.
- Performance notes.
- Lessons learned.
