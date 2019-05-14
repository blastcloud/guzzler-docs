---
lang: en-US
title: Guzzler | Why
---

# Why This Library?

This project started as a personal itch to have tests that were more descriptive and documenting of what they were testing.

## Before

In the example below, we’re ensuring our API first checks to see if a bill exists and then creates one if it does not.

```php
public function test_add_bill_if_it_doesnt_exist()
{
    $mock = new MockHandler([
        new Response(404, [], '{}'),
        new Response(201, [], file_get_contents(__DIR__.'/quickbook-stubs/bill-created.json')),
    ]);
    
    $history = [];
    $historyMock = Middleware::history($history);    
    $handler = HandlerStack::create($mock);
    $handler->push($historyMock);
    
    $client = new Client(['handler' => $handler]);
    $accessToken = '123ABC';
    $companyId = 'XYZ987';
    
    $instance = new Quickbooks($client, $accessToken, $companyId);
    $bill = new Bill('some-bill-id', 'some-other-mock-data');
    
    $qbBill = $instance->getOrCreateBill($bill);
    $this->assertInstanceOf(QBBill::class, $qbBill);
    
    // Now we make sure we did what was expected based on Quickbook's API Docs.
    
    // First Call
    $this->assertEquals('GET', $history[0]['request']->getMethod());
    $this->assertEquals("/v3/company/{$this->companyId}/bill/{$bill->quickbooks_id}", $history[0]['request']->getUri()->getPath());
    
    // Second Call
    $this->assertEquals('POST', $history[1]['request']->getMethod());
    $this->assertEquals("/v3/company/{$this->companyId}/bill", $history[1]['request']->getUri()->getPath());
    $body = json_decode($history[1]['request']->getBody(), true);
    $line = $body['Line'][0];
    $this->assertArrayHasKey("DetailType", $line);
    $this->assertEquals("AccountBasedExpenseLineDetail", $line['DetailType']);
    $this->assertArrayHasKey("Amount", $line);
    $this->assertEquals(200, $line['Amount']);
    $this->assertArrayHasKey("Id", $line);
    $this->assertEquals($bill->id, $line['Id']);
    
    // Auths
    foreach ($history as $hist) {
        $this->assertContains("Bearer {$accessToken}", $hist['request']->getHeader('authorization'), "Not all requests were authorized.");
    }
}
```

This test ensures our code is to specification, but other than the test name it’s in no way descriptive of what we are actually testing. Traversing the request objects is fiddly, and a developer new to the project would probably have little idea why it's being done.

## The Goal

Instead, it would be nice to say exactly what we are testing for, and it would be nice to copy PHPUnit’s way of saying _“we want to ensure {x} happens {y} number of times.”_

```php
// PHPUnit Invokables Syntax
$mock->expects($this->once())
    ->method(/* some method name */)
    ->with(/* some argument */)
    ->willReturn(/* some result */);
```

These two ideas above, and the realization that Guzzle’s mock handler queue allows response mocks to be pushed to it’s stack at any time, lead to the creation of Guzzler.

## After

Given the code shown above, we can now shorten our tests to be more descriptive of what we actually care about.

```php
public function setUp(): void
{
    parent::setUp();
    
    $this->instance = new Quickbooks(
        $this->guzzler->getClient(), 
        $this->accessToken, 
        $this->companyId
    );
}

public function test_add_bill_if_it_doesnt_exist()
{
    $bill = new Bill('some-bill-id', 'some-other-mock-data');

    // Here we explicitely say we care about the times it's called, the 
    // endpoint and method, and then what response we expect back in 
    // this scenario.
    $this->guzzler->expects($this->once())
        ->get("/v3/company/{$this->companyId}/bill/{$bill->quickbooks_id}")
        ->willRespond(new Response(404, [], "{}");
    
    // Here we explicitely care about POSTing the specified JSON data and
    // we are mocking the return data with the body we copied to a 
    // local file from the Quickbooks docs.
    $this->guzzler->expects($this->once())
        ->post("/v3/company/{$this->companyId}/bill")
        ->withJson([
            "DetailType" => "AccountBasedExpenseLineDetail", 
            "Amount" => 200.0, 
            "Id" => $bill->id
        ])
        ->willRespond(new Response(201, [], file_get_contents(__DIR__.'/quickbook-stubs/bill-created.json')));
    
    // Our code under test actually runs.
    $qbBill = $this->instance->getOrCreateBill($bill);
    $this->assertInstanceOf(QBBill::class, $qbBill);
    
    // Here we explicitely check that all requests were properly 
    // authenticated, no matter how many requests we made.
    $this->guzzler->assertAll(function (Expectation $e) {
        return $e->withHeaders([
            'content-type' => 'application/json',
            'accept' => 'application/json',
            'authorization' => "Bearer {$this->accessToken}"
        ]);
    });
}
```