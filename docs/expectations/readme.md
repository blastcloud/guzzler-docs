# Expectations

Expectations are the main way for you to define what you want Guzzler to search for through your Guzzle client's history. They are used in two separate ways:

- To define the number of times you expect a match to be made before your test your code.
- To assert what Guzzler should search for in your client's history after you test your code.

### expects(InvokedRecorder $times, $message = message)

To mimic the chainable syntax of PHPUnit mock objects, you can create expectations with the `expects()` method and PHPUnit’s own **InvokedRecorders**. These are methods like `$this->once()`, `$this->lessThan($int)`, `$this->never()`, and so on. You may also pass an optional message to be used on errors as the second argument.

```php
public function testExample()
{
    $expectation = $this->guzzler->expects($this->once());
}
```

> All methods on expectations are chainable and can lead directly into another method. `$expectation->oneMethod()->anotherMethod()->stillAnother();`

## Available Methods

### endpoint(string $uri, string $verb), {verb}(string $uri)

To specify the endpoint and method used for an expectation, use the `endpoint()` method or any of the convenience endpoint verb methods.

```php
$this->guzzler->expects($this->once())
    ->endpoint("/some-url", "GET");
```

The following convenience verb methods are available to shorten your code. `get`, `post`, `put`, `delete`,  `patch`, `options`.

```php
$this->guzzler->expects($this->any())
    ->get("/a-url-for-getting");
```

### withHeader(string $key, string|array $value)

If you would like to expect a certain header to be on a request, you can provide the header and it’s value.

```php
$this->guzzler->expects($this->once())
    ->withHeader("Authorization", "some-access-token");
```

You can chain together multiple calls to `withHeader()` to individually add different headers. Headers can also be an array of values.

```php
$this->guzzler->expects($this->once())
    ->withHeader("Accept-Encoding", ["gzip", "deflate"])
    ->withHeader("Accept", "application/json");
```

### withHeaders(array $headers)

As a shorthand for multiple `withHeader()` calls, you can pass an array of header keys and values to `withHeaders()`.

```php
$this->guzzler->expects($this->once())
    ->withHeaders([
        "Accept-Encoding" => ["gzip", "deflate"],
        "Accept" => "application/json"
    ]);
```

### withBody(string $body)

You can expect a certain body on a request by passing a `$body` string to the `withBody()` method.

```php
$this->guzzler->expects($this->once())
    ->withBody("some body string");

// Or, a json based request
    ->withBody(json_encode($someJsonableStructure));
```

### withProtocol($protocol)

You can expect a certain HTTP protocol (1.0, 1.1, 2.0) using the `withProtocol()` method.

```php
$this->guzzler->expects($this->once())
    ->withProtocol(2.0);
```

### withOption(string $name, string $value)

You can expect a certain Guzzle Client/Request option by passing a name and value to this method.

```php
$this->guzzler->expects($this->once())
    ->withOption('stream', true);
```

You can chain together multiple calls to `withOption` to individually add more option values.

```php
$this->guzzler->expects($this->once())
    ->withOption('stream', true)
    ->withOption('allow_redirects', false);
```

### withOptions(array $options)

As a shorthand for multiple `withOption()` calls, you can pass an array of option keys and values to `withOptions()`.

```php
$this->guzzler->expects($this->once())
    ->withOptions([
        'stream' => true,
        'allow_redirects' => false
    ]);
```

### withQuery(array $query, $exclusive = false)

You can expect a set of query parameters to appear in the URL of the request by passing an array of key value pairs to match in the URL. The order of query parameters is not considered, and by default any additional parameters included in the URL are ignored.

```php
// Example URL: http://example.com/api/v2/customers?from=15&to=25&format=xml

// By default the 'format' parameter is ignored
$this->guzzler->expects($this->once())
    ->withQuery([
        'to' => 25,
        'from' => 15
    ]);
```

To enforce only the URL parameters you specify, a boolean `true` can be passed as the second argument.

```php
// Example URL: http://example.com/api/v2/customers?from=15&to=25&format=xml

// With the second argument, the 'format' parameter causes the expectation to fail.
$this->guzzler->expects($this->once())
    ->withQuery([
        'to' => 25,
        'from' => 15
    ], true);
```