import { sdkV2 } from "./sdk-v2";
import { sdkV3 } from "./sdk-v3";

export class ThrottleFixer {
    constructor();
    /**
     * creates a new ThrottleFixer object
     */


    configure(data: ConfigOptions): void
    /**
     * adds optional configurations to throttle object
     * Used to extend the default behavior
     */

    throttleFixer(): sdkV3 | sdkV2
    /**
      * provide a callable instance of throttleFixer
      * used to call aws apis with throttle fix
      */

    logging(message: string): void
    /**
     * internal function used for logging
     */
}

interface ConfigOptions {
    /**
     * the configuration options
     */
    retryCount?: number;
    /**
    * retry count to perform reattempts
    * Used for reattempting failed requests.
    * Defaults to the 10.
    */

    logger?: (input: string) => {}
    /**
     * logger function
     * Used for debugging and showing the details about throttling
     */

    exceptionCodes?: string[]
    /**
     * exception error codes
     * Used to identify throttling. codes added to the exceptionCodes will be extended with current default codes
     */
}