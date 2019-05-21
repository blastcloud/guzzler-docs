---
lang: en-US
title: Guzzler | Examples
---

# Examples

The following examples are for real APIs from real companies, based around common scenarios you might face. Be aware, all these are just examples of what you **can** do. Modify to suit your own needs.

<div class="toc">
    <p>
        <a href="#simple-get-google-maps">1. Simple GET: Google Maps</a><br />
        <a href="#asynchronous-google-maps-street-view">2. Async: Google Streetview</a><br />
        <a href="#sending-data-json">3. POSTing JSON Data</a>
    </p>
    <p>
        <a href="#sending-data-simple-form">4. Forms: Simple</a><br />
        <a href="#sending-data-multi-part-form">5. Forms: Multipart</a><br />
        <a href="#testing-failure-scenarios">6. Failure Scenarios</a>
    </p>
</div>

## Simple GET: Google Maps

If we want to test our usage of an API that is primarily GET calls with URL parameters, like the [Google Static Maps API](https://developers.google.com/maps/documentation/maps-static/get-api-key), we can do something like the following.

### Concerns

1. The current base API URL is called
1. The API key is included as a URL
1. The correct URL param configs and address are included in the URL

If everything is correct, final URL to call would be

```bash
http://maps.googleapis.com/maps/api/staticmap?size={width}x{height}&scale=2&maptype=roadmap&sensor=false&markers=color:{color}|label:{letter}|{url encoded address}&key={api key}
```

And the result would be an image like this

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

The query parameters are pretty self-explanatory, but the markers portion of the query actually has a specialized syntax - using a pipe delimited config - for it's own configuration. In that case, it would probably be easiest to drop in a closure to do specialized checking on whether or not a history item matches the marker configs we are wanting.

## Asynchronous: Google Maps Street View

If you have the scenario where you'd like to download several images from a remote service, like [Google Maps Street View](https://developers.google.com/maps/documentation/streetview/intro) images, you might test your asynchronous work with the following

If everything is correct, the URL for each request should be

```bash
https://maps.googleapis.com/maps/api/streetview?size={width}x{height}&sensor=false&location={url encoded address}&key={api key}
```

And the result would be an image like this

<figure>
    <img src="/img/streetview.jpeg" alt="Streetview Example" title="Streetview Example" />
    <figcaption>Example Result From Streetview</figcaption>
</figure>

::: tip Please Note
Just because you make an asynchronous request, you **do not** have to return a promise from the queue. Guzzle wraps any response you give in a promise automatically.
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

Strictly speaking, Guzzle's mock queue doesn't require us to return a promise, even if the request was an asynchronous one. However, doing so allows us to control when the follow up code we've built will run. In the example above, we ensure any `then()` methods are truly delayed. _This is a good way to ensure your app is properly using promises, if you intentionally resolve them out of order_.

## Sending Data: JSON

Example coming soon

## Sending Data: Simple Form

Example coming soon

## Sending Data: Multi-part Form

Example coming soon

## Testing Failure Scenarios

Example coming soon