# Community Services

This folder contains Angular services for the community backend APIs.

## Files

- `community.service.ts`: communities, membership, members, rules, and flairs
- `post.service.ts`: posts, trending feed, search, and voting endpoints for posts
- `comment.service.ts`: comment CRUD and accepted-answer flows
- `messaging.service.ts`: inbox, conversations, and message sending
- `vote.service.ts`: reusable vote operations where components need direct access
- `notification.service.ts`: local notifications used by community messaging flows

## Guidance

- Keep request headers and endpoint assembly centralized here.
- Surface typed observables so components stay mostly declarative.
