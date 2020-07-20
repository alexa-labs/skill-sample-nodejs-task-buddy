## Invoke Task handler locally:

CountDown:
```
ask smapi invoke-skill-end-point -s <skill-id> -g development --endpoint-region=default --skill-request-body file:tests/countdown-input.json --debug
```

PlaySound:
```
ask smapi invoke-skill-end-point -s <skill-id> -g development --endpoint-region=default --skill-request-body file:tests/playsound-input.json --debug
```

References:
[How to invoke your task handler](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-custom-tasks-in-your-skill.html#to-invoke-your-task-handler)
