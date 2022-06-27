class UnknownSdkVersionException extends Error {
    constructor() {
        const fullMsg = 'Provided SDK version is not supported at this moment. Supports only 2 and 3';
        super(fullMsg);
        this.name = 'UnknownSdkVersionException';
        this.code = 'UnknownSdkVersionException';
        this.message = fullMsg;
    }

    toString() {
        return this.message;
    }
}

module.exports.UnknownSdkVersionException = UnknownSdkVersionException