# The ElectionGuard End-to-End Verifiable Elections SDK

ElectionGuard is an SDK designed to enable end-to-end verifiable (E2EV)
elections on a wide range of existing and new voting systems.

An E2EV election is one in which any voter can obtain proof that their
ballot was included as intended in the final tally,
and in which any observer can
check that the tally was carried out correctly. Together, these two
properties offer voters a high degree of confidence that their vote
was counted. Additionally, an E2EV election must not be vulnerable to
vote-buying or coercion: it must be impossible for a voter to prove to
someone else how they have voted.

## Introduction

For an introduction to one possible application of our SDK, please refer to
[the high-level narrative description](Informal/description/election.html).

The high-level description is one of many potential applications of
ElectionGuard. Some of the specifics could be replaced with
other systems that serve the same purpose. For instance, the ballot
marking device could be replaced with an optical-scanner
produces verifiable encrypted records, or a polling place could be set
up with the functionality of the controller combined with the ballot
box or the vote recording devices.

## Cryptographers

The careful use of cryptography is a key component of our E2EV
election system. Cryptographers who are interested in a detailed
specification of our protocols should first refer to our [specification document](TODO LINK HERE). For an executable
implementation of this specification, see our [Cryptol](https://cryptol.net/documentation.html) implementation [here](Formal/cryptol/ElectionGuard.cry).

## Software Developers

Software developers who are working on implementations of
ElectionGuard should begin by reading the [API reference](TODO LINK HERE).

We also have a process diagram and a state machine diagram to help understand the
flow of data through the polling place:

![Process diagram](Informal/process.png)
![State machine](Informal/statemachine.png)

If you are interested in implementing a verifier, see the
[verifier schema reference](TODO LINK HERE). You will also
find our [reference verifier implementation](TODO LINK HERE)
helpful.

## Table of Contents

 * The [Formal/](Formal/) directory contains Cryptol executable
   specifications of the protocol, as well as schemas representing
   the input of the verifier.
 * The [Informal/](Informal/) directory contains the polling place
   walkthrough, images describing the system, and a description
   of the demo server we set up, which serves as an example
   of how the sdk might communicate with a frontend.

## What is final?

The entire repository is considered pre-release. We look
forward to engaging with the community to polish our specifications
as they move towards release versions.

# Contributors

  * Matt Bauer: Initial executable specification, protocol feedback
  * Josh Benaloh: Initial API design, Complete protocol specification
  * RC Carter: Team leadership, project direction
  * David Christiansen: Informal walkthrough, Readme design
  * Ethan Chumley: Project management, Publication
  * Joey Dodds: API refinement, SDK Crypography implementation
  * Jason Graalum: Team leadership and management
  * Kenny Foner: Demo encryption server, Rust verifier
  * Luke Myers: Schema design, Demo frontend integration
  * Stuart Pernsteiner: Rust verifier
  * Aaron Tomb: Executable specification
  * Jake Waksbaum: Schema design, Initial SDK implementation
  * Daniel Wagner: SDK Cryptography Implementation

