# The Encryption Server

This document describes the operation and RESTful API of a encryption
server, which will drive encryption on the machine that records votes.

## Summary of endpoints

These are the endpoints for clients to the server:

- `GET` `/`: Get the ballot template
- `POST` `/ballot`: Case a new ballot, retrieve its permanent URI
- `GET` `/ballot/*/hash`: Get the hash of the ballot identified by `*`
- `GET` `/ballot/*/encrypted`: Get the JSON representation of the encrypted
  ballot identified by `*`

Below, we detail their formats. For examples, we assume the server is running
at `localhost:8080`

## Getting the ballot template

The ballot template being used by the server can be retrieved by clients by
`GET`-ing the server. This will be returned in the same format as the
original JSON file, although clients should be ready to accept equivalent but
not identical JSON to the original template, as the returned result has been
parsed and reformatted from the loaded template.

Example interaction:

```
$ curl localhost:8080
{
  "title": "2020 General Election",
  "state": "State of Hamilton",
  "county": "Franklin County",
  "date": "Tuesday, November 3, 2020",
  "districts": [
    {
      "id": "district-1",
      "name": "District 1"
    }
  ],
  "precincts": [
    {
      "id": "21",
      "name": "North Springfield"
    }
  ],
  "ballotStyles": [
    {
      "id": "5R",
      "precincts": [
        "21"
      ],
      "districts": [
        "district-1"
      ]
    }
  ],
  "contests": [
    {
      "id": "president",
      "districtId": "district-1",
      "type": "candidate",
      "allowWriteIns": false,
      "section": "United States",
      "title": "President and Vice-President",
      "seats": 1,
      "candidates": [
        {
          "id": "incumbent",
          "name": "Some Person",
          "party": "Independent"
        }
      ]
    }
  ]
}
```

## Casting a ballot

To cast a ballot, the client sends a `POST` request to the server.
The data sent will soon be specified in a JSON schema.
Currently, it will be a dictionary with one key for each contest ID in the
election, and each key's value mapped to an array of *candidate dictionaries*.
Each candidate dictionary is a three-element object: `{"id": <string>, "name":
<string>, "party": <string>}`, corresponding to those same fields in the
election template. Each candidate listed in the list of candidate dictionaries
is interpreted as a YES vote for that candidate; all those omitted are
interpreted as implicit NO votes. If a contest is omitted from the top level
dictionary, it is interpreted that the client did not vote for any candidate in
that contest.

If the given data does not match this format, an `HTTP/1.1 400: Bad Request` is
returned, with a body describing the mismatch with the above schema. If the
submitted ballot does not belong to the running election, the same error is
reported, but with a body saying so.

A correct `POST` will result in an `HTTP/1.1 302: Found` response, with a
redirect to the permanent URI for the hash of the ballot submitted. The client
may assume that the URI returned will be valid for the remainder of the server's
operation, and will be immediately available once this response is served.

Example interaction:

```
$ curl -i -H "Content-Type: application/json" -X POST -d '{"president": [{"id": "X", "name": "Y", "party": "Z"}]}' "localhost:8080/ballot"
HTTP/1.1 302 Found
Date: Wed, 22 May 2019 16:05:01 GMT
Server: Javalin
Content-Type: text/plain
Location: http://localhost:8080/ballot/439ee34d-e0f0-4ce0-b774-e32b52fb899f/hash
Content-Length: 0
```

## Getting a ballot hash

Each ballot is given a UUID and a hash. As noted above, the UUID of a ballot is
returned as a `HTTP/1.1 302: Found` redirect to the URI for the hash of a
ballot, which is located at `<server>/ballot/<UUID>/hash`. Sending a `GET`
request to this URI will result in a **plain text** response of the hex-encoded
SHA-256 hash of the encrypted ballot corresponding to this UUID, or a `HTTP/1.1
404: Not found` response if no such ballot exists.

Example interaction:

```
$ curl http://localhost:8080/ballot/439ee34d-e0f0-4ce0-b774-e32b52fb899f/hash
86c887b1b37a2f4bb46b133896b4f1a39a4079566413898b605e0d415d5d6d49
```

## Getting an encrypted ballot

The server does not store plain text ballots, only their encrypted
representations. However, those encrypted ballots can be queried, just as their
hashes can above. Sending a `GET` request to
`localhost:8080/ballot/<UUID>/encrypted` will return the JSON representation of
an encrypted ballot. Our schema is similar to the marked ballot
schema used for submitting ballots via `POST`-ing to `/ballot`, but instead of
each contest id being mapped to a list of candidates for whom a vote was placed,
it is mapped to a list of 3-long arrays: `[<candidate dictionary>, <string>,
<string>]`, where the *candidate dictionary* is as defined for casting a ballot
above, and the two strings are the string representations of the pair of
`BigInteger`s which make up a single encrypted boolean vote. The client should
expect that all candidates in the election, whether or not they have been voted
for in this ballot, will occur in the encrypted ballot -- the only variance
between encrypted ballots for the same election is the value of the integers
representing the encrypted votes.
