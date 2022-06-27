const {
    UnknownClientException,
    UnknownModuleException,
} = require('./errors')

/**
 * 
 * @param {AWS Client} client - client from AWS SDK
 * @param {string} awsAction - module name  
 * @param {*} params - params that the module accepts
 * @returns 
 */
async function sdkV2(client, awsAction, params) {
    if (!client) throw new UnknownClientException()
    if (!awsAction || typeof (awsAction) !== 'string') throw new UnknownModuleException()
    let retry = false
    let retryCount = 0
    const MAX_ATTEMPT = this.maxRetries
    const throttledExceptions = this.throttleExceptionCodes
    const delay = (retryAttempt) => new Promise((resolve) => setTimeout(resolve, 10 ** retryAttempt))
    do {
        try {
            retry = false
            this.logging(`Calling ${awsAction}. Attempt ${retryCount}`)
            return await client[awsAction](params).promise()
        } catch (e) {
            const throttling = throttledExceptions.includes(e.code)
            if (throttling) {
                this.logging(`Request throttling for ${awsAction}. Attempt ${retryCount}`)
                if (!this.ignoreRetryState && !e?.retryable) {
                    retryCount = MAX_ATTEMPT + 1
                    retry = false
                    this.logging(`The request ${awsAction} is not retirable.`)
                }
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

module.exports.sdkV2 = sdkV2