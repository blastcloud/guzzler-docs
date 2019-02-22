# Getting Started

## Getting Started

Add the dependency to your *composer.json* file.

```bash
composer require --dev --prefer-dist blastcloud/guzzler
```

Add the `BlastCloud\Guzzler\UsesGuzzler` trait to your test class.

```php
use BlastCloud\Guzzler\UsesGuzzler;

class SomeTest extends TestCase
{
    use UsesGuzzler;
```

This trait wires up a class variable named `guzzler`. Inside that object the necessary history and mock handlers for Guzzle are instantiated and saved. You can completely customize the `Client` object however you like in two different ways.

### getClient(array $options = [])

The `getClient` method returns a new instance of the Guzzle `Client` class and adds any options you like to it’s constructor. Adding extra options is **not** required.

```php
$client = $this->guzzler->getClient([
    "stream" => true,
    "base_uri" => "http://some-url.com/api/v2"
]);
```

### getHandlerStack()

If you’d rather create your own `Client` instance, you can instead return the handler stack required to mock responses and add it directly to your client.

```php
$client = new Client([
    //... Some configs
    "handler" => $this->guzzler->getHandlerStack()
]);
```

You can also add your own handlers to the stack, if you’d like.

```php
$stack = $this->guzzler->getHandlerStack();
$stack->push(new SomeOtherHandler());

$client = new Client([
    "handler" => $stack
]);
```

## Mocking Responses

There are three main ways to provide responses to return from your client; `queueResponse()` and `queueMany()` methods directly on the `guzzler` instance, and `will()` or `willRespond()` on an expectation.

### queueResponse(...$responses)

The `queueResponse` method is the main way to add responses to your mock handler. Guzzle supports several types of responses besides the standard `ResponseInterface` object; `PromiseInterface` objects, `Exception`s, and `Callable`s. Please see the [official documentation]( http://docs.guzzlephp.org/en/stable/testing.html ) for full details on what can be passed.

```php
public function testSomething()
{
    $this->guzzler->queueResponse(new Response(201, ["some-header" => "value"], "some body"));
    
    //... whatever the first request sent to your client is, the response above will be returned.
}
```

The method accepts variadic arguments, so you can add as many responses as you like..

```php
// One call with multiple arguments
$promise = new Promise();
$this->guzzler->queueResponse(
    new Response(400),
    $promise
);

// Multiple calls with one response each.
$this->guzzler->queueResponse(new Response(200));
$this->guzzler->queueResponse(new \InvalidArgumentException(“message”));
```

> Be aware that whatever order you queue your responses is the order they will be returned from your client, no matter the URI or method of the request. This is a constraint of Guzzle’s mock handler.

### queueMany($response, int $times = 1)

To quickly add multiple responses to the queue without making each one individually, the `queueMany` method can repeat a specific response any number of times you specify.

```php
// Add 5 responses with status code 201 to the queue.
$this->guzzler->queueMany(new Response(201), 5);
```

### will($response, int $times = 1), willRespond($response, int $times = 1)

If you are using expectations in your test, you can add responses to the expectation chain with either `will()` or its alias, `willRespond()`. In both cases, you can provide a single response, promise, or otherwise and the number of times it should be added to the queue. This is so that you can make sure to add a response for each expected invocation.

```php
$this->guzzler->expects($this->atLeast(9))
    ->get("/some-uri")
    ->willRespond(new Response(200), 12);

$this->guzzler->expects($this->twice())
    ->post("/another-uri")
    ->will(new \Exception("some message"), 2);
```

If you’d like to return different responses from the same expectation, you can still chain your `will()` or `willRespond()` statements.

```php
$this->guzzler->expects($this->exactly(2))
    ->endpoint("/a-url-for-deleting", "DELETE")
    ->will(new Response(204))
    ->will(new Response(210));
```

> Be aware that whatever order you queue your responses is the order they will be returned from your client, no matter the URI or method of the request. This is a constraint of Guzzle’s mock handler.
