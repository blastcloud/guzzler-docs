# Assertions

While `Expectation`s work great for cases where you don’t care about the order of requests to your client, you may find times where you want to verify either the order of requests in your client’s history, or you may want to make assertions about the entirety of its history. Guzzler provides a few convenience assertions for exactly this scenario.

Assertions are also intended to be made after the call to your code under test while `Expectations` are laid out before.

### assertNoHistory($message = null)

To assert that your code did not make any requests at all, you can use the `assertNoHistory()` method, and pass an optional message argument.

```php
public function testSomething()
{
    // ... 
    
    $this->guzzler->assertNoHistory();
}
```

### assertHistoryCount(int $count, $message = null)

This method can assert that the client received exactly the specified number of requests, regardless of what the requests were.

```php
public function testSomething()
{
    // ...
    
    $this->guzzler->assertHistoryCount(4);
}
```

### assertFirst(Closure $expect, $message = null)

Assertions can be made specifically against the first item in the client history. The first argument should be a closure that receives an `Expectation` and an optional error message can be passed as the second argument.

```php
$this->guzzler->assertFirst(function ($expectation) {
    return $expectation->post("/a-url")
        ->withProtocol(1.1)
        ->withHeader("XSRF", "some-string");
});
```

### assertLast(Closure $expect, $message = null)

Assertions can be made specifically against the last item in the client history. The first argument should be a closure that receives an `Expectation` and an optional error message can be passed as the second argument.

```php
$this->guzzler->assertLast(function ($expectation) {
    return $expectation->get("/some-getter");
});
```

### assertIndex(int $index, Closure $expect, $message = null)

Assertions can be made against any specific index of the client history. The first argument should be an integer of the index to assert against. The second argument should be a closure that receives an `Expectation` and an optional error message can be passed as the third argument.

```php
$this->guzzler->assertIndex(3, function ($expectation) {
    return $expectation->post("/a-url");
});
```

### assertIndexes(array $indexes, Closure $expect, $message = null)

Assertions can be made against any specific set of indexes in the client history. The first argument should be an array of integers that correspond to the indexes of history items. The second argument should be a closure that receives an `Expectation` and an optional error message can be passed as the third argument.

```php
$this->guzzler->assertIndexes([2, 3, 6], function ($expectation) {
    return $expectation->withBody("some body string");
});
```

### assertAll(Closure $expect, $message = null)

This method can be used to assert that every request in the client’s history meets the expectation. For example, you may want to ensure that every request uses a certain authentication header. The first argument should be a closure that receives an `Expectation` and an optional error message as the second argument.

```php
$this->guzzler->assertAll(function (Expectation $ex) use ($authHeader) {
    return $ex->withHeader("Authorization", $authHeader);
});
```

### assertNone(Closure $expect, $message = null)

This method can be used to assert that no request, given that any have been made, meet the expectation.

```php
$this->guzzler->assertNone(function ($expect) {
    return $expect->delete("/some-dangerous-thing-to-delete");
});
```
