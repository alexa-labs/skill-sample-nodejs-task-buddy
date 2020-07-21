// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

/* eslint-disable max-len */

// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');
const { Utils } = require('./utils/skillhelpers');
const { localeInterceptor } = require('./utils/i18nhelper');
const {
  RequestTypes, TaskHandlerNames, RequestTaskNames, VoicePermissionStatus,
  RequestIntentNamesCustom, RequestIntentNamesAMAZON,
} = require('./constants');
const {
  AudioPlayer, StartConnection, SendRequest,
} = require('./directives');
const VisualInterface = require('./skill/visualInterface');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task === undefined
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('launchMessage');
    const repromptOutput = responseBuilder.i18n.s('repromptMessage');

    VisualInterface.appendAPLDirective(handlerInput, TaskHandlerNames.Launch);

    return responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

/** ******************************************************************************************************** */
/** ************ Implementation of Performing Custom Tasks as a Provider Skill  **************************** */
/** ******************************************************************************************************** */

// Implementation of Custom tasks - CheckStatus
const CheckStatusTaskHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task
      && handlerInput.requestEnvelope.request.task.name === RequestTaskNames.CheckStatus
    ) || (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
        && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.CheckStatus
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { task } = handlerInput.requestEnvelope.request;
    let taskCategory = 'taxi';

    if (task) {
      taskCategory = task.input.taskCategory.toLowerCase() || taskCategory;
    }

    const connectionDirective = StartConnection[taskCategory] || StartConnection.print;
    const speakOutput = Utils.stringFormat(responseBuilder.i18n.s('checkingStatus'), { taskCategory });

    VisualInterface.appendAPLDirective(handlerInput, TaskHandlerNames.CheckStatus);

    return responseBuilder
      .speak(speakOutput)
      .addDirective(connectionDirective)
      .withShouldEndSession(undefined) //explicitly flag as undefined when returning any Directives
      .getResponse();
  },
};

// Implementation of Custom tasks - TrackMarketing
// Implement TrackMarketing as the “Start” custom task to track various inputs as campaign_id, source etc.
// e.g. https://alexa-skills.amazon.com/apis/custom/skills/<skillId>/tasks/TrackMarketing/versions/1?paramOne=campaign_id&paramTwo=campaign_source
// task input can be over 128 characters
const TrackMarketingTaskHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task
      && handlerInput.requestEnvelope.request.task.name === RequestTaskNames.TrackMarketing
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { task } = handlerInput.requestEnvelope.request;
    const repromptOutput = responseBuilder.i18n.s('repromptMessage');
    const paramOne = Utils.getTaskParam(task.input.paramOne, 'amazon_prime_day_special');
    const paramTwo = Utils.getTaskParam(task.input.paramTwo, 'amazon_prime_day');
    const paramThree = Utils.getTaskParam(task.input.paramThree, '15');
    // eslint-disable-next-line camelcase
    const { a2z_ref } = task.input;
    let speakOutput = Utils.stringFormat(responseBuilder.i18n.s('campaignMessage'), { campaign: paramOne, discount: paramThree, category: paramTwo });

    // eslint-disable-next-line camelcase
    if (a2z_ref) {
      speakOutput += ` ${Utils.stringFormat(responseBuilder.i18n.s('hiddenParamMessage'), { hiddenParam: a2z_ref })}`;
    }

    VisualInterface.appendAPLDirective(handlerInput, TaskHandlerNames.Campaign);

    return responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

// Implementation of Custom tasks - PlaySound
const PlaySoundTaskHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task
      && handlerInput.requestEnvelope.request.task.name === RequestTaskNames.PlaySound
    ) || (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
        && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.PlaySound
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { task } = handlerInput.requestEnvelope.request;
    let speakOutput = '';
    let soundCategory = 'ocean';

    if (task) {
      soundCategory = task.input.soundCategory.toLowerCase() || soundCategory;
    }

    if (Utils.supportsAudioPlayer(handlerInput) && soundCategory === 'ocean') {
      speakOutput = responseBuilder.i18n.s('streamingAudio');
      responseBuilder
        .addDirective(AudioPlayer.longFormAudio);
    } else {
      const sound = Utils.getRandomString(responseBuilder.i18n.obj('soundsSSMLAudio')[soundCategory] || responseBuilder.i18n.obj('soundsSSMLAudio').ocean);
      speakOutput = Utils.stringFormat(responseBuilder.i18n.s('playingSoundSSML'), { soundCategory, sound });
    }

    VisualInterface.appendAPLDirective(handlerInput, TaskHandlerNames.PlaySound);

    return responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(undefined)
      .getResponse();
  },
};

// Implementation of Custom tasks - CountDown
const CountDownTaskHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task
      && handlerInput.requestEnvelope.request.task.name === RequestTaskNames.CountDown
    ) || (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
        && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.CountDown
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { task } = handlerInput.requestEnvelope.request;
    const repromptOutput = responseBuilder.i18n.s('repromptMessage');

    // generates {<speak> initiating countdown <audio .../>
    let speakOutput = `${responseBuilder.i18n.s('speakOpenSSML')} ${responseBuilder.i18n.s('initiatingCountDown')} ${responseBuilder.i18n.s('cheerSoundSSMLAudio')}`;
    let upperLimit = 10;
    let lowerLimit = 1;

    if (task) {
      upperLimit = task.input.upperLimit || upperLimit;
      lowerLimit = task.input.lowerLimit || lowerLimit;
    }

    for (let i = upperLimit; i >= lowerLimit; i--) {
      speakOutput += `${i} <break time="0.8s" />`;
    }

    // generates  'count down finished' <audio .../> </speak>'
    speakOutput += `${responseBuilder.i18n.s('countDownCompleted')} ${responseBuilder.i18n.s('cheerSoundSSMLAudio')} ${responseBuilder.i18n.s('speakCloseSSML')}`;

    VisualInterface.appendAPLDirective(handlerInput, TaskHandlerNames.CountDown);

    return responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

// Implementation of Custom tasks - SetReminder
const SetReminderTaskHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Launch
      && handlerInput.requestEnvelope.request.task
      && handlerInput.requestEnvelope.request.task.name === RequestTaskNames.SetReminder
    ) || (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
        && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.SetReminder
    );
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { task } = handlerInput.requestEnvelope.request;
    const { locale } = handlerInput.requestEnvelope.request;
    const reminderApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    const { permissions } = handlerInput.requestEnvelope.context.System.user;
    let speechOutput = '';

    if (!permissions) {
      return responseBuilder
        .addDirective(SendRequest.voicePermission)
        .withShouldEndSession(undefined)
        .getResponse();
    }
    // Tech Reference: https://developer.amazon.com/en-US/docs/alexa/smapi/alexa-reminders-api-reference.html
    const currentDateTime = moment.tz('America/Los_Angeles');
    const requestTime = currentDateTime.format('YYYY-MM-DDTHH:mm:ss');
    let scheduledTime = currentDateTime.add(20, 'seconds').format('YYYY-MM-DDTHH:mm:ss');
    let text = responseBuilder.i18n.s('reminderText');
    let ssml = responseBuilder.i18n.s('reminderSSML');
    speechOutput = responseBuilder.i18n.s('reminderMessage');

    if (task) {
      scheduledTime = task.input.scheduledTime || scheduledTime;
      text = task.input.text || text;
      text = text.replace(/_/g, ' ');
      ssml = `<speak>${text}</speak>`;
      speechOutput = Utils.stringFormat(responseBuilder.i18n.s('reminderTaskMessageSSML'), { date: currentDateTime.format('YYYYMMDD') });
    }

    const reminderRequest = {
      requestTime,
      trigger: {
        type: 'SCHEDULED_ABSOLUTE',
        scheduledTime,
        timeZoneId: 'America/Los_Angeles',
      },
      alertInfo: {
        spokenInfo: {
          content: [{ locale, text, ssml }],
        },
      },
      pushNotification: {
        status: 'ENABLED',
      },
    };

    try {
      await reminderApiClient.createReminder(reminderRequest);
    } catch (err) {
      speechOutput = responseBuilder.i18n.s('createReminderErrorMessage');
    }

    return responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

const VoicePermissionsRequestHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === RequestTypes.ConnectionsResponse;
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const { status } = handlerInput.requestEnvelope.request.payload;
    const { code } = handlerInput.requestEnvelope.request.status;
    console.log(`Connections.Response received status code : ${code} and status : ${status}`);

    let speechOutput = '';

    switch (status) {
      case VoicePermissionStatus.Accepted:
        return SetReminderTaskHandler.handle(handlerInput);
      case VoicePermissionStatus.Denied:
        speechOutput = responseBuilder.i18n.s('reminderDenied');
        break;
      case VoicePermissionStatus.NotAnswered:
        speechOutput = responseBuilder.i18n.s('reminderNotAnswered');
        break;
      default:
        break;
    }

    return responseBuilder.speak(speechOutput).reprompt(speechOutput).getResponse();
  },
};

// After the provider skill fulfills the task request, the requester receives a `SessionResumedRequest` object.
// The result is defined in the provider skill's tasl definition.
// Therefore, we need to implement this handler to receive a skill connection response for the original task request
const SessionResumedRequestHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === RequestTypes.SessionResumed;
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('sessionResumedMessage');
    const repromptOutput = responseBuilder.i18n.s('repromptMessage');

    return responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

/** ******************************************************************************************************** */
/** **************************************** Built-in Intent Handlers  ************************************** */
/** ******************************************************************************************************** */

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
      && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Help
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('helpMessageSSML');

    return responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
  },
};

const CancelAndStopAndPauseIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Cancel
        || Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Stop
        || Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Pause)
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('goodbye');
    return responseBuilder
      .speak(speakOutput)
      .addDirective({
        type: 'AudioPlayer.Stop',
      })
      .withShouldEndSession(true)
      .getResponse();
  },
};

const ResumeIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
      && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Resume
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('resumingMessage');
    return responseBuilder
      .speak(speakOutput)
      .addDirective(AudioPlayer.longFormAudio)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
      && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesAMAZON.Fallback
    );
  },
  handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('fallbackMessageSSML');

    return responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.SessionEnded;
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

const AudioPlayerHandlers = {
  canHandle(handlerInput) {
    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
    return requestType.startsWith(RequestTypes.AudioPlayerPrefix);
  },
  handle(handlerInput) {
    // To keep sample small, we did not implement audio interfaces. Use Stop to exit the skill'
    return (
      handlerInput.responseBuilder.getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);

    const { responseBuilder } = handlerInput;
    const speakOutput = responseBuilder.i18n.s('errorMessage');

    return responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
  },
};

// #region DEBUG HELPERS

/* INTERCEPTORS */
const LogRequestInterceptor = {
  process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const LogResponseInterceptor = {
  process(handlerInput) {
    console.log(`RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent;
  },
  handle(handlerInput) {
    // NOT LOCALIZED as this is debug only.
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You  triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const TestTaskUsingVoiceIntenttHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
      && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.TestTask;
  },
  handle(handlerInput) {
    // NOT LOCALIZED as this is debug only.
    const targetTask = Utils.getSlotValueId(handlerInput.requestEnvelope, 'TaskName') || '';
    const campaignTaskData = {
      name: RequestTaskNames.TrackMarketing,
      input: {
        paramOne: 'special_event',
        paramTwo: 'discount',
        paramThree: '25',
        a2z_ref: 'test_campaign',
      },
    };
    const reminderTaskData = {
      name: RequestTaskNames.SetReminder,
      input: {
        text: 'time_to_stretch',
        freq: 'daily',
      },
    };

    // eslint-disable-next-line no-param-reassign
    if (!handlerInput.requestEnvelope.request) handlerInput.requestEnvelope.request = {};
    switch (targetTask) {
      case 'campaign':
        // eslint-disable-next-line no-param-reassign
        handlerInput.requestEnvelope.request.task = campaignTaskData;
        return TrackMarketingTaskHandler.handle(handlerInput);
      case 'reminder':
        handlerInput.requestEnvelope.request.task = reminderTaskData;
        return SetReminderTaskHandler.handle(handlerInput);
      default:
        break;
    }

    return FallbackIntentHandler.handle(handlerInput);
  },
};

// #endregion

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.

const customSkill = Alexa.SkillBuilders.custom();
customSkill.addRequestHandlers(
  LaunchRequestHandler,
  SessionResumedRequestHandler,
  VoicePermissionsRequestHandler,
  HelpIntentHandler,
  CancelAndStopAndPauseIntentHandler,
  SessionEndedRequestHandler,
  ResumeIntentHandler,
  CheckStatusTaskHandler,
  TrackMarketingTaskHandler,
  SetReminderTaskHandler,
  PlaySoundTaskHandler,
  CountDownTaskHandler,
  AudioPlayerHandlers,
  FallbackIntentHandler,
)
  .withApiClient(new Alexa.DefaultApiClient())
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(localeInterceptor);

if (Utils.Environment.isDebug) {
  customSkill.addRequestHandlers(
    TestTaskUsingVoiceIntenttHandler,
    IntentReflectorHandler, // IntentReflector should be last
  );
}

if (Utils.Environment.isVerbose) {
  customSkill.addRequestInterceptors(LogRequestInterceptor)
    .addResponseInterceptors(LogResponseInterceptor);
}

exports.handler = customSkill.lambda();
