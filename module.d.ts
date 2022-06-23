declare class ThrottleFixer {
    constructor()

    configure(opts: ThrottleFixer.ConfigureOptions): void
    //throttleFixer(): (ThrottleFixer.ThrottleFixerOptions)
}

declare namespace ThrottleFixer {
    export interface ConfigureOptions {
        retryCount?: number;
        logger?: (log: string) => {};
        exceptionCodes?: string[];
    }
}