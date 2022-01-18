---
lang: en-US
title: Getting Started | Guzzler
---

# Getting Started

## Requirements

1. PHP 7.4+
2. Guzzle 6 or 7
3. PHPUnit 8.2+

## Installation

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
    "base_uri" => "http://some-url.com/api/v2",
    // ... Any other configurations
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

## Custom Engine Name

Guzzler allows you to customize the variable name of the engine, if you prefer to not use "guzzler". To use a custom name, add a constant to the class called `ENGINE_NAME` with the value set to the variable name you'd prefer.

```php
use BlastCloud\Guzzler\UsesGuzzler;

class SomeTest extends TestCase
{
    use UsesGuzzler;

    public $client;
    
    // Here we define what we want the engine name to be.
    const ENGINE_NAME = 'engine';

    public function setUp(): void
    {
        parent::setUp();

        // Here, $this->guzzler has been renamed
        // to $this->engine
        $this->client = $this->engine->getClient([
            'base_uri' => 'https://some-url.com/api/v2'
        ]);
    }

    public function testSomething()
    {
        $this->engine->expects($this->once())
            ->get('/some/api/url');
        
        // ...
    }
}
```

The main benefit of using a custom engine name is to abstract as much code as possible. Though it's not likely you'll have a conflicting variable named "guzzler", it's a possibility that is covered.