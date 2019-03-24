---
lang: en-US
title: Guzzler | Extending Guzzler
---

# Extending Guzzler

Though Guzzler tries to be as helpful as possible, there may be times when you need to extend the provided capabilities for your own needs. The main way to do that is by creating your own reusable filters. As of release `1.3.0`, Guzzler allows you to create your own custom filters and even override the provided filters, if you wish.

## Custom Filters

Filters are used by the `Expectation` class to eliminate history items that do not match the defined arguments. Each filter is executed by calling it on an `Expectation` instance.

```php
$this->guzzler->expects($this->once())
    ->withFilterMethod($argument, $another);
    
$this->guzzler->assertAll(function ($e) use ($argument, $another) {
    return $e->withFilterMethod($argument, $another);
});
```

### Class Overview

Though these methods are called directly on the `Expectation` instance, they exist as separate classes that extend the `Base` filter class and implement the `With` interface. For our example, let's imagine we are working with a web API where we send user information. However, we want to ensure that only specific user's information is sent in a request.

Our ideal filter API would be the following method where we can pass in an array of user IDs.

```php
$expectation->post('/users')
    ->withUserIn([1, 6, 42]);
```

To accomplish this, we can first build out a class like the following:

```php
<?php

namespace tests\GuzzlerFilters;

use BlastCloud\Guzzler\Filters\Base;
use BlastCloud\Guzzler\Interfaces\With;

class WithUser extends Base Implements With
{
    protected $userIds = [];
    
    public function withUserIn($userIds)
    {
        $this->userIds = $userIds;
    }
    
    public function __invoke(array $history)
    {
        return array_filter($history, function ($item) {
            $body = json_decode($item['request']->getBody(), true);
            
            return in_array($body['user']['id'], $this->userIds);
        });
    }
    
    public function __toString()
    {
        // A STR_PAD constant is provided so that error messages
        // can be formatted similarly across filters.
        return str_pad("User ID:", self::STR_PAD)
            .json_encode($this->userIds);
    }
}
```

Every filter requires the following methods:

| Method | What it does |
|------|--------------|
| __invoke() | Return all history items that pass the filter. |
| __toString() | Return a human readable explanation. Used on failure. |

In addition, you should provide any methods you want to expose to the `Expectation` class, in the case above, the `withUserIn` method. You can provide as many public methods as you like. For example, you could add another method `withUserRoleAddsDirects` to force the filter to also require a list of employees if the user's role is `admin`. Just be aware that all exposed methods should be considered in the single `__invoke` method.

### Naming Convention

The following naming convention is followed for filter classes. 

- All classes should be named `With` followed by one word. Notice that the `W` is capitalized. For example, `WithBody`, `WithUser`, or `WithQuery`.
- Your class can end either with or without as `s` and it will still be found. For example, `WithUser` or `WithUsers` will both be found.
- Each of the exposed methods on your class should follow the naming convention `with` followed by a camel-cased method name, and the first portion should match the class name. For example, `withUserIds`, `withUserRole`, or `withUserStatus`.
- Each exposed method can have as many arguments as you need, and they may be type hinted, if you prefer.

### Adding a Namespace

To use your filters in Guzzler, you must provide the namespace to look through to find your class. To do this, use the `Expectation::addNamespace` method. This can be done anywhere in your test before your test runs. Because it's done through a static method, it can also be done in a `setUpBeforeClass` method. Also, because this adds an entire namespace, it only needs to be done once to use all class filters you may have in that namespace.

```php
<?php

use BlastCloud\Guzzler\UsesGuzzler;
use BlastCloud\Guzzler\Expectation;

class SomethingTest extends TestCase
{
    use UsesGuzzler;
    
    public function setUp: void
    {
        parent::setUp();
        
        $this->client = $this->guzzler->getClient();
        Expectation::addNamespace('tests\\GuzzlerFilters');
    }
    
    public function testSomething()
    {
        $this->guzzler->expects($this->once())
            ->withUserIn([4, 85, 199]);
    }
}
```

::: tip Be Aware
Any namespaces you add to the `Expectation` class will be checked **before** the provided filters. So, if you name your filter the same as one provided by Guzzler, it will override the Guzzler default. This is exactly what you should do, if you want to override the provided filter.
:::