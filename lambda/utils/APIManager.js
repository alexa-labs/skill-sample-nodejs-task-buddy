/* eslint-disable max-len */
const https = require('https');
const { SkillClientID, SkillClientSecret } = require('../constants');

// Local constants
const TAG = 'APIManager: ';

class SkillResumptionAPIManager {
  static getSkillResumptionOptions(token, sessionId) {
    return {
      hostname: 'api.amazonalexa.com',
      port: 443,
      path: `/v1/_customSkillSessions/${sessionId}/resume`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }

  static getTokenOptions(postLength) {
    return {
      hostname: 'api.amazon.com',
      port: 443,
      path: '/auth/O2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postLength, // TokenPostData.length
      },
    };
  }

  static getTokenPostData() {
    const thescope = 'alexa::skill:resumption';
    return `grant_type=client_credentials&client_id=${SkillClientID}&client_secret=${SkillClientSecret}&scope=${thescope}`;
  }

  static getToken() {
    return new Promise((resolve) => {
      const TokenPostData = SkillResumptionAPIManager.getTokenPostData();
      const req = https.request(SkillResumptionAPIManager.getTokenOptions(TokenPostData.length), (res) => {
        res.setEncoding('utf8');
        let returnData = '';

        res.on('data', (chunk) => {
          returnData += chunk;
        });

        res.on('end', () => {
          const tokenRequestId = res.headers['x-amzn-requestid'];
          resolve(JSON.parse(returnData).access_token);
        });
      });
      req.write(TokenPostData);
      req.end();
    });
  }

  // Skill-Initiated Foregrounding: callResumeSessionAPI
  // Once the ResumeSession request is accepted, skill must handler either SessionResumedRequest or SessionResumeRejectedRequest requests from Alexa
  static postRequest(sessionId, token) {
    console.log(`${TAG}callResumeSessionAPI:API ACCESS TOKEN`, token);
    console.log(`${TAG}callResumeSessionAPI:SessionID`, sessionId);
    const postData = null;
    const SkillResumptionOptions = SkillResumptionAPIManager.getSkillResumptionOptions(token, sessionId);

    return new Promise((resolve, reject) => {
      const req = https.request(SkillResumptionOptions, (response) => {
        response.setEncoding('utf8');
        const { statusCode } = response;
        // const contentType = response.headers['content-type'];

        let error;
        if ([200, 202].includes(statusCode) === true) {
          console.log(`${TAG}request successful - status code -> ${statusCode}`);
          console.log(`${TAG}requestId: ${response.headers['x-amzn-requestid']}`);
        } else {
          error = new Error(`Request Failed. Status: ${statusCode}`);
        }

        if (error) {
          response.resume();
          reject(error);
        }

        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });

        response.on('end', () => {
          resolve(rawData);
        });
      });

      if (postData != null) {
        req.write(postData);
      }
      req.end();
    });
  }
}

module.exports = {
  SkillResumptionAPIManager,
};
