class UnknownCommandException extends Error {
    constructor() {
        const fullMsg = 'Unknown command or command not provided. This also could be the result of using AWS-SDK v2 method with sdkVersion: 3 configuration';
        super(fullMsg);
        this.name = 'UnknownCommandException';
        this.code = 'UnknownCommandException';
        this.message = fullMsg;
    }

    toString() {
        return this.message;
    }
}

module.exports.UnknownCommandException = UnknownCommandException