// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const SendRequest = Object.freeze(
  {
    voicePermission: {
      type: 'Connections.SendRequest',
      name: 'AskFor',
      payload: {
        '@type': 'AskForPermissionsConsentRequest',
        '@version': '1',
        permissionScope: 'alexa::alerts:reminders:skill:readwrite',
      },
      token: '',
    },
  },
);

const StartConnection = Object.freeze(
  {
    print: {
      type: 'Connections.StartConnection',
      uri: 'connection://AMAZON.PrintPDF/1',
      input: {
        '@type': 'PrintPDFRequest',
        '@version': '1',
        title: 'title',
        description: 'description',
        url: 'http://www.example.com/flywheel.pdf',
      },
      token: '1234',
    },
    taxi: {
      type: 'Connections.StartConnection',
      uri: 'connection://AMAZON.ScheduleTaxiReservation/1',
      input: {
        '@type': 'ScheduleTaxiReservationRequest',
        '@version': '1',
        partySize: 4,
        pickupLocation: {
          '@type': 'PostalAddress',
          '@version': '1',
          streetAddress: '415 106th Ave NE',
          locality: 'Bellevue',
          region: 'WA',
          postalCode: '98004',
          country: 'US',
        },
        pickupTime: null,
        dropoffLocation: {
          '@type': 'PostalAddress',
          '@version': '1',
          streetAddress: '2031 6th Ave.',
          locality: 'Seattle',
          region: 'WA',
          postalCode: '98121',
          country: 'US',
        },
      },
    },
    food: {
      type: 'Connections.StartConnection',
      uri: 'connection://AMAZON.ScheduleFoodEstablishmentReservation/1',
      input: {
        '@type': 'ScheduleFoodEstablishmentReservationRequest',
        '@version': '1',
        startTime: '2018-04-08T01:15:46Z',
        partySize: 2,
        restaurant: {
          '@type': 'Restaurant',
          '@version': '1',
          name: 'Amazon Day 1 Restaurant',
          location: {
            '@type': 'PostalAddress',
            '@version': '1',
            streetAddress: '2121 7th Avenue',
            locality: 'Seattle',
            region: 'WA',
            postalCode: '98121',
            country: 'US',
          },
        },
      },
      token: '1234',
    },
  },
);

const AudioPlayer = Object.freeze(
  {
    longFormAudio: {
      type: 'AudioPlayer.Play',
      playBehavior: 'REPLACE_ALL',
      audioItem: {
        stream: {
          token: '96',
          url: 'https://aplsnippets.s3.amazonaws.com/assets/audio/RunningWaters.mp3',
          offsetInMilliseconds: 0,
        },
      },
    },
  },
);

const Tasks = Object.freeze(
  {
    taskComplete: {
      type: 'Tasks.CompleteTask',
      status: {
        code: '200',
        message: 'Task is completed successfully',
      },
    },
  },
);

module.exports = {
  SendRequest,
  StartConnection,
  AudioPlayer,
  Tasks,
};
