# Schemas

The schemas in this directory represent all of the data
formats needed as the output of the end-to-end verifiable
elections run using ElectionGuard. These documents,
together with the specification of the protocol, can
be used as a complete specification for a verifier.

We will soon add an additional document, containing
only the parts of the protocol spec necessary for implementing
a verifier.

## Get Started

The top-level file in this directory is
[schemas/election_record.schema.json](schemas/election_record.schema.json).
From there, references to other files can be followed. For example the election
parameters can be found
in [schemas/election_parameters.schema.json](schemas/election_record.schema.json):

```
"parameters": {
      "$ref": "election_parameters.schema.json"
    },
```

We provide scripts for viewing, formatting, and validating the schemas, as well
as generating random instances and generating code for parsing instances. To
install the dependencies of the scripts locally, run
```sh
npm install
```

## Viewing

To create an interactive viewer for the schemas, run
```sh
npm run viewer:serve
```
It should automatically update when changes to the schemas are made.

To compile an HTML document that can be served statically, run
```
npm run viewer:build # viewer:build:dev for debug mode
```
Now you can serve the contents of `dist` as the viewer.

## Formatting

To format all of the schemas, run
```sh
npm run fmt
```

## Validating

To check that the schemas are well-formed JSON schemas, run

```sh
npm run validate
```

## Data Generation

To generate a random instance of the schema and print it to STDOUT, run

```sh
npm run generate
```

Our initial implementations of verifiers will come with
valid and invalid examples of this format.

## Code Generation

We can use the [`quicktype`](https://quicktype.io) tool to generate code
from the schema. It will also validate it. You can see the available options by running.
```sh
npx quicktype --help
```

An example invocation to generate rust code:
```sh
npx quicktype -o election_record.rs --src-lang schema schemas/election_record.schema.json
```

## Notational conventions

- $h$, $k$, and $K$ are used for ElGamal public keys.
- $r$, $s$, and $t$ are used for ElGamal private keys.
- $m$ is used for cleartext messages.
- $M$ is used for decrypted messages, $M_i$ for decryption shares and
  $M_{i,j}$ for decryption fragments. For example, $M = g^m = \prod_i
  M_i$.
- $w$ is used for LaGrange coefficients
- $u$ and $v$ are used for zero-knowledge proof responses.
- $c$ is used for zero-knowledge proof challenges.
- $(a, b)$ or $(\alpha, \beta)$ are used for ElGamal messages.

## Terminology

### ElGamal

ElGamal Message
: The tuple $(a, b)$ representing an encrypted ElGamal message, and
  which is composed of the ElGamal one-time public key $a$ and the
  ElGamal ciphertext $b$.

ElGamal One-Time Public Key
: The first component $a$ of an ElGamal message. We call it a one-time
  public key, because it is generated for each message from a random
  number $r$ which acts as a one-time private key, and letting $a =
  g^r$. We must transmit the public key with the message, because in
  order to decrypt a message you must have the shared secret $g^{rs}$,
  which means must have one public key and one private key:
  you can have either the recipient public key $h = g^s$ and the
  one-time private key $r$, or you can have the one-time public key $a
  = g^r$ and the recipient private key $s$.

ElGamal Ciphertext
: The second component $b$ of an ElGamal message. We call it the
  ciphertext because it is the part of the message that actually
  encodes the cleartext $m$, but one cannot decrypt the ciphertext to
  find the cleartext without the other component of the message, the
  one-time public key $a$.

### Zero-Knowledge Proofs

There are two types of non-interactive zero-knowledge proofs used:
Schnorr Proofs and Chaum-Pederson proofs. Schnorr proofs are used to
show posession of a secret associated with a public comittment without
revealing the secret, or, in other words, the posession of a private
key associated with a public key. Chaum-Pederson proofs are used to
show that a given ElGamal message $(a, b)$ is an encryption of zero,
without revealing the one-time private key used to encrypt it.

Both types of proofs have a similar structure, so we use the following
terminology consistently when discussing them.

original object
: The thing which we are proving something about. In a Schnorr proof,
  this is the public key $h$ whose private key we are proving we
  posess, and in a Chaum-Pederson proof this is the ElGamal message
  which we are proving is an encryption of zero.

proof
: The combination of a committment, a challenge, and a response.

committment
: Another instance of the same thing as the original object, which we
  generate for the purposes of the proof.

challenge
: A value which we cannot control, and which is often produced by
  hashing relevent parameters including the original object and the
  committment.

response
: An object that attests to some relationship between the original
  object, the committment and the challenge, and which we could only
  have produced if we knew the things we claim to know, and if the
  original object has the properties we claim it has.

### Decryptions

encrypted message
: An ElGamal message

decrypted message
: A value of the form $g^m$ where $m$ is the cleartext.

decryption share
: A single trustee's share of a decrypted message, and a proof that
  the share encodes the same value as the encrypted message. If this
  share was produced by other trustees compensating for an absent
  trustee, it may also contain the decryption fragments used to
  produce it.

decryption fragment
: A single trustee's portion of an absent trustee's share of a
  decrypted message, and a proof that the fragment encodes the same
  value as the encrypted message.

cleartext
: The actualy message we meant to send, rather than the decrypted
  message. To get the cleartext $m$ from the decrypted message $g^m$,
  we need to take a discrete log. :(

decryption
: An object that represents the verifiable process of decrypting an
  encrypted message, and which contains the encrypted message, the
  decrypted message, the decryption shares used to produce the
  decrypted message, and the cleartext encoded by the decrypted
  message.

### Ballots

ballot
: A list of contests, with some ballot information like date and location.

contest
: A list of selections.

selections
: Either a one or a zero.

## TODO/Questions

- [ ] Document more clearly how the view of Chaum-Pederson proofs as
      "proofs that a message encodes zero" is consistent with each way
      in which they are used.
- [ ] Create a type for 4096-bit numbers for clarity and maintainability.
