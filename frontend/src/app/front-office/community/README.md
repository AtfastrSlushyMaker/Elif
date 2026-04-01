# Community Feature

This folder contains the front-office community experience for Elif.

## Scope

- Community discovery and browsing
- Community detail and membership workflow
- Community creation
- Post creation and post detail
- Comments, voting, inbox, and direct messaging

## Structure

- `components/`: route screens plus reusable UI blocks used inside the community feature
- `models/`: TypeScript interfaces for API payloads and view models
- `services/`: Angular services that call the community backend APIs
- `community-routing.module.ts`: route map for the feature
- `community-pages.module.ts`: declarations for community pages and UI pieces
- `community-shared.module.ts`: shared imports used across the feature

## Main User Flow

1. Users land on `CommunityListComponent` to discover spaces and trending posts.
2. Users open `CommunityDetailComponent` by slug to read rules, browse posts, and join or leave.
3. Joined users can create posts from `PostCreateComponent`.
4. Post discussion happens in `PostDetailComponent` with `CommentTreeComponent`.
5. Private conversations move through `InboxComponent` and `ChatWindowComponent`.

## Notes

- Membership state is driven by `userRole` returned from the backend.
- Post creation is intentionally gated by membership.
- Community rules and flairs are managed from the community detail screen after creation.
