# AWS Throttle Fixer

AWS limits the number of requests across all APIs within an AWS account, per region. It also limits the burst across all APIs within an AWS account, per Region for some APIs. Due to this restriction many AWS APIs will trigger error responses like `ThrottledException`, `TooManyRequestsException`, `Throttling` and so on.
AWS Throttle Fixer internally uses **Exponential backoff** to remediate this issue and it is a promise based library. This library only works with `aws-sdk` version 2 and 3.

## Table of Contents

- [Getting Started](#getting-started)
  - [How to install](#how-to-install)
- [Example](#example)
  - [aws-sdk version 2](#example)
  - [aws-sdk version 3](#example)
- [Usage](#usage)
- [Configuration](#configurations)
- [Error Codes](#example)

# Getting Started

## How to install

The preferred way to install the AWS-Throttle-Fixer for Node.js is to use the npm package manager for Node.js. Simply type the following into a terminal window:

```
npm install aws-throttle-fixer
```

with yarn package manager

```
yarn add aws-throttle-fixer
```

# Example

## aws-sdk version 2.x.x

following example demonstrate calling a describeSnapshots operation with throttle fix enabled in aws-sdk v2.

```js
// aws init
require("dotenv").config();
const AWS = require("aws-sdk");

let awsConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};
AWS.config.update(awsConfig);
const ec2Client = new AWS.EC2();

// aws-throttle-fixer init
const ThrottleFixer = require("aws-throttle-fixer");
const TF = new ThrottleFixer();
const tfConfig = {
  retryCount: 24,
  logger: console.log,
  sdkVersion: 2,
  exceptionCodes: ["RequestLimitExceeded"],
};
TF.configure(tfConfig);
const throttleFixFn = TF.throttleFixer();

// aws call is in the function
async function callAwsDescribeSnapshotsAction() {
  try {
    const params = { MaxResults: 10 };
    const snapshotDetails = await throttleFixFn(
      ec2Client,
      "describeSnapshots",
      params
    ); // calling describeSnapshots operation with throttle fix added
    return snapshotDetails;
  } catch (e) {
    console.error(e);
  }
}

callAwsDescribeSnapshotsAction().then();
```

## @aws-sdk version 3.x.x

following example demonstrate calling a describeSnapshots operation with throttle fix enabled in aws-sdk v3.

```js
// aws init
require("dotenv").config();
const { EC2Client, DescribeSnapshotsCommand } = require("@aws-sdk/client-ec2");
const client = new EC2Client({ region: "us-east-1" });

// aws-throttle-fixer init
const ThrottleFixer = require("aws-throttle-fixer");
const TF = new ThrottleFixer();
const tfConfig = {
  retryCount: 24,
  logger: console.log,
  sdkVersion: 3,
  exceptionCodes: ["RequestLimitExceeded"],
};
TF.configure(tfConfig);
const throttleFixFn = TF.throttleFixer();

// aws call is in the function
async function callAwsDescribeSnapshotsAction() {
  try {
    const params = { MaxResults: 10 };
    const { Snapshots } = await throttleFixFunction(
      client,
      DescribeSnapshotsCommand,
      params
    );
  } catch (e) {
    console.error(e);
  }
}

callAwsDescribeSnapshotsAction().then();
```

# Usage

### In Node.js

To use the AWS-Throttle-Fixer within your nodejs project, import `aws-throttle-fixer` as you normally would.

**ES5 imports**

```js
const ThrottleFixer = require("aws-throttle-fixer");
```

**Create the Throttle fixer instance**

```js
const TF = new ThrottleFixer();
```

**Configure the options**

```js
TF.configure({ retryCount: 24 }); // more available options are listed [here](#configure)
```

**Create a callable throttle method**

```js
const throttleFixFn = TF.throttleFixer();
```

`throttleFunction` takes 3 arguments. All are required and arguments are different for different sdk version

With sdk version 2

| Sl.no | Argument         | Description                             | Type     | Example              |
| :---- | :--------------- | :-------------------------------------- | :------- | :------------------- |
| 1     | AWS Client/Class | The aws class initialed using `aws-sdk` | `class`  | `EC2`                |
| 2     | Method           | The method or action from the class     | `string` | `describeSnapshots`  |
| 3     | Parameters       | Parameter to pass to the AWS method     | `object` | `{ MaxResults: 10 }` |

With sdk version 3

| Sl.no | Argument         | Description                             | Type       | Example                    |
| :---- | :--------------- | :-------------------------------------- | :--------- | :------------------------- |
| 1     | AWS Client/Class | The aws class initialed using `aws-sdk` | `class`    | `EC2`                      |
| 2     | Command          | The Command imported from sdk           | `function` | `DescribeSnapshotsCommand` |
| 3     | Parameters       | Parameter to pass to the AWS method     | `object`   | `{ MaxResults: 10 }`       |

**Call `throttleFixFn` function with all arguments provided**

```js
const response = await throttleFixFn(awsClient, "awsService", params); // for sdk version 2
const response = await throttleFixFn(awsClient, CommandFromClient, params); // for sdk version 3
```

## Configurations

| API Name           | Description                                                                                                                                                                              | Type       | Default |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------ |
| `retryCount`       | Number of retries to perform in case of throttle error                                                                                                                                   | `number`   | `10`    |
| `logger`           | A function that can be used for logging the debug logs about throttling                                                                                                                  | `function` | `null`  |
| `exceptionCodes`   | What all error codes need to be considered as Throttled? by default following error codes are considered to be throttling `ThrottledException`, `TooManyRequestsException`, `Throttling` | `string[]` | `[]`    |
| `ignoreRetryState` | If set to true, will ignore the retry state `retryable` in aws api response. Available only when using `sdkVersion` with value 2                                                         | `boolean`  | `false` |
| `sdkVersion`       | AWS SDK version number, provide only major version                                                                                                                                       | `number`   | `2`     |

# Error Codes

1. `UnknownClientException` - this exception will raise if no aws client is provided to the `throttleFixFn` function
2. `UnknownModuleException` - this exception will raise if no module name is provided to the `throttleFixFn` function (only when using `sdkVersion` 2)
3. `UnknownSdkVersionException` - this exception will raise if `sdkVersion` provided to the configuration is incorrect
4. `UnknownCommandException` - this exception will raise if `command` provided to the `throttleFixFn` configuration is incorrect (only when using `sdkVersion` 3)
5. others - All other errors are thrown from the method
