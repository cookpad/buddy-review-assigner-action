const core = require('@actions/core')
const App = require('@octokit/app').App
const yaml = require('js-yaml')
const fs = require('fs')

const readBuddies = async (path) => {

    console.log(mapping)
    return mapping
}

const main = async () => {
    try {
        // Read the inputs of the action
        const token = core.getInput('token', { required: true })
        const buddiesPath = core.getInput('buddies', { required: true })

        // Read the buddies mapping file
        core.info(`Reading buddies from '${buddiesPath}'`)
        const buddies = yaml.load(await fs.promises.readFile(buddiesPath))
        const buddyCount = Object.keys(buddies).length

        // Don't continue if there aren't any buddies
        core.info(`Found ${buddyCount} buddy mappings`)
        if (buddyCount == 0) {
            return
        }

        // Check the assignees of the pull request or issue

        // Create the App
        // core.info(`Creating app ${appId}`)
        // const app = new App({
        //     appId: appId,
        //     privateKey: privateKey
        // })

        // // Create a token for the given installationId
        // core.info(`Creating access token for installation ${installationId}`)
        // const octokit = await app.getInstallationOctokit(installationId)
        // const options = getAuthOptions(permissions)
        // const auth = await octokit.auth(options)
        // const grantedPermissions = JSON.stringify(auth.permissions)

        // // Mask the token and set the output
        // core.setSecret(auth.token)
        // core.setOutput('token', auth.token)
        // core.setOutput('permissions', grantedPermissions)
        // core.info(`Token granted with permissions: ${grantedPermissions}`)
    } catch (error) {
        core.setFailed(error)
    }
}

main()
