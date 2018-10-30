'use strict';
console.log('starting function');

const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const s3 = new AWS.S3();
const async = require('async');

exports.handle = (e, ctx, cb) => {
  // Get S3 object from notification
  const s3Message = JSON.parse(e.Records[0].Sns.Message);
  const bucket = s3Message.Records[0].s3.bucket.name;
  const key = s3Message.Records[0].s3.object.key;
  s3.getObject({Bucket: bucket, Key: key}, (err, data) => {
    if (err) {
      return cb(err.stack);
    }

    // Create the tasks array
    let total = 0;
    let successes = 0;
    let tasks = data.Body.toString('utf-8').split('\n').map((m) => {
      total++;
      let mjson;
      try {
        mjson = JSON.parse(m);
      } catch (err) {
        return null;
      }

      return (done) => {
        let params = {
          TopicArn: process.env.SNS_TOPIC,
          Message: m,
          MessageAttributes: {
            date_utc: {
              DataType: 'String',
              StringValue: mjson.date.utc
            },
            date_local: {
              DataType: 'String',
              StringValue: mjson.date.local
            },
            location: {
              DataType: 'String',
              StringValue: mjson.location
            },
            value: {
              DataType: 'Number',
              StringValue: mjson.value.toString()
            },
            parameter: {
              DataType: 'String',
              StringValue: mjson.parameter
            },
            unit: {
              DataType: 'String',
              StringValue: mjson.unit
            },
            city: {
              DataType: 'String',
              StringValue: mjson.city
            },
            country: {
              DataType: 'String',
              StringValue: mjson.country
            },
            sourceName: {
              DataType: 'String',
              StringValue: mjson.sourceName
            },
            sourceType: {
              DataType: 'String',
              StringValue: mjson.sourceType
            }
          }
        };

        // Add coords if we have them
        if (mjson.coordinates) {
          params.MessageAttributes.latitude = {
            DataType: 'Number',
            StringValue: mjson.coordinates.latitude.toString()
          };
          params.MessageAttributes.longitude = {
            DataType: 'Number',
            StringValue: mjson.coordinates.longitude.toString()
          };
        }

        // Publish!
        sns.publish(params, (err, data) => {
          if (err) {
            return cb(err.stack);
          }

          successes++;
          return done();
        });
      };
    }).filter((t) => t !== null);

    // Run through the tasks
    async.parallelLimit(tasks, process.env.SNS_LIMIT || 100, (err, results) => {
      if (err) {
        return cb(err);
      }

      console.info(`Processed ${total} measurements, sucessfully sent ${successes} notifications.`);
      return cb(null, { done: 'success' });
    });
  });
};
