// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { Utils } = require('../utils/skillhelpers');
const { TaskHandlerNames } = require('../constants');

function appendAPLDirective(handlerInput, handlerName) {
  if (Utils.supportsAPL(handlerInput)) {
    const { responseBuilder } = handlerInput;
    const doc = responseBuilder.i18n.obj('aplDocs').properties;
    const datasource = responseBuilder.i18n.obj('aplData').customTask;
    const aplDirective = Utils.createAPLDocDirective(doc, datasource);

    switch (handlerName) {
      case TaskHandlerNames.PlaySound:
        aplDirective.datasources.task.image = responseBuilder.i18n.obj('taskImages').runningWater;
        break;
      case TaskHandlerNames.Campaign:
        aplDirective.document = require(responseBuilder.i18n.obj('aplDocs').launchAttribution);
        aplDirective.datasources = require(responseBuilder.i18n.obj('aplData').launchAttribution);
        aplDirective.datasources.task.image = responseBuilder.i18n.obj('taskImages').motherDayDeal;
        aplDirective.datasources.task.params = [
          handlerInput.requestEnvelope.request.task.input.paramOne,
          handlerInput.requestEnvelope.request.task.input.paramTwo,
          handlerInput.requestEnvelope.request.task.input.paramThree,
        ];
        break;
      case TaskHandlerNames.CountDown:
        aplDirective.datasources.task.image = responseBuilder.i18n.obj('taskImages').countDown;
        break;
      case 'StillHereIntent':
        aplDirective.datasources.task.image = responseBuilder.i18n.obj('taskImages').stillhere;
        aplDirective.datasources.task.params = [
          'Still Here',
        ];
        break;
      default:
        aplDirective.datasources.task.image = responseBuilder.i18n.obj('taskImages').task;
        break;
    }

    aplDirective.datasources.task.handler = handlerName;
    aplDirective.datasources.task.request = JSON.stringify(handlerInput.requestEnvelope.request);
    aplDirective.datasources.task.task = JSON.stringify(handlerInput.requestEnvelope.request.task) || '';

    handlerInput.responseBuilder.addDirective(aplDirective);
  }
}

module.exports = {
  appendAPLDirective,
};
