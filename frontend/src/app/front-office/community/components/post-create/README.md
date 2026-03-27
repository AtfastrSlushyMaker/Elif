# Post Create Component

`PostCreateComponent` handles new thread creation inside a community.

## Responsibilities

- Resolve the target community from the route slug or query params
- Load available flairs for the selected community
- Submit new posts through `PostService`
- Redirect to the new thread on success

## Notes

- This workflow expects an authenticated member context before publishing
