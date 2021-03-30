const Alexa = require('ask-sdk-core');

const RequestTypes = Object.freeze(
  {
    Launch: 'LaunchRequest',
    Intent: 'IntentRequest',
    SessionEnded: 'SessionEndedRequest',
    SessionResumed: 'SessionResumedRequest',
    ConnectionsResponse: 'Connections.Response',
    AudioPlayerPrefix: 'AudioPlayer',
    AudioPlayer_PlaybackStarted: 'AudioPlayer.PlaybackStarted',
    AudioPlayer_PlaybackFinished: 'AudioPlayer.PlaybackFinished',
    AudioPlayer_PlaybackStopped: 'AudioPlayer.PlaybackStopped',
    AudioPlayer_PlaybackNearlyFinished: 'AudioPlayer.PlaybackNearlyFinished',
    AudioPlayer_PlaybackFailed: 'AudioPlayer.PlaybackFailed',
    SystemExceptionEncountered: 'System.ExceptionEncountered',
    AlexaAuthorizationGrant: 'Alexa.Authorization.Grant',
  },
);
const { Utils } = require('./skillhelpers');

const TAG = 'AudioPlayer: ';

const PlaybackStartedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === RequestTypes.AudioPlayer_PlaybackStarted;
  },
  handle(handlerInput) {
    console.info(`${TAG}PlaybackStarted`);
    return handlerInput.responseBuilder
      .getResponse();
  },

};
const PlaybackFailedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === RequestTypes.AudioPlayer_PlaybackFailed;
  },
  handle(handlerInput) {
    // TODO: These should be user errors..

    if (handlerInput.requestEnvelope.request.error) {
      console.error(`PlaybackFailed: ${JSON.stringify(handlerInput.requestEnvelope.request.error)}`);
    } else { console.error('PlaybackFailed'); }

    // TODO: enqueu
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybacNearlyFinishedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === RequestTypes.AudioPlayer_PlaybackNearlyFinished;
  },

  async handle(handlerInput) {
    console.info(`${TAG}PlaybacNearlyFinishedHandler`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackStoppedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === RequestTypes.AudioPlayer_PlaybackStopped;
  },
  async handle(handlerInput) {
    console.info(`${TAG}PlaybackStopped`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackFinishedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === RequestTypes.AudioPlayer_PlaybackFinished;
  },
  async handle(handlerInput) {
    console.info(`${TAG}PlaybackFinished`);
    // We are done
    return Utils.ForegroundSkillHandler(handlerInput);
  },
};

const PlaybackControllerNextCommandHandler = {
  canHandle(handlerInput) {
    const { requestEnvelope } = handlerInput;
    const requestType = Alexa.getRequestType(requestEnvelope);
    return (requestType === 'PlaybackController.NextCommandIssued');
  },

  async handle(handlerInput) {
    console.error('PlaybackController.NextCommandIssued is not implemented');
    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackControllerPreviousCommandHandler = {
  canHandle(handlerInput) {
    const { requestEnvelope } = handlerInput;
    const requestType = Alexa.getRequestType(requestEnvelope);
    return (requestType === 'PlaybackController.PreviousCommandIssued');
  },

  async handle(handlerInput) {
    console.error('PlaybackController.PreviousCommandIssued is not implemented');
    return handlerInput.responseBuilder.getResponse();
  },
};

module.exports = {
  AudioPlayerHandler: {
    PlaybackFailedHandler,
    PlaybackStartedHandler,
    PlaybacNearlyFinishedHandler,
    PlaybackFinishedHandler,
    PlaybackStoppedHandler,
    PlaybackControllerNextCommandHandler,
    PlaybackControllerPreviousCommandHandler,
  },
};
