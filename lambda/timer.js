// Implementation of Alexa Timer API
// Reference: https://developer.amazon.com/en-US/docs/alexa/smapi/alexa-timers-api-reference.html

/* eslint-disable max-len */
const Alexa = require('ask-sdk-core');

// Constants
const TIMERS_PERMISSION = 'alexa::alerts:timers:skill:readwrite';
const TIMERS_VOICE_PERMISSION = {
  type: 'Connections.SendRequest',
  name: 'AskFor',
  payload: {
    '@type': 'AskForPermissionsConsentRequest',
    '@version': '1',
    permissionScope: TIMERS_PERMISSION,
  },
  token: 'for_alexa_timer_api',
};

// Functions
function getAnnouceTimer(duration) {
  return {
    duration, // ISO-8601 representation of duration
    timerLabel: `${duration} Annouce`,
    creationBehavior: {
      displayExperience: {
        visibility: 'VISIBLE',
      },
    },
    triggeringBehavior: {
      operation: {
        type: 'ANNOUNCE',
        textToAnnounce: [{
          locale: 'en-US',
          text: 'That was your skill created timer!',
        }],
      },
      notificationConfig: {
        playAudible: true,
      },
    },
  };
}

function getNotifyOnlyTimer(duration) {
  return {
    duration, // ISO-8601 representation of duration
    timerLabel: `${duration} Notify Only`,
    creationBehavior: {
      displayExperience: {
        visibility: 'VISIBLE',
      },
    },
    triggeringBehavior: {
      operation: {
        type: 'NOTIFY_ONLY',
      },
      notificationConfig: {
        playAudible: true,
      },
    },
  };
}

// Handlers
const SetTimerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'SetTimerIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, serviceClientFactory } = handlerInput;
    const localizer = handlerInput.responseBuilder.i18n;
    const duration = Alexa.getSlotValue(requestEnvelope, 'duration') || 'PT45S'; // ISO-8601 representation of duration

    const timerRequest = getAnnouceTimer(duration);
    // const timerRequest = getNotifyOnlyTimer(duration);

    console.log(`About to create timer: ${JSON.stringify(timerRequest)}`);

    try {
      const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
      const timersList = await timerServiceClient.getTimers();
      console.log(`Current timers: ${JSON.stringify(timersList)}`);

      const timerResponse = await timerServiceClient.createTimer(timerRequest);
      console.log(`Timer creation response: ${JSON.stringify(timerResponse)}`);

      const timerId = timerResponse.id;

      const sessionAttributes = attributesManager.getSessionAttributes();
      sessionAttributes.lastTimerId = timerId;

      return handlerInput.responseBuilder
        .speak(localizer.sformatByName('CREATE_TIMER_OK_MSG', { duration }) + localizer.s('repromptMessage'))
        .reprompt(localizer.s('repromptMessage'))
        .getResponse();
    } catch (error) {
      console.log(`Create timer error: ${JSON.stringify(error)}`);
      if (error.statusCode === 401) {
        console.log('Unauthorized!');
        return handlerInput.responseBuilder
          .addDirective(TIMERS_VOICE_PERMISSION).getResponse();
      }

      return handlerInput.responseBuilder
        .speak(localizer.s('CREATE_TIMER_ERROR_MSG') + localizer.s('repromptMessage'))
        .reprompt(localizer.s('repromptMessage'))
        .getResponse();
    }
  },
};

const ReadTimerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReadTimerIntent';
  },
  async handle(handlerInput) {
    const { attributesManager, serviceClientFactory } = handlerInput;
    const localizer = handlerInput.responseBuilder.i18n;
    const sessionAttributes = attributesManager.getSessionAttributes();
    let timerId = sessionAttributes.lastTimerId;

    try {
      const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
      const timersList = await timerServiceClient.getTimers();
      console.log(`Read timers: ${JSON.stringify(timersList)}`);
      const { totalCount } = timersList;
      const preText = totalCount ? localizer.sformatByName('TIMER_COUNT_MSG', { count: totalCount }) : '';
      if (timerId || totalCount > 0) {
        timerId = timerId || timersList.timers[0].id;
        const timerResponse = await timerServiceClient.getTimer(timerId);
        console.log(`Read timer: ${JSON.stringify(timerResponse)}`);
        const timerStatus = timerResponse.status;
        return handlerInput.responseBuilder
          .speak(preText + localizer.sformatByName('LAST_TIMER_MSG', { status: localizer.s(`${timerStatus}_TIMER_STATUS_MSG`) }) + localizer.s('REPROMPT_MSG'))
          .reprompt(localizer.s('REPROMPT_MSG'))
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(preText + localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    } catch (error) {
      console.log(`Read timer error: ${JSON.stringify(error)}`);
      if (error.statusCode === 401) {
        console.log('Unauthorized!');
        return handlerInput.responseBuilder
          .addDirective(TIMERS_VOICE_PERMISSION).getResponse();
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('READ_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    }
  },
};

const DeleteTimerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DeleteTimerIntent';
  },
  async handle(handlerInput) {
    const localizer = handlerInput.responseBuilder.i18n;
    const { attributesManager, serviceClientFactory } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    const timerId = sessionAttributes.lastTimerId;

    try {
      const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
      const timersList = await timerServiceClient.getTimers();
      console.log(`Read timers: ${JSON.stringify(timersList)}`);
      const { totalCount } = timersList;
      if (totalCount === 0) {
        return handlerInput.responseBuilder
          .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
          .reprompt(localizer.s('REPROMPT_MSG'))
          .getResponse();
      }
      if (timerId) {
        await timerServiceClient.deleteTimer(timerId);
      } else {
        // warning, since there's no timer id we *cancel all 3P timers by the user*
        await timerServiceClient.deleteTimers();
      }
      console.log('Timer deleted!');
      return handlerInput.responseBuilder
        .speak(localizer.s('DELETE_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    } catch (error) {
      console.log(`Delete timer error: ${JSON.stringify(error)}`);
      if (error.statusCode === 401) {
        console.log('Unauthorized!');
        return handlerInput.responseBuilder
          .addDirective(TIMERS_VOICE_PERMISSION).getResponse();
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('DELETE_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    }
  },
};

const PauseTimerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'PauseTimerIntent';
  },
  async handle(handlerInput) {
    const localizer = handlerInput.responseBuilder.i18n;
    const { serviceClientFactory } = handlerInput;

    try {
      const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
      const timersList = await timerServiceClient.getTimers();
      console.log(`Read timers: ${JSON.stringify(timersList)}`);
      const { totalCount } = timersList;

      if (totalCount === 0) {
        return handlerInput.responseBuilder
          .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
          .reprompt(localizer.s('REPROMPT_MSG'))
          .getResponse();
      }
      // pauses all timers
      for (const timer of timersList.timers) {
        if (timer.status === 'ON') {
          await timerServiceClient.pauseTimer(timer.id);
        }
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('PAUSE_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    } catch (error) {
      console.log(`Pause timer error: ${JSON.stringify(error)}`);
      if (error.statusCode === 401) {
        console.log('Unauthorized!');
        return handlerInput.responseBuilder
          .addDirective(TIMERS_VOICE_PERMISSION).getResponse();
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('PAUSE_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    }
  },
};

const ResumeTimerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResumeTimerIntent';
  },
  async handle(handlerInput) {
    const localizer = handlerInput.responseBuilder.i18n;
    const { serviceClientFactory } = handlerInput;

    try {
      const timerServiceClient = serviceClientFactory.getTimerManagementServiceClient();
      const timersList = await timerServiceClient.getTimers();
      console.log(`Read timers: ${JSON.stringify(timersList)}`);
      const { totalCount } = timersList;

      if (totalCount === 0) {
        return handlerInput.responseBuilder
          .speak(localizer.s('NO_TIMER_MSG') + localizer.s('REPROMPT_MSG'))
          .reprompt(localizer.s('REPROMPT_MSG'))
          .getResponse();
      }
      // resumes all timers
      for (const timer of timersList.timers) {
        if (timer.status === 'PAUSED') {
          await timerServiceClient.resumeTimer(timer.id);
        }
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('RESUME_TIMER_OK_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    } catch (error) {
      console.log(`Resume timer error: ${JSON.stringify(error)}`);
      if (error.statusCode === 401) {
        console.log('Unauthorized!');
        return handlerInput.responseBuilder
          .addDirective(TIMERS_VOICE_PERMISSION).getResponse();
      }
      return handlerInput.responseBuilder
        .speak(localizer.s('RESUME_TIMER_ERROR_MSG') + localizer.s('REPROMPT_MSG'))
        .reprompt(localizer.s('REPROMPT_MSG'))
        .getResponse();
    }
  },
};

const VoicePermissionsTimerRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
            && handlerInput.requestEnvelope.request.name === 'AskFor'
            && handlerInput.requestEnvelope.request.token === 'for_alexa_timer_api'; // to diff from voice permission handler for Reminder API
  },
  async handle(handlerInput) {
    console.log('Handler: VoicePermissionsTimerRequestHandler');
    const localizer = handlerInput.responseBuilder.i18n;
    const { request } = handlerInput.requestEnvelope;
    const { payload, status } = request;
    console.log(`Connections reponse status + payload: ${status} - ${JSON.stringify(payload)}`);

    if (status.code === '200') {
      if (payload.status === 'ACCEPTED') {
        // Request was accepted
        handlerInput.responseBuilder
          .speak(localizer.s('VOICE_PERMISSION_ACCEPTED') + localizer.s('repromptMessage'))
          .reprompt(localizer.s('repromptMessage'));
      } else if (payload.status === 'DENIED') {
        // Request was denied
        handlerInput.responseBuilder
          .speak(localizer.s('VOICE_PERMISSION_DENIED') + localizer.s('goodbye'));
      } else if (payload.status === 'NOT_ANSWERED') {
        // Request was not answered
        handlerInput.responseBuilder
          .speak(localizer.s('VOICE_PERMISSION_DENIED') + localizer.s('goodbye'));
      }
      if (payload.status !== 'ACCEPTED' && !payload.isCardThrown) {
        handlerInput.responseBuilder
          .speak(localizer.s('PERMISSIONS_CARD_MSG'))
          .withAskForPermissionsConsentCard([TIMERS_PERMISSION]);
      }
      return handlerInput.responseBuilder.getResponse();
    }

    if (status.code === '400') {
      console.log('You forgot to specify the permission in the skill manifest!');
    }

    if (status.code === '500') {
      return handlerInput.responseBuilder
        .speak(localizer.s('VOICE_PERMISSION_ERROR') + localizer.s('repromptMessage'))
        .reprompt(localizer.s('repromptMessage'))
        .getResponse();
    }
    // Something failed.
    console.log(`Connections.Response.AskFor indicated failure. error: ${request.status.message}`);

    return handlerInput.responseBuilder
      .speak(localizer.s('VOICE_PERMISSION_ERROR') + localizer.s('goodbye'))
      .getResponse();
  },
};

const AuthorizationGrantRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Alexa.Authorization.Grant';
  },
  async handle(handlerInput) {
    console.log('Authorization Grant message received');
    console.log(`${JSON.stringify(handlerInput.requestEnvelope)}`);

    try {
      const event = { eventName: 'SAVE_PERMISSION', eventValue: `${TIMERS_PERMISSION}` };
      console.log(`${JSON.stringify(event)}`);
    } catch (error) {
      console.error(`Error when saving Alexa Timer permission: ${error}`);
    }

    // If you were able to do the exchange and store the tokens successfully, return an an empty success response back to Alexa to indicate success.
    // Without this success response signal, Alexa would assume that something went wrong during the exchange (or some other internal process of your skill)
    // and the fact that customer granted permission is not persisted in the system.
    return handlerInput.responseBuilder.getResponse();
  },
};

module.exports = {
  AlexaTimer: {
    SetTimerIntentHandler,
    ReadTimerIntentHandler,
    DeleteTimerIntentHandler,
    PauseTimerIntentHandler,
    ResumeTimerIntentHandler,
    VoicePermissionsTimerRequestHandler,
    AuthorizationGrantRequestHandler,
  },
};
