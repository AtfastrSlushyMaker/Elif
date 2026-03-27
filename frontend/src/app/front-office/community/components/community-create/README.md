# Community Create Component

`CommunityCreateComponent` handles the create-community workflow.

## Responsibilities

- Collect name, description, visibility, and optional visuals
- Preview the resulting community header before submission
- Validate the form before sending the create request
- Redirect to the newly created community page on success

## Dependencies

- `CommunityService`
- `AuthService`
- Angular reactive forms
