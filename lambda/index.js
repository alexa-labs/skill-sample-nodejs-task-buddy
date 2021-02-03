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
const { AlexaTimer } = require('./timer');

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
      .withShouldEndSession(undefined) // explicitly flag as undefined when returning any Directives
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

// // Implementation of Alexa Timer API
// // Reference: https://developer.amazon.com/en-US/docs/alexa/smapi/alexa-timers-api-reference.html
// const SetTimerTaskHandler = {
//   canHandle(handlerInput) {
//     return (
//       Alexa.getRequestType(handlerInput.requestEnvelope) === RequestTypes.Intent
//       && Alexa.getIntentName(handlerInput.requestEnvelope) === RequestIntentNamesCustom.SetTimer
//     );
//   },
//   async handle(handlerInput) {
//     const { requestEnvelope, attributesManager, serviceClientFactory } = handlerInput;
//     const localizer = handlerInput.responseBuilder.i18n;
//     const duration = Alexa.getSlotValue(requestEnvelope, 'duration') || 60;

//     const timerRequest = {
//       duration: `PT${duration}S`, // ISO-8601 representation of duration
//       label: localizer.s('ANNOUNCEMENT_TIMER_TITLE_MSG'),
//       creationBehavior: {
//         displayExperience: {
//           visibility: 'VISIBLE',
//         },
//       },
//       triggeringBehavior: {
//         operation: {
//           type: 'ANNOUNCE',
//           textToAnnounce: [{
//             locale: localizer.s('ANNOUNCEMENT_LOCALE_MSG'),
//             text: localizer.s('ANNOUNCEMENT_TEXT_MSG'),
//           }],
//         },
//         notificationConfig: {
//           playAudible: true,
//         },
//       },
//     };

//     console.log(`About to create timer: ${JSON.stringify(timerRequest)}`);

//     try {
//       const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
//       const timersList = await timerServiceClient.getTimers();
//       console.log(`Current timers: ${JSON.stringify(timersList)}`);

//       const timerResponse = await timerServiceClient.createTimer(timerRequest);
//       console.log(`Timer creation response: ${JSON.stringify(timerResponse)}`);

//       const timerId = timerResponse.id;
//       // const timerStatus = timerResponse.status;

//       const sessionAttributes = attributesManager.getSessionAttributes();
//       sessionAttributes.lastTimerId = timerId;
//       return handlerInput.responseBuilder
//         .speak(localizer.s('CREATE_TIMER_OK_MSG') + localizer.s('repromptMessage'))
//         .reprompt(localizer.s('repromptMessage'))
//         .getResponse();
//     } catch (error) {
//       console.log(`Create timer error: ${JSON.stringify(error)}`);
//       if (error.statusCode === 401) {
//         console.log('Unauthorized!');
//         // we send a request to enable by voice
//         // note that you'll need another handler to process the result, see AskForResponseHandler
//         return handlerInput.responseBuilder
//           .addDirective({
//             type: 'Connections.SendRequest',
//             name: 'AskFor',
//             payload: {
//               '@type': 'AskForPermissionsConsentRequest',
//               '@version': '1',
//               permissionScope: TIMERS_PERMISSION,
//             },
//             token: 'for_alexa_timer_api',
//           }).getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('CREATE_TIMER_ERROR_MSG') + localizer.s('repromptMessage'))
//         .reprompt(localizer.s('repromptMessage'))
//         .getResponse();
//     }
//   },
// };

// const ReadTimerIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//             && handlerInput.requestEnvelope.request.intent.name === 'ReadTimerIntent';
//   },
//   async handle(handlerInput) {
//     const { attributesManager, serviceClientFactory } = handlerInput;
//     const localizer = handlerInput.responseBuilder.i18n;
//     const sessionAttributes = attributesManager.getSessionAttributes();
//     let timerId = sessionAttributes.lastTimerId;

//     try {
//       const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
//       const timersList = await timerServiceClient.getTimers();
//       console.log(`Read timers: ${JSON.stringify(timersList)}`);
//       const { totalCount } = timersList;
//       const preText = totalCount ? localizer.sformatByName('TIMER_COUNT_MSG', { count: totalCount }) : '';
//       if (timerId || totalCount > 0) {
//         timerId = timerId || timersList.timers[0].id;
//         const timerResponse = await timerServiceClient.getTimer(timerId);
//         console.log(`Read timer: ${JSON.stringify(timerResponse)}`);
//         const timerStatus = timerResponse.status;
//         return handlerInput.responseBuilder
//           .speak(preText + localizer.s('LAST_TIMER_MSG', { status: localizer.s(`${timerStatus}_TIMER_STATUS_MSG`) }) + localizer.s('REPROMPT_MSG'))
//           .reprompt(localizer.s('REPROMPT_MSG'))
//           .getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(preText + localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     } catch (error) {
//       console.log(`Read timer error: ${JSON.stringify(error)}`);
//       if (error.statusCode === 401) {
//         console.log('Unauthorized!');
//         // we send a request to enable by voice
//         // note that you'll need another handler to process the result, see AskForResponseHandler
//         return handlerInput.responseBuilder
//           .addDirective({
//             type: 'Connections.SendRequest',
//             name: 'AskFor',
//             payload: {
//               '@type': 'AskForPermissionsConsentRequest',
//               '@version': '1',
//               permissionScope: TIMERS_PERMISSION,
//             },
//             token: 'verifier',
//           }).getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('READ_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     }
//   },
// };

// const DeleteTimerIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//             && handlerInput.requestEnvelope.request.intent.name === 'DeleteTimerIntent';
//   },
//   async handle(handlerInput) {
//     const localizer = handlerInput.responseBuilder.i18n;
//     const { attributesManager, serviceClientFactory } = handlerInput;
//     const sessionAttributes = attributesManager.getSessionAttributes();
//     const timerId = sessionAttributes.lastTimerId;

//     try {
//       const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
//       const timersList = await timerServiceClient.getTimers();
//       console.log(`Read timers: ${JSON.stringify(timersList)}`);
//       const { totalCount } = timersList;
//       if (totalCount === 0) {
//         return handlerInput.responseBuilder
//           .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
//           .reprompt(localizer.s('REPROMPT_MSG'))
//           .getResponse();
//       }
//       if (timerId) {
//         await timerServiceClient.deleteTimer(timerId);
//       } else {
//         // warning, since there's no timer id we *cancel all 3P timers by the user*
//         await timerServiceClient.deleteTimers();
//       }
//       console.log('Timer deleted!');
//       return handlerInput.responseBuilder
//         .speak(localizer.s('DELETE_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     } catch (error) {
//       console.log(`Delete timer error: ${JSON.stringify(error)}`);
//       if (error.statusCode === 401) {
//         console.log('Unauthorized!');
//         // we send a request to enable by voice
//         // note that you'll need another handler to process the result, see AskForResponseHandler
//         return handlerInput.responseBuilder
//           .addDirective({
//             type: 'Connections.SendRequest',
//             name: 'AskFor',
//             payload: {
//               '@type': 'AskForPermissionsConsentRequest',
//               '@version': '1',
//               permissionScope: TIMERS_PERMISSION,
//             },
//             token: 'verifier',
//           }).getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('DELETE_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     }
//   },
// };

// const PauseTimerIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//             && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
//   },
//   async handle(handlerInput) {
//     const localizer = handlerInput.responseBuilder.i18n;
//     const { serviceClientFactory } = handlerInput;

//     try {
//       const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
//       const timersList = await timerServiceClient.getTimers();
//       console.log(`Read timers: ${JSON.stringify(timersList)}`);
//       const { totalCount } = timersList;

//       if (totalCount === 0) {
//         return handlerInput.responseBuilder
//           .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
//           .reprompt(localizer.s('REPROMPT_MSG'))
//           .getResponse();
//       }
//       // pauses all timers
//       for (const timer of timersList.timers) {
//         if (timer.status === 'ON') {
//           await timerServiceClient.pauseTimer(timer.id);
//         }
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('PAUSE_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     } catch (error) {
//       console.log(`Pause timer error: ${JSON.stringify(error)}`);
//       if (error.statusCode === 401) {
//         console.log('Unauthorized!');
//         // we send a request to enable by voice
//         // note that you'll need another handler to process the result, see AskForResponseHandler
//         return handlerInput.responseBuilder
//           .addDirective({
//             type: 'Connections.SendRequest',
//             name: 'AskFor',
//             payload: {
//               '@type': 'AskForPermissionsConsentRequest',
//               '@version': '1',
//               permissionScope: TIMERS_PERMISSION,
//             },
//             token: 'verifier',
//           }).getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('PAUSE_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     }
//   },
// };

// const ResumeTimerIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//             && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
//   },
//   async handle(handlerInput) {
//     const localizer = handlerInput.responseBuilder.i18n;
//     const { serviceClientFactory } = handlerInput;

//     try {
//       const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
//       const timersList = await timerServiceClient.getTimers();
//       console.log(`Read timers: ${JSON.stringify(timersList)}`);
//       const { totalCount } = timersList;

//       if (totalCount === 0) {
//         return handlerInput.responseBuilder
//           .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
//           .reprompt(localizer.s('REPROMPT_MSG'))
//           .getResponse();
//       }
//       // resumes all timers
//       for (const timer of timersList.timers) {
//         if (timer.status === 'PAUSED') {
//           await timerServiceClient.resumeTimer(timer.id);
//         }
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('RESUME_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     } catch (error) {
//       console.log(`Resume timer error: ${JSON.stringify(error)}`);
//       if (error.statusCode === 401) {
//         console.log('Unauthorized!');
//         // we send a request to enable by voice
//         // note that you'll need another handler to process the result, see AskForResponseHandler
//         return handlerInput.responseBuilder
//           .addDirective({
//             type: 'Connections.SendRequest',
//             name: 'AskFor',
//             payload: {
//               '@type': 'AskForPermissionsConsentRequest',
//               '@version': '1',
//               permissionScope: TIMERS_PERMISSION,
//             },
//             token: 'verifier',
//           }).getResponse();
//       }
//       return handlerInput.responseBuilder
//         .speak(localizer.s('RESUME_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
//         .reprompt(localizer.s('REPROMPT_MSG'))
//         .getResponse();
//     }
//   },
// };

// const VoicePermissionsTimerRequestHandler = {
//   canHandle(handlerInput) {
//     return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
//             && handlerInput.requestEnvelope.request.name === 'AskFor'
//             && handlerInput.requestEnvelope.request.token === 'for_alexa_timer_api'; // to diff from voice permission handler for Reminder API
//   },
//   async handle(handlerInput) {
//     console.log('Handler: VoicePermissionsTimerRequestHandler');
//     const localizer = handlerInput.responseBuilder.i18n;
//     const { request } = handlerInput.requestEnvelope;
//     const { payload, status } = request;
//     console.log(`Connections reponse status + payload: ${status} - ${JSON.stringify(payload)}`);

//     if (status.code === '200') {
//       if (payload.status === 'ACCEPTED') {
//         // Request was accepted
//         handlerInput.responseBuilder
//           .speak(localizer.s('VOICE_PERMISSION_ACCEPTED') + localizer.s('repromptMessage'))
//           .reprompt(localizer.s('repromptMessage'));
//       } else if (payload.status === 'DENIED') {
//         // Request was denied
//         handlerInput.responseBuilder
//           .speak(localizer.s('VOICE_PERMISSION_DENIED') + localizer.s('goodbye'));
//       } else if (payload.status === 'NOT_ANSWERED') {
//         // Request was not answered
//         handlerInput.responseBuilder
//           .speak(localizer.s('VOICE_PERMISSION_DENIED') + localizer.s('goodbye'));
//       }
//       if (payload.status !== 'ACCEPTED' && !payload.isCardThrown) {
//         handlerInput.responseBuilder
//           .speak(localizer.s('PERMISSIONS_CARD_MSG'))
//           .withAskForPermissionsConsentCard([TIMERS_PERMISSION]);
//       }
//       return handlerInput.responseBuilder.getResponse();
//     }

//     if (status.code === '400') {
//       console.log('You forgot to specify the permission in the skill manifest!');
//     }

//     if (status.code === '500') {
//       // return handlerInput.responseBuilder
//       //   .speak(localizer.s('VOICE_PERMISSION_ERROR') + localizer.s('repromptMessage'))
//       //   .reprompt(localizer.s('repromptMessage'))
//       //   .getResponse();

//       return handlerInput.responseBuilder
//         .speak(localizer.s('PERMISSIONS_CARD_MSG'))
//         .withAskForPermissionsConsentCard([TIMERS_PERMISSION])
//         .getResponse();
//     }
//     // Something failed.
//     console.log(`Connections.Response.AskFor indicated failure. error: ${request.status.message}`);

//     return handlerInput.responseBuilder
//       .speak(localizer.s('VOICE_PERMISSION_ERROR') + localizer.s('GOODBYE_MSG'))
//       .getResponse();
//   },
// };

// const AuthorizationGrantRequestHandler = {
//   canHandle(handlerInput) {
//     return (
//       handlerInput.requestEnvelope.request.type === RequestTypes.AlexaAuthorizationGrant
//             || handlerInput.requestEnvelope.request.type === 'Alexa.Authorization.Grant'
//     );
//   },
//   async handle(handlerInput) {
//     console.log('Authorization Grant message received');
//     console.log(`${JSON.stringify(handlerInput.requestEnvelope)}`);

//     try {
//       // const { attributesManager } = handlerInput;
//       // const persistentAttributes = await attributesManager.getPersistentAttributes();
//       // persistentAttributes.Permission = persistentAttributes.Permission || [];
//       // persistentAttributes.Permission.push(TIMERS_PERMISSION);

//       // attributesManager.setPersistentAttributes(persistentAttributes);
//       // await attributesManager.savePersistentAttributes();
//       const event = { eventName: 'SAVE_PERMISSION', eventValue: `${TIMERS_PERMISSION}` };
//       console.log(`${JSON.stringify(event)}`);
//     } catch (error) {
//       console.error(`Error when saving Alexa Timer permission: ${error}`);
//     }

//     // If you were able to do the exchange and store the tokens successfully, return an an empty success response back to Alexa to indicate success.
//     // Without this success response signal, Alexa would assume that something went wrong during the exchange (or some other internal process of your skill)
//     // and the fact that customer granted permission is not persisted in the system.
//     return handlerInput.responseBuilder.getResponse();
//   },
// };

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
    return request.type === RequestTypes.ConnectionsResponse
            && request.token === 'alexa_reminder_api';
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
  AlexaTimer.SetTimerIntentHandler,
  AlexaTimer.ReadTimerIntentHandler,
  AlexaTimer.DeleteTimerIntentHandler,
  AlexaTimer.PauseTimerIntentHandler,
  AlexaTimer.ResumeTimerIntentHandler,
  AlexaTimer.VoicePermissionsTimerRequestHandler,
  AlexaTimer.AuthorizationGrantRequestHandler,
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
