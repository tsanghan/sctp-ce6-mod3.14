const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const TABLE_NAME = process.env.TABLE_NAME; // Set in serverless.yml
const QUEUE_URL = process.env.QUEUE_URL;   // Set in serverless.yml

exports.handler = async (event) => {
  let response;
  try {
    // Parse the JSON body
    console.log(event)
    const item = JSON.parse(Buffer.from(event.body, 'base64').toString());

    // Add a unique ID to the item
    item.id = uuidv4();

    // Put item into DynamoDB
    const dbParams = {
      TableName: TABLE_NAME,
      Item: item,
    };
    await dynamoDb.put(dbParams).promise();

    // Send message to SQS
    const sqsParams = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(item),
    };
    await sqs.sendMessage(sqsParams).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', id: item.id }),
    };
  } catch (error) {
    console.error('Error:', error);
    response = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error', error: error.message }),
    };
  }
  return response;
};
