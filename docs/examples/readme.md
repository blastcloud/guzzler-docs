---
lang: en-US
title: Examples | Guzzler
---

# Examples

The following examples are for real APIs from real companies, based around common scenarios you might face. Be aware, all these are just examples of what you **can** do. Modify to suit your own needs.

<div class="toc">
    <p>
        <a href="#simple-get-google-maps">1. Simple GET: Google Maps</a><br />
        <a href="#async-google-street-view">2. Async: Google Street View</a><br />
        <a href="#sending-data-json">3. POSTing JSON Data</a>
    </p>
    <p>
        <a href="#sending-data-simple-form">4. Forms: Simple</a><br />
        <a href="#sending-data-multipart-form">5. Forms: Multipart</a><br />
        <a href="#testing-failure-scenarios">6. Failure Scenarios</a>
    </p>
</div>

## Simple GET: Google Maps

If we want to test our usage of an API that is primarily GET calls with URL parameters, like the [Google Static Maps API](https://developers.google.com/maps/documentation/maps-static/get-api-key), we can do something like the following.

#### Concerns

1. The correct base API URL is called
1. The API key is included in the URL query
1. The correct URL param configs and address are included in the URL

If everything is correct, the final URL to be called would be:

```bash
http://maps.googleapis.com/maps/api/staticmap?size={width in pixels}x{height in pixels}&scale=2&maptype=roadmap&sensor=false&markers=color:{color}|label:{letter}|{url encoded address}&key={api key}
```

And the result would be an image like this:

<figure>
    <img src="/img/frost-building.png" alt="Google Maps Example Image" title="Google Maps Example Image" />
    <figcaption>Example Static Map Result With 'blue' Color and 'S' Label</figcaption>
</figure>

So, we can assert our request is correct with:

```php
public function testStaticMapUsage()
{
    $address = '401 Congress Ave, Austin, Texas 78701';

    $this->guzzler->expects($this->once())
        ->get('/maps/api/staticmap')
        ->willRespond(
            new Response(
                200, 
                ['Content-Type' => 'image/png'],
                file_get_contents(__DIR__.'/test-files/static-map-image.png')
            )
        ) 
        ->withQuery([
            'size' => "{$this->width}x{$this->height}",
            'scale' => 2,   // or whatever scale your app should use
            'maptype' => 'roadmap',
            'sensor' => false,
            'key' => $this->apiKey
        ])
        ->withCallback(function ($history) use ($address) {
            parse_str($history['request']->getUri()->getQuery(), $query);

            $marker = explode('|', $query['markers']);

            return in_array('color:'.$this->markerColor, $marker)
                && in_array('label:'.$this->markerLabel, $marker)
                && in_array(urlencode($address), $marker);
        }, 'Failed to format the marker correctly.');
    
    // Our class under test
    $this->mapService->getStaticMapImage($address);
    
    // ... Any assertions about saving the file to it's final location
    // ... Any file cleanup afterwards
}
```

The query parameters are pretty self-explanatory, but the markers portion of the query actually has a specialized configuration, using a pipe delimited key-value syntax. In that case, it would probably be easiest to drop in a closure to do specialized checking on whether or not a history item matches the marker configs we are wanting.

### We Can Do Better

Though the above code is perfectly fine, it might still be a good idea to abstract some further details so that our tests can allow more flexibility and not need changing if we update our marker configuration. Assuming we are using some kind of framework or other mechanism to pull our config values from a file, we might have our Google Maps configurations like the following:

```php
// In a google.php config file
return [
    'key' => env('google-maps-key', 'abc123'),
    'map' => [
        'size' => "325x200",
        'scale' => 2,
        'maptype' => 'roadmap',
        'sensor' => false
    ],
    'markers' => [
        'colors' => [
            'blue',
            'green',
            'red'
        ],
        'labels' => [
            'A',
            'B',
            'C'
        ]
    ]
];
```

Now, we can just pass the entire 'map' array from our configs directly into the `withQuery` method in our test, AND know that if the configuration changes, our test still stays current.

### Before

```php
->withQuery([
    'size' => "{$this->width}x{$this->height}",
    'scale' => 2,   // or whatever scale your app should use
    'maptype' => 'roadmap',
    'sensor' => false,
    'key' => $this->apiKey
])
```

### After

```php
->withQuery( config('google.map') + ['key' => config('google.key')] )
// ...or whatever the syntax would be for your configuration system.
```

In a lot of ways, this is actually preferable because we're testing the behavior that our production code should use whatever the current configuration is, and not necessarily that it's using any specific configuration item.

We might also decide there are a few other ways we want to test our markers. The Google maps API actually allows us to repeat the `markers` argument as many times as we want and give a different label and color for each one. Because of that, it might be useful to create a filter that can be used throughout our tests for our application or library. So, we might take the logic used in our `withCallback` and expand it into the following class:

```php
// In our test suite
use BlastCloud\Guzzler\Filters\Base;
use BlastCloud\Guzzler\Interfaces\With;

class WithMarker extends Base implements With
{
    protected $markers = [];

    public function withMarker($configs)
    {
        $this->markers[] = $configs;
    }

    public function __invoke(array $history): array
    {
        return array_filter($history, function ($item) {
            $markers = $this->splitMarkers($item['request']->getUri()->getQuery());

            $finds = array_filter($this->markers, function ($marker) use ($markers) {
                return $this->inMarkerList($marker, $markers);
            });

            return count($finds) == count($this->markers);
        });
    }

    /**
     * Because using parse_str will eliminate any duplicates for the "markers" URL
     * query, we must resort to splitting with "explode" instead.
     *
     * Example: &markers=color:blue|label:A|123+4th+St&markers=color:green|label:B|567+8th+St&key=abcde
     * Would Become: [
     *   'markers=color:blue|label:A|123+4th+St',
     *   'markers=color:green|label:B|567+8th+St'
     * ]
     */
    protected function splitMarkers($url)
    {
        return array_filter(explode('&', $url), function($item) {
            return substr($item, 0, 7) == 'markers';
        });
    }

    protected function inMarkerList($point, $list)
    {
        foreach ($list as $item) {
            if ( strpos($item, 'color:'.$point['color']) !== false
                && strpos($item, 'label:'.$point['label']) !== false
                && strpos($item, urlencode($point['address'])) !== false
            ) {
                return true;
            }
        }

        return false;
    }

    public function __toString(): string
    {
        return str_pad("Markers:", self::STR_PAD)
            .json_encode($this->markers, JSON_PRETTY_PRINT);
    }
}
```

::: tip Note
Please see the [Extending Guzzler](/extending/#custom-filters) section for full details on using custom filters.
:::

Now, we can cleanly write our tests anywhere in our test suite and pass in any number of markers using our new filter.

### Before

```php
->withCallback(function ($history) use ($address) {
    parse_str($history['request']->getUri()->getQuery(), $query);

    $marker = explode('|', $query['markers']);

    return in_array('color:'.$this->markerColor, $marker)
        && in_array('label:'.$this->markerLabel, $marker)
        && in_array(urlencode($address), $marker);
}, 'Failed to format the marker correctly.');
```

### After

```php
$colors = config('google.markers.colors');
$labels = config('google.markers.label');

$expect = $this->guzzler->expects($this->once())
    // ...

for ($i = 0; $i < count($addresses); $i++) {
    $expect->withMarker([
        'color' => $colors[$i],
        'label' => $labels[$i],
        'address' => $addresses[$i]
    ]);
}

// ...
```

Again, this is ideal for a few reasons. First, we can now pass as many `withMarker()` calls as we like to the `Expectation`. Second, we are using a dynamic way to pair colors and labels for our markers. And lastly, we are now abstracting away the logic for Google's specialized syntax into a single place that can be updated if the API ever changes, without changing our tests.

## Async: Google Street View

If you have the scenario where you'd like to download several images from a remote service, like [Google Maps Street View](https://developers.google.com/maps/documentation/streetview/intro), you might test your work is made asynchronously with the following URL for each request.

```bash
https://maps.googleapis.com/maps/api/streetview?size={width}x{height}&sensor=false&location={url encoded address}&key={api key}
```

And the result would be an image like this:

<figure>
    <img src="/img/streetview.jpeg" alt="Streetview Example" title="Streetview Example" />
    <figcaption>Example Result From Streetview</figcaption>
</figure>

::: tip Please Note
Just because you make an asynchronous request, you **do not** have to return a promise from the queue. Guzzle wraps any response you give in a promise automatically and in testing resolves that promise immediately.
:::

```php
public function testMultipleStreetView()
{
    $addresses = [
        '701 W Riverside Dr, Austin, TX 78704',
        '1415 S Congress Ave, Austin, TX 78704',
        '1822 S Congress Ave, Austin, TX 78704'
    ];
    
    $promises = [];
    
    foreach ($addresses as $address) {
        $promises[] = $promise = new \GuzzleHttp\Promise\Promise();
    
        $this->guzzler->expects($this->once())
            ->get('/maps/api/streetview')
            ->asynchronous()
            ->withQuery([
                'size' => $this->width.'x'.$this->height,
                'location' => urlencode($address),
                'key' => $this->apiKey
            ])
            ->willRespond($promise);
    }
    
    $this->mapService->getStreeviewImages($addresses);
    
    // Now we resolve our promises
    foreach ($promises as $promise) {
        $promise->resolve(
            new Response(
                200, 
                ['Content-Type' => 'image/png'],
                file_get_contents(__DIR__.'/test-files/streetview-image.png')
            ) 
        );
    };
    
    // ... Any assertions about saving images
    // ... Any file cleanup afterwards
}
```

Strictly speaking, Guzzle's mock queue does not require you to return a promise, even if the request was an asynchronous one. However, doing so allows control of when the follow up code is run. In the example above, we ensure any `then()` methods are truly delayed. _This is a good way to ensure promises are being used properly, if you intentionally resolve them out of order_.

## Sending Data: JSON

Example coming soon

## Sending Data: Simple Form

Example coming soon

## Sending Data: Multipart Form

Example coming soon

## Testing Failure Scenarios

So far, all our examples have considered only success scenarios. A responsible developer always plans for eventual failure scenarios. In this case, you should always test that any API or service you connect to may go down one day. There are of course dozens of different failure HTTP status codes, but at a minimum you should always plan and test for at least the following scenarios from any service you use:
 
 1. `400: Bad Request`
 1. `401: Unauthorized`
 1. `404: Not Found`
 1. `408: Request Timeout`
 1. `500: Internal Server Error`
 1. `504: Gateway Timeout`
 
 #### Additionally
 - If you are making asynchronous requests, you should also always plan for a promise either `reject`ing or timing out.
 - If you are making multiple requests to the same service often, you will most likely also want to test for rate limiting responses, which usually use status code `429: Too Many Requests`.
 - If you are sending any data to a remote service, you should also always plan for handling validation errors. There is no absolute standard for this scenario, but many services and frameworks use status code `422: Unprocessable Entity`.
 
 This may sound like a lot of extra work at first, but thankfully Guzzle handles catching most of these errors and consolidates them down to a specific exception for each 100 class of responses. Please see the [official documentation on Exceptions](http://docs.guzzlephp.org/en/stable/quickstart.html#exceptions) for full details.
 
 As a quick summary, here are the errors that are the big exceptions thrown by Guzzle and why:
 
 - `GuzzleHttp\Exception\ClientException`: 400 level errors
 - `GuzzleHttp\Exception\ServerException`: 500 level errors
 - `GuzzleHttp\Exception\BadResponseException`: Networking errors like timeouts, DNS errors, etc.
 - `GuzzleHttp\Exception\TooManyRedirectsException`: Number of redirects exceeds limit
 
 All of these Exceptions extend from `GuzzleHttp\Exception\TransferException`, if you want to only catch the base class.
 
 #### Example Error
 
 Using the Google Maps endpoint from the first example, we can do something like the following:
 
 ```php
 public function testStaticMap500Error()
 {
     $address = '401 Congress Ave, Austin, Texas 78701';
 
     $this->guzzler->expects($this->once())
         ->get('/maps/api/staticmap')
         ->willRespond(
             new GuzzlHttp\Exception\ServerException(
                "Something went wrong",
                new Request('GET', 'test'),
                new Response(500, [], 'Something went wrong')
             )
         );

     $this->mapService->getStaticMapImage($address);

     // Assert the correct handling of the exception, whatever
     // that may be.
 }
 ```
 
 In the example above, we are returning an error response. Notice we are not testing for the shape of the request here, as that should be handled from the success scenario test. Also, the `Request` object injected does not really need to be anything specific because here we are instead testing our handling of the response and not the request itself.
  
  ::: tip Please Note
  The `Response` object is not currently required in the `ServerException`, `ClientException`, or `BadResponseException` constructor, but omitting it is currently deprecated and the default `null` value will be removed in Guzzle version 7.
  :::
  
  #### Example Async Rejection
  
  ```php
  public function testMultipleStreetViewWithRejection()
  {
      $addresses = [
          '701 W Riverside Dr, Austin, TX 78704',
          '1415 S Congress Ave, Austin, TX 78704',
          '1822 S Congress Ave, Austin, TX 78704'
      ];
      
      $promises = [];
      
      foreach ($addresses as $address) {
          $promises[] = $promise = new \GuzzleHttp\Promise\Promise();
      
          $this->guzzler->queueResponse($promise);
      }
      
      $this->mapService->getStreeviewImages($addresses);
      
      // Now we reject our promises
      foreach ($promises as $promise) {
          $promise->reject('Our reason message');
      };
      
      // Any assertions about handling the rejections
      // whatever that should be for your code.
  }
  ```