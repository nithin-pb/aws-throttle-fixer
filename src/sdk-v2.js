const { UnknownClientException, UnknownModuleException } = require('./errors')

/**
 *
 * @param {AWS Client} client - client from AWS SDK
 * @param {string} awsAction - module name
 * @param {*} params - params that the module accepts
 * @returns
 */
async function sdkV2(client, awsAction, params) {
	if (!client) throw new UnknownClientException()
	if (!awsAction || typeof awsAction !== 'string') throw new UnknownModuleException()
	let retry = false
	let retryCount = 0
	const MAX_ATTEMPT = this.maxRetries
	const throttledExceptions = this.throttleExceptionCodes
	const delay = (delayTime) => new Promise((resolve) => setTimeout(resolve, delayTime))
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
					const delayTime = retryCount < 3 ? 10 ** 3 : 10 ** retryCount
					await delay(delayTime)
					retryCount += 1
					retry = true
				}
			} else {
				throw e
			}
			// check if additional wait is required
			if (this.additionalWaitTime > 0) {
				await delay(additionalWaitTime)
			}
		}
	} while (retry)
}

module.exports.sdkV2 = sdkV2
