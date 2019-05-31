---
lang: en-US
title: Roadmap | Guzzler
---

# Roadmap

> This page outlines where I hope to take the Guzzler project and build out a bit of an ecosystem surrounding the founding ideas of expressive, and helpful integration testing.

First off, thank you all for the Github stars and downloads. It’s been extremely gratifying to see that something I built, trying to solve my own problem has been not only liked but used by other developers around the world, and continues to grow each day.

Second, the following is a rough idea of what I hope to build and include in projects adjacent to Guzzler. Everything listed below is planned, but not set in stone. Furthermore, I would love feedback on either parts of the plan you like, or areas that it could be improved. There will be Github issues created for different points of the plan below and links will be included. If you like the idea, please leave a thumbs up on the issue(s), or if there is something you think could work better, please leave a comment.

## Phase 1: Examples / Tutorials

One thing I didn't really expect was hearing people say they would like to see how I would go about using Guzzle in real(istic) projects. Though it makes sense in retrospect it was still surprising, as I don't consider myself to really be that experienced using Guzzle in lots of contexts. However, after watching the likes of Adam Wathan and others over the years who intentionally set out learning something in order to teach it to others, I'm up to the challenge and hope to have something soon.

Currently, I have a page of "Examples" that is in the process of building. However, after completing a couple, I immediately see that examples of only the Guzzler / Test side are not really that helpful on their own. Instead, I'm going to create a new repo that is exclusively examples using different patterns and real services. The following are the intended examples and topics:

- GET service. Based off the current example for Google Maps Static image.
  - Should include option for multiple markers of different styles
  - Should include option for streetview
  - Should include reason for making a "service", as it really is just a bunch of getters
  - Should include async by default and only include `wait()` as optional implementation detail. Mention that Guzzle works the same way under the hood.
  - Mention that it can be mixed with the multi-part file POST to S3 or Flysystem is desired
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

## Phase 2: Drive

Originally, I thought it would be nice to build out an Expectation driver for requests from a codebase to an API. That’s what lead to Guzzler. I’m happy with the majority of it, but seeing it now, I’m not a fan of how it still requires a developer to verify what their requests should look like to contact an API and also completely define what the response should be from the service. I’d actually prefer a generator build the responses Guzzler should queue.

With the open specifications like Swagger/OpenAPI, RAML, and API Blueprint, there’s no reason why developers should have to build out their own response objects. Instead, I envision a factory syntax similar to Laravel’s model factories for use in tests. Rather than creating an ORM model, it would create a Response object with the fields, body, headers, and status code specified in a vendor’s Spec document. For example, a Swagger doc may contain the possible responses for a `/customers/{id}` endpoint: a `200`, a `201`, and a `404`. A developer, using (tenitively named) `Drive` can specify the spec doc, the endpoint name, and the response type.

### Example

The following `.json` file could be placed in the codebase in a testing directory or other. There may be more configurations to come, but at this point this is what would be needed.

```json
// drive.json
{
    “vendor”: {
        "url”: “http://some-url/api.swagger”,
        “type”: “swagger”,
        “version”: 3
    },
    “second-vendor”: {
        “file”: “/path/to/file”,
        “type”: “RAML
    },
    “custom-vendor”: {
        “file”: “/path/to/file”,
        “type”: “custom”
    }
}
```

```php
<?php

use BlastCloud\Guzzler\UsesGuzzler;
use BlastCloud\Drive\Drive as drive;  // function

class SomeTest extends TestCase {

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
            drive(‘vendor.endpoint-name.status-code’)
        );

        // This example, you can override any random data that would normally be
        // filled with Faker.
        $this->guzzler->queueResponse(
            drive(‘custom.endpoint.status’)
                ->json([
                    'data' => drive('custom.model', [
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
                    'vendor-cookie' => faker()->text(24)
                ])
                ->headers([
                    'Content-Type' => 'application/json'
                ])
        );

        // Under the hood, build an expectation based on the specification, on fields
        // that are marked as required.
        $this->guzzler->expects($this->once())
            ->validate(‘custom.endpoint.verb’);
    }
}
```

## Road Test

Finally, I imagine a code coverage report for endpoint usage on an API. Ideally, a developer can specify what endpoints they want to cover from the defined specifications, and this report would listen for “drives”, or generated responses, for the specified endpoints. It would keep track of which ones are used and which are not, and generate an HTML report of which endpoints were not used but were supposed to be.

This idea is inspired very heavily by PHPUnit’s HTML coverage report. And I think

- [ ] The idea here is very much inspired by PHPUnit's HTML coverage report.
- [ ] By default, every response type in the spec should be handled at some point in the test suite.
- [ ] I'd also like to create a coverage report spec that is meant to be used by other languages too in the same way that the JUnit spec or clover specs are generic XML coverage specs.
  - [ ] Endpoints / status codes covered are only included if the test it was injected into passes
  - [ ] Only a handful of failure status codes are "recommended" for every endpoint, and those are the same ones currently outlined in the "examples" page of the documentation