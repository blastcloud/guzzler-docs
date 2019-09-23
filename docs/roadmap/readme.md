---
lang: en-US
title: Roadmap | Guzzler
---

# Roadmap

Thanks everyone for the Github stars, downloads, and retweets for these project. Below is a current look at my roadmap for Guzzler, Hybrid, Chassis and related projects.

## TL;DR.

| Project | Status | Difficulty |
|---------|--------|------------|
| [Hybrid](https://github.com/blastcloud/hybrid) (Symfony port of Guzzler) | :white_check_mark: Released | N/A |
| [Hybrid Documentation](https://hybrid.guzzler.dev) | :white_check_mark: Released | N/A |
| [Chassis](https://github.com/blastcloud/chassis) (Expectation Engine from Guzzler) | :white_check_mark: Released | N/A |
| Chassis Documentation | :clock3: In Progress | Easy |
| Driver's Ed | :x: To-do (Research in progress) | Unknown |
| Drive | :x: To-do | Medium / Difficult |
| Road Test | :x: To-do | Easy / Medium |


## Examples / Tutorials

One thing I really didn't expect was hearing people say they would like to see how I would go about using Guzzle in real(istic) projects. Though it makes sense in retrospect it was still surprising, as I don't consider myself to be that experienced using Guzzle in lots of contexts. However, after watching leaders over the years who intentionally set out learning something in order to teach it to others, I'm up to the challenge and hope to have something started soon.

Currently, I have a page of "Examples" that is slowly growing. However, after completing a couple, I immediately see that examples of only the Guzzler / Test side are not really that helpful on their own. Instead, I'm going to create a new repo that is exclusively examples using different patterns and real services.

## Phase 2: Drive

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
