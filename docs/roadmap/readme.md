# Roadmap

- [ ] Thank you all for the Github stars and downloads. It’s been extremely gradifying to see that something I built, trying to solve my own problem has been not only liked but used by other developers around the world.
- [ ] Wanted to share my plans and hopes for the future of Guzzler. I would love feedback on the idea and parts. You can do that on the Github issues I’ll create and add links to this article.

## Phase 1: Cleanup / Refactoring

- [ ] There are a few things I want to fix about the codebase. It’s not bad, but there are several things I can see being problems in the future; particularly the current implementation of the `Expectation` class and all `with*` statements. Everything works as expected (pun semi-intended) right now, but all of them exist on one class. Each should become their own class. In hindsight it also makes sense to move each `with*` method to be in the same class as it’s associated filter. That way, the filter implementation also isn’t reliant upon a string convention (‘filterBy’).
- [ ] All this to say, I plan to refactor to split things up in a way so that an infinite amount of `with*` helpers can be created in the future for any real purpose that may arise.
- [ ] I also want to create a miniature driver system for parsing a request’s body for working with JSON and both `form-encoded` and `multitype` posts. Currently, the implementation of `withForm` and `withFormField` expect the request to only be form encoded, and there is no support for expecting files. This means, once I have a few things moved to where they should be, you can expect `withForm` and `withFormField` to work with either a form type, and you can expect a `withFile` and `withFiles` methods to drop sometime soon too.
- [ ] Expected completion: 1 week or less

## Phase 2: Drive

- [ ] Originally, I thought it would be nice to build out an Expectation driver for requests from a codebase to an API. That’s what lead to Guzzler. I’m happy with the majority of it, but seeing it now, I’m not a fan of how it still requires a developer to verify what their requests should look like to contact an API and also completely define what the response should be from the service. I’d actually prefer an API build the responses Guzzler should queue.
- [ ] With the open specifications like Swagger, RAML, and API Blueprint, there’s no reason why developers should have to build out their own response objects. Instead, I envision a factory syntax similar to Laravel’s model factories for use in tests. Rather than creating an ORM model, it would create a Response object with the fields, body, headers, and status code specified in a vendor’s Spec document. For example, a Swagger doc may contain the possible responses for a `/customers/{id}` endpoint: a `200`, a `201`, and a `404`. A developer, using (tenitively named) Drive can specify the spec doc, the endpoint name, and the response type.

### Example

```json
// drive.json
{
	“first-vendor”: {
		“url”: “http://some-url/api.swagger”,
		“type”: “swagger”,
		“version”: 3
	},
	“second: {
		“file”: “/path/to/file”,
		“type”: “RAML
	},
	“custom”: {
		“file”: “/path/to/file”,
		“type”: “custom”
 	}
}
```

```php
<?php

use BlastCloud\Guzzler\UsesGuzzler;
use Guzzlehttp\Guzzle\Client;
use BlastCloud\Drive\Drive as drive;  // function

class SomeTest extends TestCase {

	public function testSomething() {
		// This example builds all fields based on Spec and fills with Faker data.
		$this->guzzler->queueResponse(
			drive(‘vendor.endpoint-name.status-code’)
		);

		// This example, you can override any random data that would normally be
		// filled with Faker.
		$this->guzzler->queueResponse(
			drive(‘custom.endpoint.status’)
				->json(‘’)
				->file(‘something’)
				->cookies([])
				->headers([])
		);

		// Under the hood, build an expectation based on the specification, on fields
		// that are marked as required.
		$this->guzzler->expects($this->once())
			->validate(‘custom.endpoint.verb’);
	}
}
```

## Checkpoints

- [ ] Finally, I imagine a code coverage like report for endpoint usage for an API. Ideally, a developer can specify what endpoints they want to cover from the defined specifications, and this report would listen for “drives”, or generated responses, for the specified endpoints. It would keep track of which ones are used and which are not, and generate an HTML report of which endpoints were not used but were supposed to be.
- [ ] By default, every response type in the spec should be handled at some point in the test suite.