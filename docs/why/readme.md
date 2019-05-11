---
lang: en-US
title: Guzzler | Philosophy and Examples
---

# Philosophy: Why Use This Library?

The project started as a personal itch to have tests that were more descriptive and documenting of what they were testing.

- [ ] Example of complex mock, run, and verify.

In the example above, we’re ensuring our API usage is what we need, but it’s in no way descriptive of what we are actually testing. Instead, it would be nice to say exactly what we are testing for explicitly, at a higher level. That, and it would also be nice to copy PHPUnit’s way of saying “we want to ensure {x} happens {y} number of times.”

These two ideas above, and the realization that Guzzle’s mock handler queue allows response mocks to be pushed to it’s stack at any time, lead to the creation of Guzzler.

### The Results

Given the code shown above, we can now shorten our tests to be more descriptive of what we actually care about.

- [ ] Rewritten example.

## Examples

### Simple Example: Google Maps

If we want to test our usage of an API that is primarily GET calls, like the Google Maps API, we can do something like the following.

| Code Under Test | Without Guzzler | With Guzzler |
|-----------------|-----------------|--------------|
| Get Map Image | | |

Here, we're simply passing the address of the subject and just making sure that we're formatting it properly in the URL query.

### Asynchronous Example: Google Maps Street View

| Code Under Test | Without Guzzler | With Guzzler |
|-----------------|-----------------|--------------|
| Multiple Streetview Images | | |

Here, we're requesting images from Google Maps Streetview for multiple addresses; possibly an unknown number. In order to do that, we want to make sure we make our requests asynchronous.

Strictly speaking, Guzzle's mock queue doesn't require us to return a promise, even if the request was an asynchronous one. However, doing so allows us to control when the follow up code we've built will run. In the examples above, our first two responses will complete after the remaining requests. This is a good way to ensure your app is properly using promises, if you intentionally resolve them out of order.

### Sending Data: JSON

### Sending Data: Simple Form

### Sending Data: Multi-part Form