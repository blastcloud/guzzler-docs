# Helpers

The following helpers methods can be used in addition to `Expectations` and assertions for any custom logic or checks that need to be made.

### getHistory(?int $index, $subIndex = null)

To retrieve the client’s raw history, this method can be used.

```php
$history = $this->guzzler->getHistory();
// Returns the entire history array
```

The shape of Guzzle’s history array is as follows:

```php
$history = [
    [
        "request"  => GuzzleHttp\Psr7\Request   object
        "response" => GuzzleHttp\Psr7\Response  object,
        "options"  => array,
        "errors"   => array
    ],
    // ...
];
```

Individual indexes and sub-indexes of the request can also be requested directly.

```php
$second = $this->guzzler->getHistory(1);
/**
* [
*   'request'  => object
*   'response' => object
*   'options'  => array
*   'errors'   => array
* ]
*/

$options = $this->guzzler->getHistory(4, 'options');
/**
* [
*   'stream' => true,
*   // ...
* ]
*/
```

### historyCount()

Retrieve the total number of requests that were made on the client.

```php
$this->client->get('/first');
$this->client->delete('/second');

echo $this->guzzler->historyCount();
// 2
```

### queueCount()

Retrieve the total number of response items in the mock handler's queue.

````php
echo $this->guzzler->queueCount();
// 0

$this->guzzler->queueMany(new Response(), 6);

echo $this->guzzler->queueCount();
// 6
```