# Comment Tree Component

`CommentTreeComponent` is the recursive renderer for nested discussion replies.

## Inputs

- `comment`
- `postId`
- `postOwnerId`
- `postType`
- `depth`
- `userId`
- `acceptedAnswerSelected`

## Outputs

- `accept`: emitted when a question answer is accepted

## Responsibilities

- Render nested replies
- Allow vote and comment actions at each node
- Support accepted-answer behavior for question posts
- Keep reply forms inline so long threads stay readable
