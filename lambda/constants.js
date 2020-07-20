// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const SkillID = 'amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f';

const RequestTypes = Object.freeze(
  {
    Launch: 'LaunchRequest',
    Intent: 'IntentRequest',
    SessionEnded: 'SessionEndedRequest',
    SessionResumed: 'SessionResumedRequest',
    ConnectionsResponse: 'Connections.Response',
    AudioPlayerPrefix: 'AudioPlayer',
  },
);

const RequestIntentNamesAMAZON = Object.freeze(
  {
    Cancel: 'AMAZON.CancelIntent',
    Help: 'AMAZON.HelpIntent',
    Stop: 'AMAZON.StopIntent',
    Fallback: 'AMAZON.FallbackIntent',
    Resume: 'AMAZON.ResumeIntent',
    Pause: 'AMAZON.PauseIntent',
  },
);

const RequestIntentNamesCustom = Object.freeze(
  {
    CheckStatus: 'CheckStatusIntent',
    PlaySound: 'PlaySoundIntent',
    CountDown: 'CountDownIntent',
    SetReminder: 'SetReminderIntent',
    TestTask: 'TestTaskUsingVoiceIntent',
  },
);

const RequestTaskNames = Object.freeze(
  {
    CheckStatus: `${SkillID}.CheckStatus`,
    TrackMarketing: `${SkillID}.TrackMarketing`,
    PlaySound: `${SkillID}.PlaySound`,
    CountDown: `${SkillID}.CountDown`,
    SetReminder: `${SkillID}.SetReminder`,
  },
);

const TaskHandlerNames = Object.freeze(
  {
    Campaign: 'TrackMarketingTaskHandler',
    PlaySound: 'PlaySoundTaskHandler',
    CountDown: 'CountDownTaskHandler',
    CheckStatus: 'CheckStatusTaskHandler',
    Launch: 'LaunchRequestHandler',
  },
);

const VoicePermissionStatus = Object.freeze(
  {
    Accepted: 'ACCEPTED',
    Denied: 'DENIED',
    NotAnswered: 'NOT_ANSWERED',
  },
);

module.exports = {
  RequestTypes,
  RequestIntentNamesAMAZON,
  RequestIntentNamesCustom,
  RequestTaskNames,
  TaskHandlerNames,
  VoicePermissionStatus,
};
