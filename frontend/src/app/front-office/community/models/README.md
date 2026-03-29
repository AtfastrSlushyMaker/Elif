# Community Models

This folder stores the TypeScript interfaces used by the community feature.

## Files

- `community.model.ts`: community, member, rule, and flair shapes
- `post.model.ts`: thread/post payload used by list, detail, and creation flows
- `comment.model.ts`: nested comment structure for post discussion
- `message.model.ts`: inbox and conversation message shapes

## Guidance

- Keep models aligned with backend DTOs and controller responses.
- Prefer extending interfaces here before adding ad hoc component-local types.
