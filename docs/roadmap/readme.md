---
lang: en-US
title: Roadmap | Guzzler
---

# Roadmap

First off, thank you all for the Github stars and downloads. It’s been extremely gratifying to see that something I built - trying to solve my own problem - has been not only liked but used by other developers around the world, and continues to grow each day.

Second, the following is a rough idea of what I hope to build and include in projects adjacent to Guzzler. Everything listed below is planned, but not set in stone. Furthermore, I would love feedback on either parts of the plan you like, or areas that it could be improved. There will be Github issues created for different points of the plan below and links will be included. If you like the idea, please leave a thumbs up on the issue(s), or if there is something you think could work better, please leave a comment.

## [Update] Phase 0.5: Hybrid

After a kind coworker - [Chris Holland](https://twitter.com/chrisholland) - with a sizable following in the Symfony community tweeted about this project, I received very positive feedback and a couple requests to make a version of Guzzler that would work with the upcoming [HttpClient](https://github.com/symfony/http-client). I had mentioned to Chris beforehand that I was floating the idea of supporting HttpClient, if for no other reason than I feel like any client library could benefit from an abstraction layer when working with tests. However, after receiving such a warm reception I decided to immediately jump into making that integration.

### First Steps

There is a big problem with the current codebase of Guzzler before Symfony could be supported. The `composer.json` configuration requires Guzzle as a dependency. If the library were to support multiple clients, it would make sense to remove that dependency, but there is no great way I currently know of to support dynamic requirements for dependencies. At the same time, I don’t want to make any changes that could affect backwards compatibility with Guzzler yet. It’s still a young project. So, instead, I’m abstracting out the expectation engine into a separate project that both Guzzler and the new project can require as a dependency. That way, each can have their separate composer dependencies without affecting each other.

### Chassis and Hybrid

Continuing with the “Gas Guzzler” car theme, the new projects will be called `Chassis` and `Hybrid`. Chassis will be the expectation engine that handles recording history, making assertions and expectations, and any console error handling when an expectation fails. Again, Chassis will become a dependency of both Guzzler and Hybrid, so that a common core can be shared between projects and any new additions to that core will immediately be available for both projects. 

The main way Guzzler and Hybrid will differ is mostly the filters used inside each. The expectation engine can support an infinite number of filters, and can dynamically find them given a namespace to look through. Because of this, any integration built on top of Chassis mostly just requires a new set of filters, and anything specific to the client that is not shared with other clients.

##### Guzzler

```php
class SomeTest extends TestCase {
    use UsesGuzzler;

    public function someTest()
    {
        // ...
        $this->guzzler->expects($this->once())
            ->get('some-url')
            ->withQuery([
                'first' => 'value',
                'second' => 'another'
            ]);
    }
}
```

##### Hybrid

```php
class SomeTest extends TestCase {
    use UsesHybrid;

    public function someTest()
    {
        // ...
        $this->hybrid->expects($this->once())
            ->get('some-url')
            ->withQuery([
                'first' => 'value',
                'second' => 'another'
            ]);
    }
}
```

As the examples above show, the only real difference should be the base variable object name on the test class, and the trait that is used. Though this could be inconvenient if your project ever needed to switch from one to the other, the changes should be minimal.

In the same vein, I also plan to provide an **optional** ability to set the name on the class you’d like to use, using a constant on your test class. If this constant exists, the trait will use the name given, and will otherwise default to the name of the package being used.

**Example**

```php
class SomeTest extends TestCase {
    use UsesGuzzler;  // Or UsesHybrid

    const CHASSIS_ENGINE_NAME = ‘eureka’;

    public function someTest()
    {
        // ...
        $this->eureka->expects($this->once())
            ->get('some-url')
            ->withQuery([
                'first' => 'value',
                'second' => 'another'
            ]);
    }
}
```

#### Timeline

**Chassis:** As of right now, most of the code changes for Chassis are complete. A handful of code changes are still needed to make the core not Guzzle specific, and then I need to make a logo and write up the documentation. Right now I’m aiming for August 1st as a go-live date. That will also mean a new version of Guzzler (1.5.3) that will make Chassis a new dependency, and replace the original expectation engine with Chassis’.

**Hybrid:** Though I have a repo for the project and I know what I want to logo to be, the project still has not really started. Because it will depend on Chassis. That project must be completed, or near enough completed first. This is just a guess, but I’m hoping to have the documentation and everything built up and ready by mid to late August.

## Phase 1: Examples / Tutorials

One thing I really didn't expect was hearing people say they would like to see how I would go about using Guzzle in real(istic) projects. Though it makes sense in retrospect it was still surprising, as I don't consider myself to be that experienced using Guzzle in lots of contexts. However, after watching leaders over the years who intentionally set out learning something in order to teach it to others, I'm up to the challenge and hope to have something started soon.

Currently, I have a page of "Examples" that is slowly growing. However, after completing a couple, I immediately see that examples of only the Guzzler / Test side are not really that helpful on their own. Instead, I'm going to create a new repo that is exclusively examples using different patterns and real services. The following are the intended examples and topics:

- GET service. Based off the current example for Google Maps Static image.
  - Should include option for multiple markers of different styles
  - Should include option for streetview
  - Should include reason for making a "service", as it really is just a bunch of getters
  - Should include async by default and only include `wait()` as optional implementation detail. Mention that Guzzle works the same way under the hood.
  - Mention that it can be mixed with the multi-part file POST to S3 or Flysystem if desired
- POST data to Stripe.
  - Try going with a repository pattern to illustrate that it makes sense to think of some services that involve multiple verbs as CRUD models
  - Because most of the functionality of the repository is similar or even shared, build each out of an abstract or base class
  - Really build out the error handling with this one because there are so many different errors or validation issues that can occur
- Service based push
  - The idea here is to set off some kind of process handled by a third-party, and we don't expect an immediate answer
  - Examples could be:
    - SMS: Nexmo
    - Email: SendGrid
    - Log: Rollbar
    - Notification: Slack
- Error Handling
  - This one deserves an explanation separate from everything else, but the error handling itself should be built into the other examples
  - Give multiple options for how errors should be handled
    - Events
    - Introspection
    - Logging
- Consider naming the project `Driver's Ed`

If there is anything specific about using Guzzle or Guzzler you'd appreciate an example or tutorial on, please [create an issue](https://github.com/blastcloud/guzzler/issues) on the project. Any feedback helps.

## Phase 2: Drive

[Github Issue Here](https://github.com/blastcloud/guzzler/issues/7)

Originally, I thought it would be nice to build out an expectation driver for requests from a codebase to an API. That’s what lead to Guzzler. I’m happy with the majority of it. But I still feel that the response side is lacking. Right now, any responses the user wants returned must be built by hand each time. I’d actually prefer a generator build the responses Guzzler should queue.

With open specifications like Swagger/OpenAPI, RAML, and API Blueprint, there’s no reason why developers should have to build out their own response objects. Instead, I envision a factory syntax similar to [Laravel’s model factories](https://laravel.com/docs/5.8/seeding#using-model-factories) for use in tests. Rather than creating an ORM model, `Drive` would create a Response object with the fields, body, headers, and status code specified in a vendor’s spec document. For example, a Swagger doc may contain the possible responses for a `/customers/{id}` endpoint: a `200`, a `201`, and a `404`. A developer, using `Drive` can specify the spec doc, the endpoint name, and the response code.

### Example

The following `.json` file could be placed in the codebase in a testing directory or wherever would make sense. There may be more configurations to come, but at this point this is what would be needed.

### drive.json

```json
{
    "vendor-name": {
        "url": "http://some-url/api.swagger",
        "type": "swagger",
        "version": 3
    },
    "second-vendor": {
        "file": "/path/to/file",
        "type": "RAML"
    },
    "custom-vendor": {
        "file": "/path/to/file",
        "type": "custom"
    }
}
```

### Example Usage

```php
<?php

use BlastCloud\Guzzler\UsesGuzzler;
use function BlastCloud\Drive\drive;

class SomeTest extends TestCase {
    use UsesGuzzler;

    public $faker;
    public $client;

    public function setUp(): void
    {
        $this->faker = Faker\Factory::create();

        $this->client = $this->guzzler->getClient();
    }

    public function testSomething() {
        // This example builds all fields based on Spec and fills with Faker data.
        $this->guzzler->queueResponse(
            drive('vendor.endpoint-name.verb', 'status-code')
        );

        // Here you can override any random data that would normally be
        // filled with Faker.
        $this->guzzler->queueResponse(
            drive('vendor.endpoint.status')
                ->json([
                    'data' => drive('vendor.model', [
                        'age' => 42,
                        'registered' => true,
                        // Other fields are auto-filled with Faker
                        // based on the spec document
                    ])->make(3), // Here we specify we want to generate 3 objects in the 'data' field

                    // HATEOS could also be supported, if they are specified in the spec doc
                    'links' => [
                        // 'first' => 1, inherent first
                        'last' => 6,
                        'next' => 3,
                        'previous' => 1
                    ]
                ])
                ->cookies([
                    'vendor-cookie' => $this->faker->text(24)
                ])
                ->headers([
                    'Content-Type' => 'application/json'
                    // Any other headers specified in the spec doc are auto-generated
                ])
        );

        // Under the hood, build an expectation based on the specification, on fields
        // that are marked as required.
        $this->guzzler->expects($this->once())
            ->validate('vendor.endpoint.verb');
    }
}
```

Just to clarify what is being shown above, the `validate()` method and the `drive()` function both take the name of the vendor specified in the `drive.json` file, then the specific endpoint in question, followed by the verb or status code that should be either expected or returned.

The real benefit of auto-generating data according to spec is that we are then "contract testing", meaning we are testing based on the "promise" offered to us by the external service owner. That way we can use realistic responses, but also follow the mantra "Don't mock what you don't own". Instead, we're replacing it with "Mock what you are guaranteed in a contract".

## Phase 3: Road Test

[Github Issue Here](https://github.com/blastcloud/guzzler/issues/8)

Finally, I'd like to build out an automated way to prove our code is handling all important interactions with a service we care to support. This would be most like a code coverage report for endpoint usage on an API. Ideally, a developer can specify what endpoints they want to cover from the defined specifications, and this report would listen for "drives” - generated responses - for the specified endpoints. It would keep track of which ones are used and which are not, and generate an HTML report of which endpoints were not used but were supposed to be.

This idea is inspired very heavily by PHPUnit’s HTML coverage report. And I think a similar "coverage" rating based on those responses handled by a successful test could be extremely helpful for mission critical systems.

<figure>
    <img src="/img/coverage.png" alt="Coverage Report Example" title="Coverage Report Example" />
    <figcaption>Example Code Coverage Report</figcaption>
</figure>

The following are "wants" for `Road Test`:
- By default, every response type in the spec should be handled at some point in the test suite, but additional data in the `drive.json` file can narrow what endpoints the report should require for any given API.
- Create a coverage report spec that is meant to be used by other languages and environments in the same way that the JUnit spec or clover specs are generic XML coverage specs. This includes:
  - Endpoints / status codes covered are only included if the response was injected into passing tests (green)
  - Only a handful of failure status codes are "recommended" for every endpoint, but more can be added via the `drive.json` or just simply used in a test. The default responses are outlined in the [examples](/examples/#testing-failure-scenarios) page of the documentation as minimum required.
