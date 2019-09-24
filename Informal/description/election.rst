===========================================
 A Scheme for End-To-End Verifiable Voting
===========================================



Terminology and Background
==========================

For definitions of the technical terms in this description, please
refer to the `NIST Glossary`_.

.. _NIST Glossary: https://pages.nist.gov/ElectionGlossary/ 


Cast of Characters
==================

Election Officials
  In an election, there are many officials, such as members of
  canvassing boards, poll workers, county clerks, or judges, and the
  specific details may vary across jurisdictions. The specifics aren't
  important here, and will be determined by local laws and customs.

The Trustees
  The Trustees are drawn from a variety of political and civil society
  organizations with a variety of views, and are responsible for
  carrying out key steps in the election together. This establishes
  the legitimacy of the election and helps protect against partisan
  tampering.  Existing canvassing board members can often play the
  role of election trustees.

The Voter
  A member of the public who is voting.

The Interested Citizen
  A member of the public who may or may not have voted, but who has an
  interest in the tally being carried out accurately.

Cast of Computers
=================

The general public may not recognize every computer in this list as a
computer. Some of them may be in the form of small pocket
devices. They are referred to here as "computers" so that we can have
appropriate intuitions about threats to election security, but we will
probably want other terminology in public communication.

The Key Generation Computer
  This computer is used to communicate between the Trustee Computers.

The Trustee Computers
  Private keys for the election trustees are generated on portable
  computers or smart cards, controlled by each trustee.

The Ballot Marking Device
  This is a computer with a touch-screen or other accessible interface
  that is directly used by a voter in a voting booth. There is also a
  printer that can create a paper ballot summary and a ballot
  tracker. The Ballot Marking Devices are networked together at a
  polling site or voting center, along with the controller, but this
  network is not connected to the Internet. The connection to the
  Election Controller is necessary in order to carry out the Benaloh
  challenge.

.. We have this assumption of a network and a controller, which
   matches the Hart systems, but not others. We should have a
   discussion about the implications.

The Election Controller
  This is a computer present at the polling site that is used to
  manage the election, for tasks like voter look-up to determine
  eligibility and correct ballot styles.  The election controller can
  also electronically indicate that ballots are spoiled and decrypt
  them so that voters can verify the encryption.

The Ballot Box Computer
  This computer electronically records that the ballot that was
  inserted into the ballot box was cast, rather than spoiled, and
  should be included in the tally.

Prior to Election Day
=====================


Ballot Definition and Election Parameters
-----------------------------------------

Before running an election, election officials should determine the
contents of the ballot. In particular, they should decide which
*contests* should be present, and which *contest options* are
available in each contest, according to the laws of their
jurisdiction. Each ordered list of contests is called a *ballot
style*.

For our demo, there is only one ballot style, and it will be
determined prior to the demo.

Similarly, a suitable authority should define the *key parameters* to
be used by the Trustees. The key parameters consist of the number of
Trustees as well as the size of the quorum that is required to approve
of an election. For instance, a five-member board might require any
three members be present to finalize or modify an election.  This
redundancy is useful in case a trustee experiences technical
difficulties or has unforeseen circumstances that prevent their
participation or if a trustee decides to stop cooperating.  The number
of trustees and the quorum size may be prescribed by local law –
especially if this role is served by an extant canvassing board.

.. note:: In the Coq specification, the threshold parameters are set
          in the ``initializeElection`` step, which takes the election
          from the uninitialized state to the beginning of the key
          generation state.

Key Generation
--------------

Each trustee uses their own trustee computer to generate a *trustee keypair*,
consisting of a *trustee private key* and a *trustee public key*.

.. note:: In the Coq specification, this step is called
          ``generateKeyPair``.  It keeps the election in the key
          generation state, assuming that there are still remaining
          keys to be generated.

Before the election, the Trustees transmit their public keys to the
key generation computer, which creates an *election key*, based on the
trustee public keys. The election key is a public key. The election
key may be published prior to the election. Any quorum of the trustees
can decrypt anything that has been encrypted by the election public
key.

.. note:: The election public key is created with the
          ``formPublicKey`` step in the Coq specification, which
          transitions the election to the key initialized state.

The key generation computer also stores all of the trustee public
keys.  Once each trustee has provided their public key, the public
keys are distributed to all of the trustees. Each trustee then divides
their private keys into shares based on the key parameters. As a
result they will have a number of private key shares equal to the
number of trustees. Each trustee then encrypts each share of their
private key with one of the public keys of each of the trustees. Once
the key shares are encrypted they can be sent to the key generation
computer for distribution amongst the trustees.

.. note:: The distribution of key shares between trustees is the
          ``exportPrivateKeyShares`` operation in the Coq
          specification, which remains in the key initialized state.

Generating the election key can be a public performance, or it can be
done quietly or even remotely. For our demo, we will assume a public
performance in the form of a *key generation ceremony*.  The key
generation ceremony serves two purposes: it is a public, observable
event that establishes legitimacy, and it is an opportunity to
coordinate the construction of the election key.

The Trustees need only trust the Trustee Computer that they bring to
the ceremony. There will be a dramatic moment when the Trustee
Computers are all connected, like simultaneously turning small
computers inserted into a USB slot, to activate the process. For
better cryptographic hygiene, the election key can be generated by
ferrying information back and forth on USB keys, but this may require
3-4 steps and be tedious. This does maintain that the trustee private
keys are airgapped, however.

.. note:: The key ceremony is called ``finalizeKeyCeremony`` in the
          Coq specification. It transitions the election from the key
          initialized state into the voting state.

After key generation, the Trustees keep their private keys safe, while
the election key is published.  The same election key may be used for
multiple elections, and need only be changed when there's a change in
trustees, but we suggest a fresh key for each election. If a trustee
leaves or if a new trustee is added, a new election key must be
generated.


Preparation of Voting Computers
-------------------------------

The election public key must be installed on all ballot marking
devices and controller computers, presumably at the same time as the
ballot styles.

Out of Scope
------------

The following pre-election tasks are not part of the project:

* Management of voter rolls

The following tasks may be part of the project, but are not part of
the demo and are not detailed here:

* Risk-limiting audits


On Election Day
===============


Prior to Voting
---------------

The Voter arrives, and is authenticated against the voting rolls
according to local rules. Voters are issued a *token*, like a PIN or a
smart card, that is linked only to their ballot style.They wait in
line, if necessary, until a ballot marking device becomes available,
and enter into a closed booth. The token additionally prevents double
voting.

.. We need to answer this question:
..
   ** WQ: Smartcard? How will it be read by the BMD? Although one current
    system uses a smart card, this requires the system to have a secure
    connection between the card reader and the BMD. Other systems use
    PINs, but these have an accessibility challenge because they assume
    that a voter can privately read it and then type it in. Some systems
    use a QR/Bar code containing the ballot style that is printed by the
    EPBook and read by the BMD. In at least two systems, the paper with
    the QB/bar code is the ballot paper that the BMD will print.

.. DTC: This was intentionally underspecified - it seems necessary
   that we have some way of indicating it, but the specific choice
   doesn't matter as long as we can make one of them work. Your
   insights would be appreciated.  We must demo from authentication
   forward. Ballot itself as authentication is one possibility, but
   less accessible. Getting the ballot physically, and using it as the
   token, is a good way to underscore that users should check it.

   Also look at a "barcode" on a paper.

   In a real voting place, there's lots of people milling around
   having conversations between the polling places - how to keep
   randos out of the line?

For the upcoming demo, all voters get identical ballots, so we might
dispense with the token. In the future, there must be a way to
associate individual ballot styles with individual voters.

..
   ** WQ: The demo will lose a lot of credibility if there is not some
    sort of demonstration of how the voters authenticate themselves to
    the BMD. It may be smoke and mirrors, but it must be shown to be part
    of the system. This decision is actually a bigger one that it sounds
    from the perspective of election (and polling place) administration.

.. DTC: It sounds like there are aspects here that I need to
   understand better. Can we discuss it?

We are not yet handling provisional ballots. In the meantime, they can
continue to be counted as today, with the proviso that voters casting
provisional ballots will not enjoy the security of end-to-end
verification.  Eventually, an end-to-end verifiable tallying system
can be used to make provisional ballots more secret than today by
removing provisional ballots that fail the challenge instead of only
adding those that pass.


In the Voting Booth
-------------------

In the booth, the Voter finds the ballot marking device.  On the
ballot marking device, the Voter indicates their choices in zero or
more of the contests on the ballot on a touchscreen, or using a
suitable assistive technology. The ballot marking device constructs
both a paper *ballot* and an electronic *cast vote record* (CVR) that
contain the Voter's selections.  The ballot marking device then
determines a temporary unique ID number, encrypts the CVR with the
election key, and constructs a non-interactive zero-knowledge proof
that the encrypted ballot is well-formed. It broadcasts the ID number,
encrypted CVR, and proof over the local network.

.. note:: In the Coq specification, the CVR is encrypted using the
          function ``encryptBallot``.

Individual voting computer vendors will decide how to record
CVRs. Instead of a network, we could instead save them locally on
redundant storage. In the demo, CVRs will be sent to the controller
and logged.


After transmitting the ballot, the marking computer prints out a paper
ballot and a tracker on one piece of paper, joined by a perforated
edge. The ballot is suitable for both optical scanning and human
readability, with the ID number present in a machine-readable
form. The tracker is a strip that contains a machine-readable and
human-comparable hash of the encrypted ballot, but not the ID
number. The machine-readable information is represented in a way that
can be read with a camera, rather than e.g. a magnetic stripe.


Cast or Spoil
-------------

The voter now has two courses of action available: they can
*spoil* their ballot, or they can *cast* it.

The ballot is *spoiled* by taking it to a poll worker at a computer
that broadcasts this fact, using the ID number. This computer is
operated by a poll worker, and the poll worker also physically marks
the paper ballot in a distinctive manner that will make it clear that
it is spoiled. If the voter spoils their ballot, then they may keep it
and its tracker, as well as voting again. At the end of the election,
spoiled ballots are decrypted, so the ballot and tracker can be used
to check that the encryption was correct.

.. note:: In the Coq specification, ballots are spoiled using
          ``spoilBallot``.

**Open question**: How do we mark spoiled ballots such that poll
 workers maintain evidence of the ballot being accounted for, voters
 get their selections, ballots are very visibly spoiled, and a
 smartphone camera attack on perforated edges isn't possible? Ideas:
 cut off corner, make photocopy of selections, take picture of
 selections, mark back and do double-side scans.


To cast a ballot, the voter puts it in the ballot box. The computer on
the smart ballot box scans the ID number, electronically recording the
CVR as cast. The paper ballots in the ballot box are retained for
later risk-limiting audits of the electronic count and for recovering
from catastrophic software failures. The voter keeps the ballot
tracker for later checking of the tallying.

.. note:: In the Coq specification, ballots are cast using
          ``castBallot``.

Before a ballot is cast it is critical that as many voters as possible
inspect their ballots to be sure they reflect the way they voted on
the ballot marking device. There is a direct correlation between the
number of voters that inspect their ballots and the effectiveness of a
risk limiting audit that directly counts ballots (as opposed to a
ballot-comparison audit). Eventually this paragraph should be replaced
by actual measures that will maximize this likelihood. There are
`reasons to believe`_ that getting voters to inspect their ballots may
be an interesting challenge.

.. _reasons to believe: https://freedom-to-tinker.com/2018/12/03/why-voters-should-mark-ballots-by-hand/

**Open question**: What is the goal for percentage of voters who
 inspect ballots? How does the importance of the contest for the voter
 affect their willingness to inspect the paper ballot, and their
 accuracy doing so? How well do voters need to remember their
 selections for the challenge to be useful?


Ballots neither cast nor spoiled should be considered spoiled after
some timeout (e.g., 10 or 20 minutes). ID numbers must not be saved -
they are deleted after the cast/spoil decision timeout has been
reached.


After Polls Close
-----------------

Ballot marking devices can maintain separate direct records of
votes. If they do, then these direct records can be used to provide an
unofficial tally early on election night, prior to the official
verifiable count, just as optical scanners or DRE systems do today.
These individual records can be publicly posted or provided to
candidates.


After Election Day
==================

Aggregation of Encrypted Data
-----------------------------

Following the election, all encrypted records from each polling place
and all paper ballots are aggregated centrally, in accord with local
laws and regulations and practices. For paper ballots, appropriate
physical security measures should be in place.

.. note:: In the Coq specification, the encrypted data are aggregated
          using ``combineBallots``, which additionally transitions the
          election from the voting state to the trustee announcement
          state.


Official Tally
--------------

Prior to tallying, the zero-knowledge proofs of each CVR's
well-formedness are checked, and should this check fail, the CVR must
be excluded in a public manner. Whether this affects the validity of
the election is a matter for law, but we suggest paper tallying in
these cases. The homomorphic properties of the ballot encryption are
employed to count the votes in each contest, yielding a ciphertext
that contains the election result. The Trustees first announce that
they will participate in the encryption and then then independently
perform partial decryptions using their individual private keys. They
submit their partial decryptions and proofs of correctness of partial
decryptions to the key generation computer, in a ceremony reminiscent
of the key generation ceremony. These partial decryptions and their
proofs of correctness are made public.  The partial decryptions are
combined in order to generate the final vote tally and proof of its
correctness. The trustees use the same process to decrypt all spoiled
ballots.

.. note:: In the Coq specification, trustees announce their
          participation using ``announceTrustee``. When all the
          participating trustees have announced this fact,
          ``beginDecryption`` transitions the election from the
          trustee announcement state to the partial decryption state.

If all trustee private keys are available, it is sufficient that each
trustee publishes their own share of the decryption, and these can be
combined to find the tally.

.. note:: The trustees' partial decryptions are created and
          distributed using the ``partialDecrypt`` function in the Coq
          specification. Once all the partial decryptions have been
          distributed, ``formDecryption`` combines them into the
          decrypted tally results.

The encrypted cast ballots, their proofs of well-formedness, the
decrypted spoiled ballots, and the result of the tally are published
simultaneously. The result of the tally includes each intermediate
step, as if in a spreadsheet, so that any errors that are detected can
be localized to simple steps. Anyone wishing to contest the election
count should be able to point to specific errors in the tallying
process, preventing vague challenges that cast aspersions on a
correctly-tallied election. Voters can use their ballot tracker to
check that their encrypted ballot is part of the count.  This check
can be done on a home computer using software from an organization
that the voter trusts or software that they have themselves
constructed, and they can compare it to the spoiled paper ballot that
they took home.

.. note:: The public tally is not described in the Coq
          specification.

Unlike cast ballots, individual spoiled ballots are decrypted and
published in the clear. Because the encryption of the record of the
ballot and the associated paper tracker are created *before* the voter
decides whether to cast or spoil, a malicious or incorrect ballot
marking device commits ahead of time to an electronic
representation. Voters can compare their spoiled ballots to the
decrypted spoiled ballots to catch the machine if it cheats.

Voters need not check the results, and may delegate their trust to
others as they do today. A diligent voter who wants to check need do
nothing more than check that any ballots that they cast or spoiled
match the trackers they posses and that any spoiled ballots display
decryptions that match the selections that they made when creating
these ballots.  Well-formedness of vote encryptions and correct
tallying and decryption can be verified by generic election
verification apps which can be run by any observer – including voters
if they so desire.


..  LocalWords:  cryptographic ciphertext Homomorphic decrypt
..  LocalWords:  assistive
