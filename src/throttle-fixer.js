const { sdkV2 } = require('./sdk-v2')
const { sdkV3 } = require('./sdk-v3')
const { UnknownSdkVersionException } = require('./errors')

class ThrottleFixer {
    constructor() {
        this.maxRetries = 10
        this.loggerEnabled = false
        this.ignoreRetryState = false
        this.throttleExceptionCodes = ['ThrottledException', 'TooManyRequestsException', 'Throttling']
        this.sdkVersion = 2
    }

    /**
     * @description - optional  configurations required to run throttle fixer
     * @param {object} data - configuration items 
     * @param {number} [data.retryCount = 10] - maximum number of retries required
     * @param {string[]} [data.exceptionCodes = []] - error code that need to treated as Throttling/ which requires to run again
     * @param {boolean} [data.ignoreRetryState=false] - ignore the retry state provided by aws in api response
     * @param {number} [data.sdkVersion=2] - AWS SDK version. 2 and 3 are only accepted
     * @param {*} data.logger - Logging function, takes a function which accepts a single string parameter. Example -  console.log
     */
    configure(data) {
        const {
            retryCount = this.maxRetries,
            logger,
            exceptionCodes = [],
            ignoreRetryState = false,
            sdkVersion = 2
        } = data
        if (logger) {
            this.loggerEnabled = true
            this.logger = logger
        }
        if (exceptionCodes.length > 0) {
            this.throttleExceptionCodes = [...this.throttleExceptionCodes, ...exceptionCodes]
        }
        this.sdkVersion = sdkVersion
        this.maxRetries = retryCount
        this.ignoreRetryState = ignoreRetryState
        this.logging(`ThrottleFixer enabled. Ready to receive requests from AWS-SDK v${this.sdkVersion}xx`)
    }

    throttleFixer() {
        if (this.sdkVersion === 2) {
            return sdkV2.bind(this)
        }
        if (this.sdkVersion === 3) {
            return sdkV3.bind(this)
        }
        throw new UnknownSdkVersionException()
    }

    logging(message) {
        if (this.loggerEnabled) {
            this.logger(message)
        }
    }
}

module.exports = ThrottleFixer