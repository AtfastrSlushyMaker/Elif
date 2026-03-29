# Community Detail Component

`CommunityDetailComponent` is the main community hub page loaded by slug.

## Responsibilities

- Load community metadata, rules, flairs, posts, and member data
- Handle join and leave actions
- Gate thread creation based on membership
- Expose member tools and moderation tools
- Support flair filtering and post sorting

## Notes

- Member visibility depends on `userRole`
- Moderator and creator workflows live inside the management section
