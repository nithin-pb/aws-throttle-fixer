const {
    UnknownClientException,
    UnknownCommandException,
} = require('./errors')

/**
 * 
 * @param {*} client - client from AWS SDK
 * @param {*} command - command from sdk  
 * @param {*} input - input the command takes
 * @returns 
 */
async function sdkV3(client, command, input) {
    if (!client) throw new UnknownClientException()
    if (!command || typeof (command) !== 'function') throw new UnknownCommandException()
    let retry = false
    let retryCount = 0
    const MAX_ATTEMPT = this.maxRetries
    const throttledExceptions = this.throttleExceptionCodes
    const delay = (retryAttempt) => new Promise((resolve) => setTimeout(resolve, 10 ** retryAttempt))
    do {
        try {
            retry = false
            this.logging(`Running aws command. Attempt ${retryCount}`)
            const newCommand = new command(input)
            return await client.send(newCommand)
        } catch (e) {
            const errorCode = e.Code || e.name || null
            const throttling = throttledExceptions.includes(errorCode)
            if (throttling) {
                this.logging(`Request throttling. Attempt ${retryCount}`)
                if (retryCount <= MAX_ATTEMPT) {
                    await delay(retryCount < 3 ? 3 : retryCount)
                    retryCount += 1
                    retry = true
                }
            } else {
                throw e
            }
        }
    } while (retry)
}

module.exports.sdkV3 = sdkV3