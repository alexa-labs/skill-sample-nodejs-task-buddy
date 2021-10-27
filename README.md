# Task Buddy
This sample skill demonstrates how to use Alexa Skill Links to launch skill or custom tasks from anywhere in the web or mobile.

Throughout this sample, you will learn how to create a skill called Task Buddy which implments a number of [Custom Tasks](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html), and how to construct [Alexa Quick Links](https://developer.amazon.com/en-US/docs/alexa/custom-skills/create-a-quick-link-for-your-skill.html) with input parameters to access the skill. These Alexa features will enable you to create additional skill functionalities that can be accessed from users anywhere in the web or mobile, and allow you to confidently scale up your user acquisition efforts by providing the tools to properly track marketing attributions.

## Try It
You can try out a published version of this skill sample using the following pre-constructed links:

* URL for modal skill launch
    * [Skill Launch](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/launch)
* URLs for custom task launch:
    * [PlaySound task (ocean)](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/tasks/PlaySound/versions/1?soundCategory=ocean) - you can implement `AudioPlayer` in a custom task that can be launched from Alexa Link.
    * [CountDown task (from 10 to 1)](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/tasks/CountDown/versions/1?lowerLimit=1&upperLimit=10)
    * [SetReminder Task](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/tasks/SetReminder/versions/1?text=time_to_grab_coffee_and_take_a_walk&freq=Daily):
        - `scheduledTime` defaults to 20 seconds from when you launch the custom task if the input param is not flagged.
        - `scheduledTime` needs to be in the `YYYY-MM-DDTHH:mm:ss` format. For instance, `2020-06-24T17:50:55`.
    * [TrackMarketing task](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/tasks/TrackMarketing/versions/1?paramOne=prime_day_special_deal&paramTwo=prime_day&paramThree=15&a2z_ref=google_paid_search_campaign) - use the special `a2z_ref` param to tag your marketing campaign data for proper attribution.
    * [CheckStatus task](https://alexa-skills.amazon.com/apis/custom/skills/amzn1.ask.skill.421a75f9-dde0-46c5-a625-c08155abbd6f/tasks/CheckStatus/versions/1?taskCategory=taxi)

## How To Deploy
> **Note**: this guide assumes you are using [ASK CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html), and requires that you use [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) set up with the appropriate permissions on the computer to which you are using  ASK CLI.

**1. Clone this repo**
```
$ git clone https://github.com/alexa-labs/skill-sample-nodejs-task-buddy
```
**2. Change directory to the root of the project**
```
$ cd skill-sample-nodejs-task-buddy
```
**3. Associate the project with your Alexa developer and AWS credentials**
```
$ ask configure
```
**4. Deploy the project**
```
$ ask deploy
```
> **Note**: By default, this would create a new Lambda function using the AWS profile you configure in previous step. Alternatively, if you don't want to provision new resources and instead want to use an existing lambda function, then add the `"endpoint"` object in `skill.json` and update `"uri"` field with the correct Lambda ARN:
```
    "apis": {
      "custom": {
        "endpoint": {
          "uri": "arn:aws:lambda:us-east-1:XXXXXXXX:function:SKILL-NAME"
        },
        "tasks": [
            {
```

**5. Test Your Custom Task handler**
```
$ ask smapi invoke-skill-end-point -s <skill-id> -g development --endpoint-region=default --skill-request-body file:sample.json --debug
```
> **Note**: If Custom Tasks are implemented in your skill, please follow the detailed instructions in [tests folders](https://github.com/alexa-labs/skill-sample-nodejs-task-buddy/tree/master/tests) in order to test the endpoint with sample task payload.

**6. Construct Alexa Quick Links**
```
Modal Skill Launch: https://alexa-skills.amazon.com/apis/custom/skills/<SkillID>/launch
Custom Task Launch: https://alexa-skills.amazon.com/apis/custom/skills/<SkillID>/tasks/<TaskName>/versions/1?param=test
```
> **Note**: Alexa Quick Links only work with live version of your skill. Please make sure your skill is certified and published before accessing the links.

### Additional Documentation
* [Implement Custom Tasks](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html) - A great resource for learning custom tasks.
* [Alexa Quick Links - Custom Task Launch](https://developer.amazon.com/en-US/docs/alexa/custom-skills/create-a-quick-link-for-your-custom-task.html) - Create a Quick Link for Your Custom Task.
* [Alexa Quick Links - Skill Launch](https://developer.amazon.com/en-US/docs/alexa/custom-skills/create-a-quick-link-for-your-skill.html) - Create a Quick Link for Your Custom Skill.
* [Test Your Custom Task Handler](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html#add-test-examples-to-certify-your-task-definitions) - To invoke your task handler with sample payload
