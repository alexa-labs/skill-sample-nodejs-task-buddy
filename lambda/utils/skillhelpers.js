// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const Alexa = require('ask-sdk-core');

function getRandomString(strings) {
  return strings[Math.floor(Math.random() * strings.length)];
}

function supportsDisplay(handlerInput) {
  return (
    handlerInput.requestEnvelope.context
    && handlerInput.requestEnvelope.context.System
    && handlerInput.requestEnvelope.context.System.device
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
  );
}

function supportsAPL(handlerInput) {
  return (
    handlerInput.requestEnvelope.context
    && handlerInput.requestEnvelope.context.System
    && handlerInput.requestEnvelope.context.System.device
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']
  );
}

function supportsAudioPlayer(handlerInput) {
  return (
    handlerInput.requestEnvelope.context
    && handlerInput.requestEnvelope.context.System
    && handlerInput.requestEnvelope.context.System.device
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces
    && handlerInput.requestEnvelope.context.System.device.supportedInterfaces.AudioPlayer
  );
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Environment {
  static get isDebug() {
    // Since this is a debug example, we default to debug mode.
    return process.env.DEBUG !== 'false';
  }

  static get isVerbose() {
    return Environment.isDebug
      || process.env.VERBOSE !== 'false';
  }
}

function stringFormat(source, ...values) {
  let str = source;
  if (values.length) {
    const t = typeof values[0];
    const args = (t === 'string' || t === 'number')
      ? Array.prototype.slice.call(values) : values[0];
    // eslint-disable-next-line guard-for-in
    // eslint-disable-next-line no-restricted-syntax
    for (const key in args) {
      // eslint-disable-next-line guard-for-in
      str = str.replace(new RegExp(`\\{${key}\\}`, 'gi'), args[key]);
    }
  }
  return str;
}

function getTaskParam(paramValue, defaultValue) {
  let param = paramValue || defaultValue;
  param = param.replace(/_/g, ' ');
  return param;
}

function safeGetSlot(envelope, slotName) {
  let slot = null;
  try {
    slot = Alexa.getSlot(envelope, slotName);
  } finally {
    // eslist-disable-next-line no-empty
  }
  return slot;
}

function getSlotValueId(envelope, slotName) {
  const slot = safeGetSlot(envelope, slotName);
  if (slot && slot.resolutions
    && slot.resolutions.resolutionsPerAuthority && (slot.resolutions.resolutionsPerAuthority.length > 0)) {
    const resolution = slot.resolutions.resolutionsPerAuthority[0];
    if (resolution.status.code === 'ER_SUCCESS_MATCH') {
      return resolution.values[0].value.id;
    }
  }
  return null;
}

/**
 *
 * @param {string} doc - relative path the json document
 * @param {(string\|object)=} datasource - when string: relative path to document object;
 *                  when object: data source
 * @param {string=} token - token for the document
 */

function createAPLDocDirective(doc, datasource, token) {
  const directive = {
    type: 'Alexa.Presentation.APL.RenderDocument',
    version: '1.1',
  };

  if (!doc) {
    throw new Error('document is required for APL RenderDoc directive');
  }

  /* eslint-disable import/no-dynamic-require */
  /* eslint-disable global-require */
  if (doc && typeof (doc) === 'string') { directive.document = require(doc); }
  if (datasource && typeof (datasource) === 'string') { directive.datasources = require(datasource); }
  if (token) {
    directive.token = token;
  }
  return directive;
}

module.exports = {
  Utils: {
    getRandomString,
    supportsAPL,
    supportsDisplay,
    supportsAudioPlayer,
    getRandomInt,
    stringFormat,
    getTaskParam,
    Environment,
    getSlotValueId,
    createAPLDocDirective,
  },
};
