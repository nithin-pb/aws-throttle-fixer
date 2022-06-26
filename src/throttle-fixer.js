const { UnknownClientException, UnknownServiceException } = require('./errors')

class ThrottleFixer {
    constructor() {
        this.maxRetries = 10
        this.loggerEnabled = false
        this.ignoreRetryState = false
        this.throttleExceptionCodes = ['ThrottledException', 'TooManyRequestsException', 'Throttling']
    }

    /**
     * @description - optional  configurations required to run throttle fixer
     * @param {object} data - configuration items 
     * @param {number} [data.retryCount = 10] - maximum number of retries required
     * @param {string[]} [data.exceptionCodes = []] - error code that need to treated as Throttling/ which requires to run again
     * @param {boolean} [data.ignoreRetryState=false] - ignore the retry state provided by aws in api response
     * @param {*} data.logger - Logging function, takes a function which accepts a single string parameter. Example -  console.log
     */
    configure(data) {
        const {
            retryCount = this.maxRetries,
            logger,
            exceptionCodes = [],
            ignoreRetryState = false
        } = data
        if (logger) {
            this.loggerEnabled = true
            this.logger = logger
        }
        if (exceptionCodes.length > 0) {
            this.throttleExceptionCodes = [...this.throttleExceptionCodes, ...exceptionCodes]
        }
        this.maxRetries = retryCount
        this.ignoreRetryState = ignoreRetryState
        this.logging('ThrottleFixer enabled')
    }

    throttleFixer() {
        return async function (client, awsAction, params) {
            if (!client) throw new UnknownClientException()
            if (!awsAction) throw new UnknownServiceException()
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
                    if (throttledExceptions.includes(e.code)) {
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
        }.bind(this)
    }

    logging(message) {
        if (this.loggerEnabled) {
            this.logger(message)
        }
    }
}

module.exports = ThrottleFixer