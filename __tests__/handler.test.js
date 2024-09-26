process.env.TABLE_NAME = 'test-table';
process.env.QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue';

const AWS = require('aws-sdk');
const { handler } = require('../handler');

jest.mock('aws-sdk', () => {
  const DocumentClient = {
    put: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const SQS = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return {
    DynamoDB: { DocumentClient: jest.fn(() => DocumentClient) },
    SQS: jest.fn(() => SQS),
  };
});

describe('Lambda Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should store item in DynamoDB and send message to SQS', async () => {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const sqs = new AWS.SQS();

    // Mock the promises to resolve successfully
    dynamoDb.promise.mockResolvedValue({});
    sqs.promise.mockResolvedValue({});

    const event = {
      body: "eyJ0ZXN0IjoiYm9keSJ9",
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Success');
    expect(body.id).toBeDefined();

    expect(dynamoDb.put).toHaveBeenCalledWith({
      TableName: 'test-table',
      Item: expect.objectContaining({
        id: expect.any(String),
        test: 'body'
      }),
    });

    expect(sqs.sendMessage).toHaveBeenCalledWith({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
      MessageBody: expect.any(String),
    });
  });

//   it('should return an error response when JSON parsing fails', async () => {
//     const event = {
//       body: 'Invalid JSON',
//     };

//     const response = await handler(event);

//     expect(response.statusCode).toBe(500);
//     const body = JSON.parse(response.body);
//     expect(body.message).toBe('Error');
//     expect(body.error).toBeDefined();
//   });
});
