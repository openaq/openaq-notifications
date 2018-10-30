#!/bin/bash

aws cloudformation package --template-file template.yaml --s3-bucket openaq-build-artifacts --output-template-file packaged-template.yaml && aws cloudformation deploy --template-file packaged-template.yaml --stack-name openaq-notifications --capabilities CAPABILITY_IAM