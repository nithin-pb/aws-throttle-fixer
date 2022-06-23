class UnknownClientException extends Error {
    constructor() {
        const fullMsg = 'Client is not provided';
        super(fullMsg);
        this.name = 'UnknownClientException';
        this.code = 'UnknownClientException';
        this.message = fullMsg;
    }

    toString() {
        return this.message;
    }
}

module.exports.UnknownClientException = UnknownClientException