---
lang: en-US
title: Expectations | Guzzler
---

# Expectations

Expectations are the main way for you to define what you want Guzzler to search for through your Guzzle client's history. They are used in two separate ways:

- To define the number of times you expect a match to be made before you test your code.
- To assert what Guzzler should search for in your client's history after your code is run.

### expects(InvokedRecorder $times, $message = null)

To mimic the chainable syntax of PHPUnit mock objects, you can create expectations with the `expects()` method and PHPUnit’s own **InvokedRecorders**. These are methods like `$this->once()`, `$this->lessThan($int)`, `$this->never()`, and so on. You may also pass an optional message to be used on errors as the second argument.

```php
public function testExample()
{
    $expectation = $this->guzzler->expects($this->once());
}
```

> All methods on expectations are chainable and can lead directly into the next method. `$expectation->oneMethod()->anotherMethod()->stillAnother();`

## Available Methods

<div class="toc">
    <p>
        <a href="#asynchronous">asynchronous</a><br />
        <a href="#endpoint-string-uri-string-verb-verb-string-uri">endpoint, verbs</a><br />
        <a href="#synchronous">synchronous</a><br />
        <a href="#withbody-string-body-bool-exclusive-false">withBody</a><br />
        <a href="#withcallback-closure-callback-string-message-null">withCallback</a><br />
        <a href="#withfile-string-fieldname-file-file">withFile</a><br />
    </p>
    <p>
        <a href="#withfiles-array-files-bool-exclusive-false">withFiles</a><br />
        <a href="#withform-array-formfields-bool-exclusive-false">withForm</a><br />
        <a href="#withformfield-string-key-value">withFormField</a><br />
        <a href="#withheader-string-key-string-array-value">withHeader</a><br />
        <a href="#withheaders-array-headers">withHeaders</a><br />
    </p>
    <p>
        <a href="#withjson-array-json-bool-exclusive-false">withJson</a><br />
        <a href="#withoption-string-name-string-value">withOption</a><br />
        <a href="#withoptions-array-options">withOptions</a><br />
        <a href="#withprotocol-protocol">withProtocol</a><br />
        <a href="#withquery-array-query-exclusive-false">withQuery</a><br />
    </p>
</div>

### asynchronous()

This method can be used to specify that the request should have been made with an asynchronous call; for example, `$client->postAsync()` instead of `$client->post()`.

```php
$this->guzzler->expects($this->once())
    ->asynchronous();
```

### endpoint(string $uri, string $verb), {verb}(string $uri)

To specify the endpoint and method used for an expectation, use the `endpoint()` method or any of the convenience endpoint verb methods.

```php
$this->guzzler->expects($this->once())
    ->endpoint("/some-url", "GET");
```

The following convenience verb methods are available to shorten your code. `get`, `post`, `put`, `delete`,  `patch`, and `options`.

```php
$this->guzzler->expects($this->any())
    ->get("/a-url-for-getting");
```

### synchronous()

This method can be used to specify that the request should have been made with a synchronous call; for example, `$client->get()` instead of `$client->getAsync()`.

```php
$this->guzzler->expects($this->once())
    ->synchronous();
```

### withBody(string $body, bool $exclusive = false)

You can expect a certain body on a request by passing a `$body` string to the `withBody()` method.

```php
$this->guzzler->expects($this->once())
    ->withBody("some body string");
```

By default, this method simply checks that the specified body exists somewhere in the request body but more text may exist. By passing a boolean `true` as the second argument, the method will determine if the body equals the request.

### withCallback(Closure $callback, string $message = null)

You can pass an anonymous method to do on-the-fly logic to determine if a history item fits your concerns. Your closure should expect a Guzzle history array, and return a boolean. A Guzzle history item is an array with the following structure:

```php
// Guzzle history item structure
[
    "request"  => GuzzleHttp\Psr7\Request   object
    "response" => GuzzleHttp\Psr7\Response  object,
    "options"  => array,
    "errors"   => array
]
```

```php
$this->guzzler->expects($this->once())
    ->withCallback(function ($history) {
        return isset($history['options']['cookies']);
    });
```

::: tip
By default, the error message for a callback is simply "Custom callback: \Closure". It's recommended you pass your own message as the second argument to make a more descriptive failure.
:::

### withFile(string $fieldName, File $file)

You can make a set of expectations about a specific file that is included in a request. To do so, specify the field that the file should be under, and include an instance of the `BlastCloud\Guzzler\Helpers\File` class. The `File` class allows you to specify the following attributes of a file that is uploaded via a multipart form:

| Attribute | Description |
|-----------|-------------|
| `contents` | The raw data of a given file. |
| `contentType` | The `mime` type of the file. In HTTP requests, this becomes the `Content-Type` attribute. |
| `filename` | If you choose to name the file something other than its actual file name. |
| `headers` | Multipart forms allow headers on individual [Content-Dispositions](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition). The same checks as `withHeaders` are used here. |

#### Example

There are several ways you can build out the attributes on a `File` object.

```php
use BlastCloud\Guzzler\Helpers\File;

// Specify attributes on instantiation.
$file = new File($contents = null, string $filename = null, string $contentType = null, array $headers = null);

// Pass an associative array to a factory.
$file = File::create([
    'filename' => 'avatar.jpg',
    'contentType' => 'image/jpeg',
    'contents' => fopen('/path/to/file.jpg', 'r')
]);

// Set each attribute individually.
$file = new File();
$file->contents = fopen(__DIR__ . '/path/to/file.jpg', 'r');
$file->filename = 'avatar.jpg';

$this->guzzler->expects($this->once())
    ->withFile('avatar', $file);
```

The `File` class can accept `contents` in two different ways:

1. The string contents are given directly.
2. A resource, such as `fopen()`, is given.

::: tip Be Aware
Because the file given resolves down to an in-memory comparison, it's a good idea to only use reasonably small files during testing.
:::

### withFiles(array $files, bool $exclusive = false)

As a shorthand for passing multiple `withFile()` calls, you can provide an associative array of field names with `BlastCloud\Guzzler\Helpers\File` instances as the values.

```php
$this->guzzler->expects($this->once())
    ->withFiles([
        'first' => File::create(['contents' => fopen('/path/to/file.png', 'r')]),
        'second' => File::create(['contents' => 'some text that would be in the second file']),
        // ...
    ]);
```

By default, this method simply checks that the specified files exist somewhere in the request, but more may exist. By passing a boolean `true` as the second argument, the method will instead cause a failure if additional files are found in the request.

### withForm(array $formFields, bool $exclusive = false)

You can expect a specific set of form fields in the body of a post. This method works with both URL encoded and multipart forms. 

```php
$this->guzzler->expects($this->once())
    ->withForm([
        'first-name' => 'John',
        'last-name' => 'Snow'
    ]);
```

By default, this method simply checks that all specified fields and values exist in the request body, but more may exist. By passing a boolean `true` as the second argument, the method will instead cause a failure if additional fields are found.

### withFormField(string $key, $value)

You can expect a specific form field in the body of a post. This method works with both URL encoded and multipart forms.

```php
$this->guzzler->expects($this->once())
    ->withFormField('first-name', 'John')
    ->withFormField('house-name', 'Snow');
```

### withHeader(string $key, string|array $value)

If you would like to expect a certain header to be on a request, you can provide the header and it’s value.

```php
$this->guzzler->expects($this->once())
    ->withHeader("Authorization", "some-access-token");
```

Headers can also be an array of values.

```php
$this->guzzler->expects($this->once())
    ->withHeader("Accept-Encoding", ["gzip", "deflate"]);
```

### withHeaders(array $headers)

As a shorthand for multiple `withHeader()` calls, you can pass an array of header keys and values.

```php
$this->guzzler->expects($this->once())
    ->withHeaders([
        "Accept-Encoding" => ["gzip", "deflate"],
        "Accept" => "application/json"
    ]);
```

### withJson(array $json, bool $exclusive = false)

You can expect a certain `JSON` body on a request by passing an array of data to the `withJson()` method.

```php
$this->guzzler->expects($this->once())
    ->withJson(['first' => 'value', 'second' => 'another']);
```

::: tip Be Aware
This method tests that the passed array exists on the request by first recursively sorting all keys and values in both the request body and the `$json` argument and then making a string comparison.
:::

This means the following scenarios occur:

```php
// Request body
[
    'first' => [
        'a value',
        'another value'
    ],
    'second' => 'second value'
]

// This expectation will pass. Remember, the request body and the
// argument are both recursively sorted before comparison.
$this->guzzler->expects($this->once())
    ->withJson(['another value', 'a value']);

// This expectation will fail
$this->guzzler->expects($this->once())
    ->withJson(['first' => ['another value']]);
    
// This expectation will pass
$this->guzzler->expects($this->once())
    ->withJson(['second' => 'second value']);
```

By default, this method checks only that the passed array of values exists somewhere in the request body, but more text may exist. A boolean `true` can be passed as the second argument to instead cause a failure if the body does not equal the json specified.

### withOption(string $name, string $value)

You can expect a certain Client option by passing a name and value to this method.

```php
$this->guzzler->expects($this->once())
    ->withOption('stream', true);
```

### withOptions(array $options)

As a shorthand for multiple `withOption()` calls, you can pass an array of option keys and values.

```php
$this->guzzler->expects($this->once())
    ->withOptions([
        'stream' => true,
        'allow_redirects' => false
    ]);
```

### withProtocol($protocol)

You can expect a certain HTTP protocol (1.0, 1.1, 2.0) using the `withProtocol()` method.

```php
$this->guzzler->expects($this->once())
    ->withProtocol(2.0);
```

### withQuery(array $query, $exclusive = false)

You can expect a set of query parameters to appear in the URL of the request by passing an array of key/value pairs to match in the URL. The order of query parameters is not considered.

```php
// Example URL: http://example.com/api/v2/customers?from=15&to=25&format=xml

$this->guzzler->expects($this->once())
    ->withQuery([
        'to' => 25,
        'from' => 15
    ]);
```

By default, this method only checks that the specified parameters exist somewhere in the request URL, but more may exist. A boolean `true` can be passed as the second argument to instead cause a failure if additional parameters are found.

```php
// Example URL: http://example.com/api/v2/customers?from=15&to=25&format=xml

// With the second argument, the 'format' parameter causes the expectation to fail.
$this->guzzler->expects($this->once())
    ->withQuery([
        'to' => 25,
        'from' => 15
    ], true);
```