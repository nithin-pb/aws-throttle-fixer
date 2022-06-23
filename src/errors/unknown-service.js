class UnknownServiceException extends Error {
    constructor() {
        const fullMsg = 'Service is not provided';
        super(fullMsg);
        this.name = 'UnknownServiceException';
        this.code = 'UnknownServiceException';
        this.message = fullMsg;
    }

    toString() {
        return this.message;
    }
}

module.exports.UnknownServiceException = UnknownServiceException