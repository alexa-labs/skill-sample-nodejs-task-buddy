# Task Buddy
This sample skill demonstrates how to use Alexa Skill Links to launch skill or custom tasks from anywhere in the web or mobile.

Throughout this sample, you will learn how to create a skill called Task Buddy which implments a number of Custom Tasks, and how to construct web links with input parameters to access the skill. These Alexa features will enable you to create additional skill functionalities that can be accessed from users anywhere in the web or mobile, and allow you to confidently scale up your user acquisition efforts by providing the tools to properly track marketing attributions.

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
$ git clone https://github.com/chandlerjwang/task-buddy
```
**2. Change directory to the root of the project**
```
$ cd task-buddy
```
**3. Associate the project with your Alexa developer and AWS credentials**
```
$ ask configure
```
**4. Deploy the project**
```
$ ask deploy
```
**5. Construct Web Links**
```
Modal Skill Launch: https://alexa-skills.amazon.com/apis/custom/skills/<SkillID>/launch
Custom Task Launch: https://alexa-skills.amazon.com/apis/custom/skills/<SkillID>/tasks/<TaskName>/versions/1?param=test
```

### Additional Documentation
* [Implement Custom Tasks](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html) - A great resource for learning custom tasks.
* [Alexa Links Tech Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html)

