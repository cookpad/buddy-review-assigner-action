# Buddy Review Assigner Action

A GitHub Action that automatically assigns a designated buddy to Pull Requests for use during their onboarding process.

At Cookpad, during the onboarding process you need to warm up to the Code Review process. As a new starter, you are already paired with a buddy and to help get you familiar with the Pull Request reviews, you should work with your buddy to review code alongside them.

Additionally, when you are assigned Pull Requests, your buddy is responsible to also help sense-check until you become a full-on contributor (usually after the probation period, but sometimes before).

The buddy-review-assigner-action helps to automate this process by making sure that the buddy is always assigned for reviews to the new starter Pull Requests and vice versa.

## Usage

Add the following workflow to a repository:

**.github/workflows/buddy-review-assigner.yml**

```yml
name: Buddy Review Assigner
on:
  pull_request:
    types: [review_requested]

jobs:
  buddy-assignment:
    name: Buddy Assignment
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Action
        uses: actions/checkout@v3

      - name: Run Action
        uses: cookpad/buddy-review-assigner-action@main
        id: buddy-review-assigner-action
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

```

And add the following mapping file:

**.github/buddies.yml**

```yml
# This file contains a map of new starters and their buddies.
#
# Adding a mapping will ensure that both the new starter and their buddy
# will be synced as reviewers on pull requests in this repository.
#
# https://github.com/cookpad/buddy-review-assigner-action

new_starter: buddy
```

Where `new_starter` is the username of the new starer, and `buddy` is the username of their buddy.
