---
title: Guzzler | Official Documentation
lang: en-US
footer: MIT Licensed | Copyright © 2019-present Adam Kelso
---

<img :src="$withBase('/img/guzzler-logo.svg')" alt="Guzzler Logo" />

Simplify your unit tests that use Guzzle with a mock-like syntax. Guzzler covers the process of setting up a mock handler, recording history of requests, and provides several convenience methods for creating expectations and assertions on that history.

## Example Usage

```php
use BlastCloud\Guzzler\UsesGuzzler;
use GuzzleHttp\Client;

class SomeTest extends TestCase
{
    use UsesGuzzler;

    public $classToTest;

    public function setUp(): void
    {
        parent::setUp();

        $client = $this->guzzler->getClient([
            /* Any configs for a client */
            "base_uri" => "https://example.com/api"
        ]);

        // You can then inject this client object into your code or IOC container.
        $this->classToTest = new ClassToTest($client);
    }

    public function testSomethingWithExpectations()
    {
        $this->guzzler->expects($this->once())
            ->post("/some-url")
            ->withHeader("X-Authorization", "some-key")
            ->willRespond(new Response(201));

        $this->classToTest->someMethod();
    }

    public function testSomethingWithAssertions()
    {
        $this->guzzler->queueResponse(
            new Response(204),
            new \Exception("Some message"),
            // any needed responses to return from the client.
        );

        $this->classToTest->someMethod();
        // ... Some other number of calls

        $this->guzzler->assertAll(function ($expect) {
            return $expect->withHeader("Authorization", "some-key");
        });
    }
}
```