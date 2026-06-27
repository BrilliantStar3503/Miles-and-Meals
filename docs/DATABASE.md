# Database and State

No hosted database has been implemented yet.

The current MVP uses a local JSON state file generated at:

```text
content-factory/content-factory-state.json
```

This file is runtime data and is ignored by git.

## Current Status

- Schema: local JSON state store.
- Migrations: none.
- Indexes: none.
- Constraints: none.
- Relationships: media records can reference generated drafts by media ID.

## Local State Shape

```json
{
  "version": 1,
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "media": {
    "mediaId": {
      "id": "mediaId",
      "filename": "example.jpg",
      "relativePath": "RAW/example.jpg",
      "sourceStage": "RAW",
      "currentStage": "Enhanced",
      "enhancement": {},
      "sceneAnalysis": {},
      "presetRecommendation": {}
    }
  },
  "drafts": {
    "draft-mediaId": {
      "id": "draft-mediaId",
      "status": "pending_approval",
      "sourceMediaId": "mediaId",
      "platformDrafts": {}
    }
  },
  "events": []
}
```

## Event Log

Runtime events are also appended to:

```text
content-factory/Logs/events.ndjson
```

The event log is ignored by git.

## Future Notes

If the project later adds Supabase, a content dashboard, media library, analytics tracker, or publishing workflow, document the following here:

- Tables or collections.
- Field definitions.
- Relationships.
- Migrations.
- Indexes.
- Constraints.
- Seed data.
- Important query patterns.
- Data retention or archive rules.
