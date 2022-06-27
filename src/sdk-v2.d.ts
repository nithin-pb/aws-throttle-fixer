export interface sdkV2 {
    client: any
    /**
     * aws class object configured to run api calls
     */

    awsAction: string
    /**
     * module name in the client
     * Used for calling a particular action in aws
     */

    params: any
    /**
     * params that takes as an argument in aws module
     */
}