export interface sdkV3 {
    client: any
    /**
     * aws class object configured to run api calls
     */

    command: any
    /**
     * module name in the client
     * Used for calling a particular action in aws
     */

    input: any
    /**
     * params that takes as an argument in aws module
     */
}