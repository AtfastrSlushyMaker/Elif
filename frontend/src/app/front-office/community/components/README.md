# Community Components

This folder contains both route-level pages and smaller reusable building blocks for the community feature.

## Route Components

- `community-list/`: discovery landing page
- `community-detail/`: community hub page
- `community-create/`: create-community workflow
- `post-create/`: new thread composer
- `post-detail/`: single-thread page
- `inbox/`: direct-message inbox
- `chat-window/`: direct-message conversation view

## Reusable Components

- `post-card/`: Reddit-style post preview card
- `comment-tree/`: nested comment renderer and interaction surface
- `vote-buttons/`: compact upvote/downvote controls
- `flair-badge/`: flair pill used in thread presentation

## Maintenance Guidance

- Keep route components focused on orchestration and page-level state.
- Push repeated visual patterns into reusable components when they appear in more than one page.
- Keep API access inside `../services` rather than calling `HttpClient` directly in components.
