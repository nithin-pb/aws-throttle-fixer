class UnknownModuleException extends Error {
    constructor() {
        const fullMsg = 'Module is not provided or provided module is not supported. This also could be the result of using AWS-SDK v3 method with sdkVersion: 2 configuration';
        super(fullMsg);
        this.name = 'UnknownModuleException';
        this.code = 'UnknownModuleException';
        this.message = fullMsg;
    }

    toString() {
        return this.message;
    }
}

module.exports.UnknownModuleException = UnknownModuleException