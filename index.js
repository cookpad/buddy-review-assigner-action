const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')
const fs = require('fs')

const main = async () => {
    try {
        // Read the inputs of the action
        const token = core.getInput('token', { required: true })
        const buddiesPath = core.getInput('buddies', { required: true })
        let prNumber = core.getInput('pr_number', { required: false })
        const repository = process.env.GITHUB_REPOSITORY
        const identifier = `${repository}#${prNumber}`

        // If the PR number wasn't provided, read it from the event
        const event = JSON.parse(await fs.promises.readFile(process.env.GITHUB_EVENT_PATH, 'utf8'))
        prNumber = event.pull_request.number

        // Read the buddies mapping file
        core.info(`Reading buddies from '${buddiesPath}'`)
        const buddies = yaml.load(await fs.promises.readFile(buddiesPath))
        const buddyCount = Object.keys(buddies).length

        // Don't continue if there aren't any buddies
        core.info(`Found ${buddyCount} buddy mappings`)
        if (buddyCount == 0) {
            return
        }

        // Load the Pull Request
        core.info(`Loading ${identifier}...`)
        const octokit = github.getOctokit(token)
        const meta = {
            owner: repository.split("/").at(0),
            repo: repository.split("/").at(-1),
            pull_number: parseInt(prNumber)
        }
        const { data: pull_request } = await octokit.rest.pulls.get(meta)
        const requested_reviewers = pull_request.requested_reviewers

        // Don't continue if the PR doesn't yet have any reviewers
        if (!requested_reviewers || requested_reviewers.length == 0) {
            core.info(`No reviewers assigned to ${identifier}.`)
            return
        }

        // Figure out who is already a reviewer
        const reviewerLogins = new Set(requested_reviewers.map(reviewer => reviewer.login))
        core.info(`Current reviewers: ${Array.from(reviewerLogins).join(', ')}`)

        // Figure out who needs to be added
        let reviewersToAssign = new Set()
        for (const [newStarter, buddy] of Object.entries(buddies)) {
            if (reviewerLogins.has(buddy) && !reviewerLogins.has(newStarter)) {
                reviewersToAssign.add(newStarter)
            } else if (reviewerLogins.has(newStarter) && !reviewerLogins.has(buddy)) {
                reviewersToAssign.add(buddy)
            }
        }

        // Remove the author if they were part of the list
        reviewersToAssign.delete(pull_request.user.login)

        // Don't do anything if there are no reviewers that need assigning
        if (reviewersToAssign.size == 0) {
            core.info(`No additional reviewers need assigning to ${identifier}`)
            return
        }

        // Request additional reviews
        core.info(`Adding additional reviewers... (${Array.from(reviewersToAssign).join(', ')})`)
        const response = await octokit.rest.pulls.requestReviewers(Object.assign({}, meta, {
            reviewers: Array.from(reviewersToAssign)
        }))

        // Check that they had been added successfully
        const updatedReviewers = new Set(response.data.requested_reviewers.map(reviewer => reviewer.login))
        let didError = false
        for (const expectedReviewer in reviewersToAssign) {
            if (!updatedReviewers.has(expectedReviewer)) {
                core.error(`@${expectedReviewer} has not been added to the Pull Request`)
                didError = true
            }
        }

        // Exit appropriately
        if (didError) {
            throw "Some users were not added to the Pull Request"
        } else {
            core.info(`Added ${reviewersToAssign.size} reviewer(s) to ${identifier} successfully ✅`)
        }
    } catch (error) {
        core.setFailed(error)
    }
}

main()
