# openaq-notifications

A simple function that listens for new measurements to appear on openaq-fetches S3 bucket and sends out via a public SNS topic.

## Environment Variables

For the code to work, the following env variables needed to be provided to the Lambda function via the template.yaml.

| Name | Description | Default |
|---|---|---|
| SNS_TOPIC | SNS topic to post to | not set |
| SNS_LIMIT | Amount of messages to send at once | 100 |

## To Deploy

This project can be deployed with the AWS CLI like below

```
aws cloudformation package --template-file template.yaml --s3-bucket openaq-build-artifacts --output-template-file packaged-template.yaml && aws cloudformation deploy --template-file packaged-template.yaml --stack-name openaq-notifications --capabilities CAPABILITY_IAM
```

For this deployment to succeed, the deployer needs to have sufficient access to the intended account.