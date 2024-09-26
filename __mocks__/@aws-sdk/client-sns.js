// __mocks__/@aws-sdk/client-sns.js

const snsClientSendMock = jest.fn();

const SNSClient = jest.fn(() => ({
  send: snsClientSendMock,
}));

const PublishCommand = jest.fn();

module.exports = {
  SNSClient,
  PublishCommand,
  __snsClientSendMock: snsClientSendMock,
};
