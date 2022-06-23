# AWS Throttle Fixer

AWS limits the number of requests across all APIs within an AWS account, per region. It also limits the burst across all APIs within an AWS account, per Region for some APIs. Due to this restriction many AWS APIs will trigger error responses like `ThrottledException`, `TooManyRequestsException`, `Throttling` and so on.
AWS Throttle Fixer internally uses **Exponential backoff** to remediate this issue and it is a promise based library. This library only works with `aws-sdk` version 2.

# Getting Started

# How to install

The preferred way to install the AWS-Throttle-Fixer for Node.js is to use the npm package manager for Node.js. Simply type the following into a terminal window:

```
npm install aws-throttle-fixer
```

with yarn package manager

```
yarn add aws-throttle-fixer
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
TF.configure({ retryCount: 24 }); // options described below table
```

**Create a callable throttle method**

```js
const throttleFixFn = TF.throttleFixer();
```

`throttleFunction` takes 3 arguments. All arguments are required

| Sl.no | Argument         | Example              | Description                              | Type     |
| ----- | ---------------- | -------------------- | ---------------------------------------- | -------- |
| 1     | AWS Client/Class | `EC2`                | The aws class initialed using `aws-sdk`  | `class`  |
| 2     | Service          | `describeSnapshots`  | The method/service/action from the class | `string` |
| 3     | Parameters       | `{ MaxResults: 10 }` | Parameter to pass to the AWS method      | `object` |

**Call `throttleFixFn` function with all arguments provided**

```js
const response = await throttleFixFn(awsClient, "awsService", params);
```

### Available options for configure

| API Name         | Description                                                                                                                                                                              | Type       | Default |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- |
| `retryCount`     | Number of retries to perform in case of throttle error                                                                                                                                   | `number`   | `10`    |
| `logger`         | A function that can be used for logging the debug logs about throttling                                                                                                                  | `function` | `null`  |
| `exceptionCodes` | What all error codes need to be considered as Throttled? by default following error codes are considered to be throttling `ThrottledException`, `TooManyRequestsException`, `Throttling` | `string[]` | `[]`    |

# Example

following example demonstrate calling a describeSnapshots operation with throttle fix enabled.

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
TF.configure({
  retryCount: 24,
  logger: console.log,
  exceptionCodes: ["RequestLimitExceeded"],
});
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

# Error Codes

1. `UnknownClientException` - this exception will raise if no aws client is provided to the `throttleFixFn` function
2. `UnknownServiceException` - this exception will raise if no aws service name is provided to the `throttleFixFn` function
3. others - All other errors are thrown from the method
