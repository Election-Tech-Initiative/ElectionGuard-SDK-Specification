# ElectionGuard Preliminary Specification v0.8

Josh Benaloh

Microsoft Research

## Overview
This document describes the functionality of a toolkit that can be used in conjunction with many new and existing voting systems to enable both end-to-end (E2E) verifiability and privacy-enhanced risk-limiting audits (RLAs).  The process involves a set of election trustees (often represented by canvassing board members) who generate keys in advance of each election and then use their keys after the conclusion of voting to decrypt election artifacts to enable public verification of the election tallies.
A device that collects votes (e.g., a ballot-marking device or optical scanner) calls the toolkit with the contents of each vote it receives.  The toolkit uses the trustee public key(s) to encrypt each ballot, stores the encrypted ballot for later publication as part of a public record, and returns to the device a tracking code to be given to the voter (the tracking code is not used if only RLAs are performed).
At the conclusion of an election, each voting device uploads all of the encrypted ballots it has collected together with non-interactive zero-knowledge proofs that each item is an encryption of a legitimate ballot.  These encrypted ballots are then homomorphically combined to form an aggregate encrypted ballot containing the election tallies.  Election trustees then apply their keys to decrypt the tallies and provide a proof that the tallies are correct.
Observers can use this open specification and/or accompanying materials to write election verifiers that can confirm the well-formedness of each encrypted ballot and correct aggregation of these ballots and decryption of election tallies.
## ElectionGuard Structure
This document describes four principal components of ElectionGuard.
* Election Parameters – These are general parameters that can be used in every election.  An alternate means for generating parameters is described, but the burden of verifying an election is increased alternate parameters are used because a verifier must verify the proper construction of any alternate parameters.
* Key Generation – Prior to each individual election, trustees must generate individual public-private key pairs and exchange shares of private keys to enable completion of an election even if some trustees become unavailable.  Although it is preferred to generate new keys for each election, it is permissible to use the same keys for multiple elections so long as the set of trustees remains the same.  I complete new set of keys must be generated if even a single trustee is replaced.
* Ballot Encryption – While encrypting the contents of a ballot is a relatively simple operation, most of the work of ElectionGuard is the process of creating externally-verifiable artifacts to prove that each encrypted ballot is well-formed (i.e., its decryption is a legitimate ballot without overvotes or improper values).
* Verifiable Decryption – At the conclusion of each election, trustees use their private keys to produce election tallies together with verifiable artifacts that prove that the tallies are correct.

## Notation
In the remainder of this specification, the following notation will be used.
- <img src="/tex/e3bf73d6c88e330fdd254dbce4844e66.svg?invert_in_darkmode&sanitize=true" align=middle width=247.48842194999995pt height=24.65753399999998pt/> is the set of integers.
- <img src="/tex/77903e9a21e463df2408dbd764ec918c.svg?invert_in_darkmode&sanitize=true" align=middle width=169.29329339999998pt height=24.65753399999998pt/> is the additive group of the integers modulo p.
- <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/> is the multiplicative subgroup of <img src="/tex/32cac8f526d1829402bda44529d4156c.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/>.  
- When p is a prime, <img src="/tex/adafc420f4d25a0f1ccf50461c0ea50e.svg?invert_in_darkmode&sanitize=true" align=middle width=169.29329339999998pt height=24.65753399999998pt/>, then
	<img src="/tex/e006147c348d1743c71810e6a3280ca3.svg?invert_in_darkmode&sanitize=true" align=middle width=74.07418589999999pt height=24.65753399999998pt/> for which <img src="/tex/93d62f7b7a83b5940bee9ad4ede8c81f.svg?invert_in_darkmode&sanitize=true" align=middle width=27.13040714999999pt height=22.648391699999998pt/> such that <img src="/tex/ff10e9ebcca02122993f5f85ea1bfe2d.svg?invert_in_darkmode&sanitize=true" align=middle width=111.67583459999999pt height=24.65753399999998pt/> is the set of r^th-residues in <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/>. 
- When p is a prime for which, p-1=qr with q a prime that is not a divisor of integer r, then Z_p^r is an order q cyclic subgroup of <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/> and for each <img src="/tex/8cc71eff115f824bc8d77c9f354fe1ef.svg?invert_in_darkmode&sanitize=true" align=middle width=26.384625299999993pt height=22.648391699999998pt/>, <img src="/tex/ee231067ed3ba1b6dd91d6eb25b486bb.svg?invert_in_darkmode&sanitize=true" align=middle width=26.384625299999993pt height=22.648391699999998pt/> if and only if <img src="/tex/b094220adb9cc64111c066d9071097c4.svg?invert_in_darkmode&sanitize=true" align=middle width=102.26125634999998pt height=22.831056599999986pt/>.

## Encryption
Encryption in ElectionGuard is done using the ElGamal cryptosystem.<sup>[1](#footnote1)</sup>.  Primes p and q are publicly fixed together with a generator g of an order q subgroup of <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/>.  A public-private key pair can be chosen by selecting a random <img src="/tex/b41c9e5a5b01f88c94550a578a804ea4.svg?invert_in_darkmode&sanitize=true" align=middle width=25.102258499999987pt height=22.648391699999998pt/> as a private key and publishing <img src="/tex/5d72bc0bf7b6759efe183d2cbe3f3e0e.svg?invert_in_darkmode&sanitize=true" align=middle width=108.72675164999998pt height=22.831056599999986pt/> as a public key.
A message <img src="/tex/f575f04ec6a69702c3fa6d28c537d8be.svg?invert_in_darkmode&sanitize=true" align=middle width=36.87217874999999pt height=22.63846199999998pt/> can then be encrypted by selecting a random nonce <img src="/tex/b928bb9e10cce022a81497b3ffefb155.svg?invert_in_darkmode&sanitize=true" align=middle width=25.26973349999999pt height=22.648391699999998pt/> and forming the pair <img src="/tex/b103b43d896bb65419c83a754b7bbc2a.svg?invert_in_darkmode&sanitize=true" align=middle width=230.39693654999996pt height=24.65753399999998pt/>.  An encryption (α,β) can be decrypted by the holder of the secret s as

<img src="/tex/7cf0f66841c90e63aad0e2d3c78d1891.svg?invert_in_darkmode&sanitize=true" align=middle width=671.0890295999999pt height=24.65753399999998pt/>

However, as will be described below, it is possible for a holder of a nonce r to prove to a third party that a pair (α,β) is an encryption of M without revealing the nonce r and without access to the secret s.

### Non-Interactive Zero-Knowledge Proofs
ElectionGuard provides numerous proofs about encryption keys, encrypted ballots, and election tallies using the following four techniques.
* A Schnorr proof  allows the holder of an ElGamal secret key s to interactively prove possession of s without revealing s.
* A Chaum-Pedersen proof  allows an ElGamal encryption to be interactively proven to decrypt to a particular value without revealing the nonce used for encryption or the secret decryption key s.
* The Cramer-Damgård-Schoenmakers technique enables a disjunction to be interactively proven without revealing which disjunct is true.
* The Fiat-Shamir heuristic allows interactive proofs to be converted into non-interactive proofs.

## Election Parameters
Integer ElGamal encryption is used with a prime modulus (p) chosen such that p-1=qr where q is a moderately-sized prime that is not a divisor of r.  Because data confidentiality should be long-lived, the ElectionGuard default will use a 4096-bit prime p and a 256-bit prime q.  A generator (g) of the order q multiplicative subgroup of <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/> is also provided along with <img src="/tex/b629d35694a0eb5982d35715765dd18b.svg?invert_in_darkmode&sanitize=true" align=middle width=135.655872pt height=29.190975000000005pt/>.  The principal reason for selecting integer ElGamal over elliptic curve ElGamal is the desire to make construction of election verifiers as simple as possible without requiring special tools or dependencies.
Standard parameters for ElectionGuard begin with the largest 256-bit prime q=2^256-189.  The hexadecimal representation of q is as follows.
```
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFF43
```
The modulus p is then set to be the largest 4096-bit prime which is one greater than a multiple of q.  This works out to p=2^4096-69q-2650872664557734482243044168410288960.
The hexadecimal representation of p is as follows.
  ```
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF
  FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FE0175E3 0B1B0E79 1DB50299 4F24DFB1
  ```

The value of the cofactor r is then set to <img src="/tex/d812170329c1b47810d197fb170b7222.svg?invert_in_darkmode&sanitize=true" align=middle width=95.30430195pt height=24.65753399999998pt/>, and <img src="/tex/acb5259b337b6b6a719aa62dea718715.svg?invert_in_darkmode&sanitize=true" align=middle width=102.0619974pt height=22.831056599999986pt/> is used as the generator of the order q multiplicative subgroup of <img src="/tex/c77d4a41e2651e4b8f64b02d03981d08.svg?invert_in_darkmode&sanitize=true" align=middle width=17.73541934999999pt height=22.648391699999998pt/>.  The hexadecimal representation of g is as follows.
  ```
  9B61C275 E06F3E38 372F9A9A DE0CDC4C 82F4CE53 37B3EF0E D28BEDBC 01342EB8
  9977C811 6D741270 D45B0EBE 12D96C5A EE997FEF DEA18569 018AFE12 84E702BB
  9B8C78E0 3E697F37 8D25BCBC B94FEFD1 2B7F9704 7F634232 68881C3B 96B389E1
  34CB3162 CB73ED80 52F7946C 7E72907F D8B96862 D443B5C2 6F7B0E3F DC9F035C
  BF0F5AAB 670B7901 1A8BCDEB CF421CC9 CBBE12C7 88E50328 041EB59D 81079497
  B667B960 49DA04C7 9D60F527 B1C02F7E CBA66849 179CB5CF BE7C990C D888B69C
  44171E4F 54C21A8C FE9D821F 195F7553 B73A7057 07263EAE A3B7AFA7 DED79ACF
  5A64F3BF B939B815 C52085F4 0714F4C6 460B0B0C 3598E317 46A06C2A 3457676C
  B345C8A3 90EBB942 8CEECEFA 6FCB1C27 A9E527A6 C55B8D6B 2B1868D6 EC719E18
  9A799605 C540F864 1F135D5D C7FB62D5 8E0DE0B6 AE3AB90E 91FB9965 05D7D928
  3DA833FF 0CB6CC8C A7BAFA0E 90BB1ADB 81545A80 1F0016DC 7088A4DF 2CFB7D6D
  D876A2A5 807BDAA4 000DAFA2 DFB6FBB0 ED9D7755 89156DDB FC24FF22 03FFF9C5
  CF7C85C6 8F66DE94 C98331F5 0FEF59CF 8E7CE9D9 5FA008F7 C1672D26 9C163751
  012826C4 C8F5B5F4 C11EDB62 550F3CF9 3D86F3CC 6E22B0E7 69AC6591 57F40383
  B5DF9DB9 F8414F6C B5FA7D17 BDDD3BC9 0DC7BDC3 9BAF3BE6 02A99E2A 37CE3A5C
  098A8C1E FD3CD28A 6B79306C A2C20C55 174218A3 935F697E 813628D2 D861BE5
  ```
The inverse generator g ̅=1/g  mod p has the following hexadecimal representation.
  ```
  7C3760F7 C5286704 4BCDE2D4 759615F1 69B873FC B465D96D BE3CBFA5 8AA5EA94
  31FE08F7 AAC4F859 8C240BE6 194B03E3 7F8A9DC7 8A255A82 BCE95959 FF52A6DE
  66CF240A 50EDB093 4A987FD9 DA4AFD73 A38011BD 08F4AE43 573BDD50 FA6F70EE
  EA067D6E 57D446DE 9351BEE5 0E6AD9A5 B9282967 F1CDA890 A21C79C4 3C398755
  9F415CCC 4E9E71C2 E0D7E4AA 95C23510 891F0C98 0D2F67DD 14EF589A 356D9FE7
  79AD2288 5923FAAC 1D334EDC D64D1541 66446A96 879EEB61 D92ADB68 F7BFA1BA
  F7F66B05 7409A10A 08297B79 31CDB706 21571E31 43335ED7 BF130C08 18A8F99D
  60E71645 D399B793 11A28B7D 10D7F1D4 0918A836 1B937929 FB0E9B46 3F90E494
  4E37EDBE 60F5F0BD 21F4737D D526B4FF 7EFE36EE 5C8A0456 3B8F04CF 8E7A29EE
  9742DA6E 27B7442C 5E9BD207 3F6274ED FDD8CBEF 916F6433 19D8A385 D5D52587
  25FC3FA8 ECCFE897 72C85A84 79754B8A 53A7F19E EB64A1BE 23A767D2 898F9152
  91D680BC 8778462E 2A6490EC E23A5C99 F96F1677 3018050C 24D00A1C 720B05AC
  6B74BDE8 1FDAF645 433A227E 75D13073 00DB62FA 259B711D 077923C1 23624482
  C6CEEF6A 925FABA1 8E44A5C0 C02DF980 220B517B C210655A FD9A7C16 2A3FCFCE
  FC12E7C9 1D625397 366B3570 596316E1 6DD24A1E 1DC330C0 F051A9C4 2E528E56
  39750808 BEC8614C CA123F27 A76F043A 2FD7864E C61C4F66 3F896543 4A73E978
  ```
Alternative parameter sets are possible.  A good source for parameter generation is appendix A of FIPS 186-4.   However, allowing alternate parameters would force election verifiers to recognize and check that parameters are correctly generated.  Since these checks would be very different from other checks that are required of a verifier, allowing alternate parameters would add substantial complexity to election verifiers.  For this reason, this version of ElectionGuard fixes the parameters as above.
An ElectionGuard version 1 election verifier may assume that the election parameters match the parameters provided above.  However, it is recommended that the above parameters be checked against the parameters of each election in order to accommodate the possibility of different parameters in future versions of ElectionGuard 

## Key Generation
Before an election, the number of trustees (n) is fixed together with a threshold value (k) that describes the number of trustees necessary to decrypt tallies and election verification.  The values n and k are integers subject to the constraint that 1≤k≤n.  Canvassing board members can often serve the role of election trustees, and typical values for n and k could be 5 and 3 – indicating that 3 of 5 canvassing board members must cooperate to produce the artifacts that enable election verification.  The reason for not setting k too low is that it will also be possible for k trustees to decrypt individual ballots.

> Note that decryption of individual ballots does not directly compromise voter privacy since links between encrypted ballots and the voters who cast them are not retained by the system.  However, voters receive tracking codes that can be associated with individual encrypted ballots.  So any group that has the ability to decrypt individual ballots can also coerce voters by demanding to see their trackers.

Threshold ElGamal encryption is used for encryption of ballots.  This form of encryption makes it very easy to combine individual trustee public keys into a single public key for encrypting ballots.  It also offers a homomorphic property that allows individual encrypted votes to be combined to form encrypted tallies.
The trustees of an election will each generate a public-private key pair.  The public keys will then be combined into a single election public key which is used to encrypt all selections made by voters in the election.
Ideally, at the conclusion of the election, each trustee will use its private key to form a verifiable partial decryption of each tally.  These partial decryptions will then be combined to form full verifiable decryptions of the election tallies.
To accommodate the possibility that one or more of the trustees will not be available at the conclusion of the election to form their partial decryptions, the trustees will cryptographically share their private keys amongst each other during key generation.  A pre-determined threshold value (k) out of the (n) trustees will be necessary to produce a full decryption.
Another parameter of an election should be a public ballot coding file.  This file should list all of the contests in an election, the number of selections allowed for each contest, and the options for each contest together with associations between each option and its representation on a virtual ballot.  For instance, if Alice, Bob, and Carol are running for governor, and David and Ellen are running for senator, the ballot coding file could enable the vector 〈0,1,0;0,1〉 to be recognized as a ballot with votes for Bob as governor and Ellen as senator.  The detailed format of a ballot coding file will not be specified in this document.  But the contents of this file are hashed together with the prime modulus (p), subgroup order (q), generator (g), number of trustees (n), decryption threshold value (k), date, and jurisdictional information to form a base hash code (Q) which will be incorporated into every subsequent hash computation in the election.

### Overview of key generation
The n trustees of an election are denoted by T_1,T_2,…,T_n.  Each trustee T_i generates an independent ElGamal public-private key pair by generating a random integer secret s_i∈Z_q and forming the public key K_i=g^(s_i )  mod p.  Each of these public keys will be published in the election record together with a non-interactive zero-knowledge Schnorr proof of knowledge of possession of the associated private key.  
The joint election public key will be
K=∏_(i=1)^n▒K_i   mod p.
To enable robustness and allow for the possibility of missing trustees at the conclusion of an election, we require trustees to share their private keys amongst themselves to enable decryption by any k trustees.  This sharing must be verifiable, so that receiving trustees can confirm that the shares they receive are meaningful; and the process must allow for decryption without explicitly reconstructing private keys of missing trustees.
Each trustee T_i generates k-1 random polynomial coefficients a_(i,j) such that 0<j<k and 0<a_(i,j)<q and forms the polynomial
P_i (x)=∑_(j=0)^(k-1)▒〖a_(i,j) x^j 〗 mod q
by setting a_(i,0) equal to its secret value s_i.  Trustee T_i then publishes commitments K_(i,j)=g^(a_(i,j) )  mod p to each of its random polynomial coefficients.  As with the primary secret keys, each trustee should provide a Schnorr proof of knowledge of the secret coefficient value a_(ij,) associated with each published commitment K_(i,j).  Since polynomial coefficients will be generated and managed in precisely the same fashion as secret keys, they will be treated together in a single step below.
At the conclusion of the election, individual encrypted ballots will be homomorphically combined into a single encrypted aggregate ballot – consisting of an encryption of the tally for each option offered to voters.  Each trustee will use its secret key to generate a partial decryption of each encrypted tally value, and these partial decryptions will be combined into full decryptions.  If any election trustees are missing during tallying, any set of k trustees who are available can cooperate to reconstruct the missing partial decryption.
All spoiled ballots are individually decrypted in precisely the same fashion.
### Details of key generation
Each trustee T_i in an election with a decryption threshold of k generates k polynomial coefficients a_(i,j) such that 0≤j<k and 0≤a_(i,j)<q and forms the polynomial
P_i (x)=∑_(j=0)^(k-1)▒〖a_(i,j) x^j 〗 mod q.
Trustee T_i then publishes commitments K_(i,j)=g^(a_(i,j) )  mod p for each of its random polynomial coefficients.  The constant term a_(i,0) of this polynomial will serve as the private key for trustee T_i, and for convenience we denote s_i=a_(i,0), and its commitment K_(i,0) will serve as the public key for trustee T_i and will also be denoted as K_i=K_(i,0).
In order to prove possession of the coefficient associated with each public commitment, for each K_(i,j) with 0≤j<k, trustee T_i generates a Schnorr proof of knowledge for each of its coefficients as follows.
This Non-Interactive Zero-Knowledge (NIZK) proof proceeds as follows.
NIZK Proof by Trustee T_i of its knowledge of secrets a_(i,j) such that K_(i,j)=g^(a_(i,j) )  mod p
Trustee T_i generates random integer values R_(i,j) in the range 0≤r_(i,j)<q and computes h_(i,j)=g^(R_(i,j) )  mod p for each 0≤j<k.  Using the hash function SHA-256 (as defined in NIST PUB FIPS 180-4 ), trustee T_i then performs a single hash computation c_i=H(Q,K_(i,0),K_(i,1),K_(i,2),…,K_(i,k-1),h_(i,0),h_(i,1),h_(i,2),…h_(i,k-1) )  mod q and publishes the values K_(i,j), h_(i,j), c_i, and u_(i,j)=(R_(i,j)+c_i a_(i,j) )  mod q.
An election verifier should confirm both the hash computation of c_i and each of the g^(u_(i,j) )  mod p=h_(i,j) K_(i,j)^(c_i )  mod p equations.
It is worth noting here that for any fixed constant α, the value g^(P_i (α) )  mod p can be computed entirely from the published commitments as
g^(P_i (α) )=g^(∑_(j=0)^(k-1)▒a_(i,j)  α^j )  mod p=∏_(j=0)^(k-1)▒g^(a_(i,j) α^j )   mod p=∏_(j=0)^(k-1)▒(g^(a_(i,j) ) )^(α^j )   mod p=∏_(j=0)^(k-1)▒K_(i,j)^(α^j )   mod p.

> Although this formula includes double exponentiation – raising a given value to the power α^j –in what follows, α and j will always be small values (bounded by n).

To share secret values, each trustee T_i sends to each other trustee T_l the value P_i (l) via a private channel  using T_l’s published public key K_l.  Specifically, T_i sends the value P_i (l) to T_l by selecting a random value r_(i,l) such that 0≤r_(i,l)<q and sending the pair (A,B)=(g^(r_(i,l) )  mod p,P_i (l) K_l^(r_(i,l) )  mod p).  The recipient can decrypt the received pair as P_i (l)=B/A^(r_(i,l) )   mod p.  This encryption should be published and visible to all trustees – not just the receiving trustee T_l.  The recipient T_l can now check the validity of each received share P_i (l) by verifying against the commitments made by T_i to its coefficients K_(i,0),K_(i,1),…,K_(i,k-1) by confirming the following equation holds:
g^(P_i (l) )  mod p=∏_(j=0)^(k-1)▒(K_(i,j) )^(l^j )  mod p.
Trustees should report having confirmed this computation.  If the recipient trustee T_l reports not receiving a suitable value P_i (l), it becomes incumbent on the sending trustee T_i to publish this P_i (l) together with the nonce r_(i,l) it used to encrypt P_i (l) under the public key K_l of recipient trustee T_l.  If trustee T_i fails to produce a suitable P_i (l) and nonce r_(i,l) that match both the published encryption and the above equation, it should be excluded from the election and the key generation process should be restarted with an alternate trustee.  If, however, the published P_i (l) and R_(i,l) satisfy both the published encryption and the equation above, the receiving trustee T_l should be excluded from the election and the key generation process should be restarted with an alternate trustee.
Once the election parameters have been produced and confirmed, all of the public commitments K_(i,j) are hashed together with the base hash Q to form an extended base hash Q ̅ that will form the basis of subsequent hash computations.  The hash function SHA-256 will be used here and for all hash computations for the remainder of this document.
## Ballot Encryption
A message M can be encrypted using the ElGamal public key K by selecting a random value R such that 0≤R<q and forming the pair (g^R  mod p,M⋅K^R  mod p).  An ElectionGuard ballot is comprised entirely of encryptions of one (indicating selection made) and zero (indicating selection not made).  To enable homomorphic addition (for tallying), these values are exponentiated during encryption.  Specifically, to encrypt a ballot entry, a random value R is selected such that 0≤R<q, and the following computation is performed.
- Zero (not selected) is encrypted as (g^R  mod p,K^R  mod p).  
- One (selected) is encrypted as (g^R  mod p,g⋅K^R  mod p).

Note that if multiple encrypted votes (g^(R_i )  mod p,g^(v_i )⋅K^(R_i )  mod p) are formed, their component-wise product (g^∑_i▒R_i   mod p,g^∑_i▒v_i ⋅K^∑_i▒R_i   mod p) serves as an encryption of ∑_i▒v_i  – which is the tally of those votes.     

A contest in an election consists of a set of options together with a selection limit that indicates the number of selections that are allowed to be made in that contest.  In most elections, most contests have a selection limit of one.  However, a larger selection limit (e.g. select up to three) is not uncommon.  Approval voting can be achieved by setting the selection limit to the total number of options in a contest. Ranked choice voting is not supported in this version of ElectionGuard.   Also, write-ins are assumed to be explicitly registered or allowed to be lumped into a single “write-ins” category for the purpose of verifiable tallying.  Verifiable tallying of free-form write-ins is also best done with a MixNet.
A legitimate vote in a contest consists of a set of selections with cardinality not exceeding the selection limit of that contest.  To accommodate legitimate undervotes, the internal representation of a contest is augmented with “dummy” options equal in number to the selection limit.  Dummy options are selected as necessary to force the total number of selections made in a contest to be equal to the selection limit.  When the selection limit is one, for example, the single dummy option can be thought of as a “none of the above” option.  With larger selection limits, the number of dummy options selected corresponds to the number of additional options that a voter could have selected in a contest.

> For efficiency, the dummy options could be eliminated in an approval vote.  However, to simplify the construction of election verifiers, we presume that dummy options are always present – even for approval votes.

Two things must now be proven about the encryption of each vote.
1 The encryption associated with each option is either an encryption of zero or an encryption of one.
1 The sum of all encrypted values in a contest is equal to the selection limit for that contest (usually one).

The use of ElGamal encryption enables efficient zero-knowledge proofs of these requirements, and the Fiat-Shamir heuristic can be used to make these proofs non-interactive.  Chaum-Pedersen proofs are used to demonstrate that an encryption is that of a specified value, and these are combined with the Cramer-Damgård-Schoenmakers  technique to show that an encryption is that of one of a specified set of values – particularly that a value is an encryption of either zero or one.  The set of encryptions of selections in a contest are homomorphically combined, and the result is shown to be an encryption of that contest’s selection limit – again using a Chaum-Pedersen proof.

> Note that the decryption of the selection limit could be more efficiently demonstrated by just releasing the sum of the nonces used for each of the individual encryptions.  But, again to simplify the construction of election verifiers, a Chaum-Pedersen proof is used here as well.

The “random” nonces used for the ElGamal encryption of the ballot nonces should be derived from a single 256-bit master nonce R_B for each ballot.  For each contest listed in the ballot coding file, a contest nonce is derived from the master nonce (R_M) and the contest label (L_C) as R_C=H(L_C,R_B).  For each option listed in the ballot coding file, the nonce used to encrypt that option is derived from the contest nonce (R_C) and the selection label for that option (L_S) as r=H(L_S,R_C).
An encryption of each ballot’s master nonce R_B returned together with the encrypted ballot.  The encryption here would be according to the simple ElGamal protocol rather than the exponential form of ElGamal used to encrypt ballot contents and enable homomorphic addition.  It should also be possible for the system to specify an alternate public key to be used for the encryption of master nonces.
Ballot nonces may be independent across different ballots, and only the nonces used to encrypt ballot selections need to be derived from the master nonce.  The use of a single master nonce for each ballot allows the entire ballot encryption to be re-derived from the contents of a ballot and the master nonce.  It also allows the encrypted ballot to be fully decrypted with the single master nonce.
### Outline for proofs of ballot correctness		
To prove that an ElGamal encryption pair (α,β) is an encryption of zero, the Chaum-Pedersen protocol proceeds as follows.
NIZK Proof that (α,β) is an encryption of zero (given knowledge of encryption nonce R)
The prover selects a random value u in the range 0≤u<q and commits to the pair (a,b)=(g^u  mod p,K^u  mod p).  A hash computation is then performed (using the Fiat-Shamir heuristic) to create a pseudo-random challenge value c=H(Q ̅,(α,β),(a,b)), and the prover responds with v=(u+cR)  mod q.  A verifier can now confirm the claim by checking that both g^v  mod p=a⋅α^c  mod p and K^v  mod p=b⋅β^c  mod p are true.
NIZK Proof that (α,β) is an encryption of one (given knowledge of encryption nonce R)
To prove that (α,β) is an encryption of one, β/g  mod p is substituted for β in the above.  The verifier can be relieved of the need to perform a modular division by computing βg ̅  mod p rather than β/g  mod p.  As an alternative, the verifier can confirm that 〖g^c⋅K〗^v  mod p=b⋅β^c  mod p instead of K^v  mod p=b⋅(β/g)^c  mod p.
As with many zero-knowledge protocols, if the prover knows a challenge value prior to making its commitment, it can create a false proof.  For example, if a challenge c is known to be forthcoming, a prover can generate a random v in the range 0≤v<q and commit to (a,b)=(g^v/α^c   mod p,K^v/β^c   mod p)=(g^v α^(q-c)  mod p,K^v β^(q-c)  mod p).  This selection will satisfy the required checks for (α,β) to appear as an encryption of zero regardless of the values of (α,β).  Similarly, setting (a,b)=(g^v/α^c   mod p,(K^v g^c)/β^c   mod p)=(g^v α^(q-c)  mod p,K^v g^c β^(q-c)  mod p) will satisfy the required checks for (α,β) to appear as an encryption of one regardless of the values of (α,β).  This quirk is what enables the Cramer-Damgård-Schoenmakers technique to prove a disjunction of two predicates.
Sketch of NIZK Proof that (α,β) is an encryption of zero or one
After the prover makes commitments (a_0,b_0 ) and (a_1,b_1 ) to the respective assertions that (α,β) is an encryption of zero and (α,β) is an encryption of one, a single challenge value c is selected by hashing all commitments and election parameters.  The prover must then provide challenge values c_0 and c_1 such that c=c_0+c_1  mod q.  Since the prover has complete freedom to choose one of c_0 and c_1, the prover can fix one value in advance – either c_0 if (α,β) is actually an encryption of one or c_1 if (α,β) is actually an encryption of zero.  In response to the resulting challenge c, the prover uses this freedom to answer its faux claim with its chosen challenge value and then uses the remaining challenge value (as forced by the constraint that c=c_0+c_1  mod q) to demonstrate the truth of the other claim.  An observer can see that one of the two claims must be true but cannot tell which.
### Details for proofs of ballot correctness
The full protocol proceeds as follows – fully divided into the two cases.
To encrypt an “unselected” option on a ballot, a random nonce r is selected uniformly from the range 0≤R<q and an encryption of zero is formed as (α,β)=(g^R  mod p,K^R  mod p).
NIZK Proof that (α,β) is an encryption of zero or one (given knowledge of encryption nonce R for which (α,β) is an encryption of zero)
To create the proof that (α,β) is an encryption of a zero or a one, randomly select c_1, v_1, and u_0 and form the commitments 
(a_0,b_0 )=(g^(u_0 )  mod p,K^(u_0 )  mod p)
and 
(a_1,b_1 )=(g^(v_1 )/α^(c_1 )   mod p,(K^(v_1 ) g^(c_1 ))/β^(c_1 )   mod p)=(g^(v_1 ) α^(q-c_1 )  mod p,K^(v_1 ) g^(c_1 ) β^(q-c_1 )  mod p).
A challenge value c is formed by hashing the extended base hash Q ̅ together with (α,β), (a_0,b_0 ), and (a_1,b_1 ) to form a challenge value c=H(Q ̅,(α,β),(a_0,b_0 ),(a_1,b_1 )).  The proof is completed by forming c_0=(c-c_1 )  mod q and v_0=(u_0+c_0⋅R mod q) and answering the challenge by returning c_0, c_1, v_0, and v_1.
To encrypt a “selected” option on a ballot, a random nonce R is selected uniformly from the range 0≤r<q and an encryption of one is formed as (α,β)=(g^r  mod p,〖g⋅K〗^r  mod p).
NIZK Proof that (α,β) is an encryption of zero or one (given knowledge of encryption nonce R for which (α,β) is an encryption of one)
To create the proof that (α,β) is an encryption of a zero or a one, randomly select c_0, v_0, and u_1 and form the commitments 
(a_0,b_0 )=(g^(v_0 )/α^(c_0 )   mod p,K^(v_0 )/β^(c_0 )   mod p)=(g^(v_0 ) α^(q-c_0 )  mod p,K^(v_0 ) β^(q-c_0 )  mod p)
and
(a_1,b_1 )=(g^(u_1 )  mod p,K^(u_1 )  mod p).
A challenge value c is formed by hashing the extended base hash Q ̅ together with (α,β), (a_0,b_0 ), and (a_1,b_1 ) to form a challenge value c=H(Q ̅,(α,β),(a_0,b_0 ),(a_1,b_1 )).  The proof is completed by forming c_1=(c-c_0 )  mod q and v_1=(u_1+c_1⋅R mod q) and answering the challenge by returning c_0, c_1, v_0, and v_1.
In either of the two above cases, what is published in the election record is the encryption (α,β) together with the commitments (a_0,b_0 ) and (a_1,b_1 ) which are all hashed together with the election’s extended base hash to form the challenge value c which is published together with values c_0, c_1, v_0, and v_1.

> **An election verifier must confirm the following for each possible selection on a ballot.**
> * The given values α, β, a_0, b_0, a_1, and b_1 are all in the set Z_p^r.  (A value x is in Z_p^r if and only if x is an integer such that 0≤x<p and x^q  mod p=1 is satisfied.)
> * The challenge c is correctly computed as c=H(Q ̅,(α,β),(a_0,b_0 ),(a_1,b_1 )).
> * The given values c_0, c_1, v_0, and v_1 are each in the set Z_q.  (A value x is in Z_q if and only if x is an integer such that 0≤x<q.)
> * The equation c=c_0+c_1  mod q is satisfied.
> * The equations g^(v_0 )=a_0 α^(c_0 )  mod p, g^(v_1 )=a_1 α^(c_1 )  mod p, K^(v_0 )=b_0 β^(c_0 )  mod p, and g^(c_1 ) K^(v_1 )=b_1 β^(c_1 )  mod p are all satisfied.**
	
### Proof of satisfying the selection limit
The final step in proving that a ballot is well-formed is demonstrating that the selection limits for each contest have not been exceeded.  This is accomplished by homomorphically combining all of the (α_i,β_i ) values for a contest by forming (A,B)=(∏_i▒〖α_i  mod p〗,∏_i▒〖β_i  mod p〗) and proving that (A,B) is an encryption of the total number of votes allowed for that contest (usually one).  The simplest way to complete this proof is to combine all of the random nonces R_i that were used to form each (α_i,β_i )=(g^(R_i )  mod p,K^(R_i )  mod p) or (α_i,β_i )=(g^(R_i )  mod p,〖g⋅K〗^(R_i )  mod p) – depending on whether the value encrypted is zero or one.  The product will be (A,B)=(∏_i▒〖α_i  mod p〗,∏_i▒〖β_i  mod p〗)=(g^(∑_i▒R_i   mod(p-1) )  mod p,g^L K^(∑_i▒R_i   mod(p-1) )  mod p) – where L is the selection limit for the contest.  (Recall that L extra “dummy” positions will be added to each contest and set to one as necessary to ensure that exactly L selections are made for the contest.)
#### NIZK Proof that (A,B) is an encryption of L (given knowledge of aggregate encryption nonce R)
An additional Chaum-Pedersen proof of (A,B) being an encryption of L is performed by selecting a random U in the range 0≤U<q, publishing (a,b)=(α^U  mod p,β^U  mod p), hashing these values together with election’s extended base hash Q ̅ to form a pseudo-random challenge C=H(Q ̅,(A,B),(a,b)), and responding by publishing V=(U+CR)  mod q. 
Note that all of the above proofs can be performed directly by the entity performing the public key encryption of a ballot without access to the decryption key(s).  All that is required is the nonces used for the encryptions.

> **An election verifier must confirm the following for each contest on the ballot.**
> * The number of dummy positions matches the contest’s selection limit L.
> * The contest total (A,B) satisfies A=∏_i▒α_i  mod p and B=∏_i▒β_i  mod p where the (α_i,β_i ) represent all possible selections (including dummy selections) for the contest.
> * The given value V is in Z_q.
> * The given values a and b are each in Z_p^r.
> * The challenge value C is correctly computed as C=H(Q ̅,(A,B),(a,b)).
> * The equations g^V=aA^C  mod p and 〖g^L K〗^v=bB^C  mod p are satisfied.**
	
### Tracking codes
Upon completion of the encryption of each ballot, a tracking code is prepared for each voter.  The code is a running hash that begins with the extended base hash code Q ̅ and includes an identifier for the voting device, the location of the voting device, the date and time that the ballot was encrypted, and, of course, the encryption of the ballot itself.  The hash (H) used for this purpose is SHA-256.  The tracking code is formed as follows.  H_0=H(Q ̅) where  Q ̅ is the extended base hash code of the election.  For ballot with index i>0, H_i=H(H_(i-1),D,T,B_i) where D consists of the voting device information described above, T is the date and time of ballot encryption, and B_i is an ordered list of the individual encryptions on the ballot – with the ordering as specified by the ballot coding file.  At the conclusion of a voting period (this may be the end of a day in a multi-day election), the hash chain is closed by computing  H ̅=H(H_l,"CLOSE\""), where H_l is the final tracking code produced by that device during that voting period.  The close of the hash chain can be computed either by the voting device or subsequently by election administrators, and it is published as part of the election record.

> **An election verifier must confirm that each of the values in the running hash is correctly computed.  Specifically, an election verifier must confirm each of the following.**
> * The equation H_0=H(Q ̅) is satisfied.
> * For each ballot B_i, H_i=H(H_(i-1),D,T,B_i) is satisfied.
> * The closing hash H ̅=H(H_l,"CLOSE\"") is correctly computed from the final tracking code H_l.

Once in possession of a tracking code (and never before), a voter is afforded an option to either cast the associated ballot or spoil it and restart the ballot preparation process.  The precise mechanism for voters to make these selections may vary depending upon the instantiation, but this choice would ordinarily be made immediately after a voter is presented with the tracking code, and the status of the ballot would be undetermined until the decision is made.  It is possible, for instance, for a voter to make the decision directly on the voting device, or a voter may instead be afforded an option to deposit the ballot in a receptacle or to take it to a poll worker to be spoiled.
## Verifiable Decryption
At the conclusion of voting, all of the ballot encryptions are published in the election record together with the proofs that the ballots are well-formed.  Additionally, all of the encryptions of each option are homomorphically combined to form an encryption of the total number of times that option was selected.  The encryptions (α_i,β_i ) of each individual option are combined by forming the product (A,B)=(∏_i▒〖α_i  mod p〗,∏_i▒〖β_i  mod p〗).  This aggregate encryption (A,B), which represents an encryption of the tally of that option, is published in the election record for each option.
To decrypt an aggregate encryption (A,B), each available election trustee T_i computes its share of the decryption as
M_i=A^(s_i )  mod p.
Each trustee T_i also publishes a Chaum-Pedersen proof of the correctness of M_i as follows.
NIZK Proof by Trustee T_i of knowledge of s_i∈Z_p^r for which both M_i=A^(s_i )  mod p and K_i=g^(s_i )  mod p 
Trustee T_i selects a random value u_i in the range 0≤u_i<q and commits to the pair (a_i,b_i )=(g^(u_i )  mod p,A^(u_i )  mod p).  The values (A,B), (a_i,b_i ), and M_i are hashed together with the extended base hash value Q ̅ to form a challenge value c_i=H(Q ̅,(A,B),(a_i,b_i ),M_i ), and trustee T_i responds with v_i=(u_i+c_i s_i )  mod q.

> **An election verifier must confirm for each (non-dummy) option in each contest in the ballot coding file that the aggregate encryption (A,B) satisfies A=∏_j▒α_j  and B=∏_j▒β_j  where the (α_j,β_j ) are the corresponding encryptions on all cast ballots in the election record.**
> **An election verifier must then confirm for each (non-dummy) option in each contest in the ballot coding file the following for each decrypting trustee T_i.**
> * The given value v_i is in the set Z_q.
> * The given values a_i and b_i are both in the set Z_q^r.
> * The challenge value c_i satisfies c_i=H(Q ̅,(A,B),(a_i,b_i ),M_i ).
> * The equations g^(v_i )=a_i K_i^(c_i )  mod p and A^(v_i )=b_i 〖M_i〗^(c_i )  mod p are satisfied.**
	
### Decryption when all trustees are present
If all trustees are present and have posted suitable proofs, the next step is to publish the value
M=B⁄((∏_(i=1)^n▒M_i ) )  mod p.
This M has the property that M=g^t  mod p where t is the tally of the associated option.
In general, computation of this tally value t is computationally intractable.  However, in this application, t is relatively small – bounded by the number of votes cast.  Election administrators can determine this tally value t from M by exhaustive search, by precomputing a table of all possible M values in the allowable range and then performing a single look-up, or by a combination in which some exponentiations are precomputed and a small search is used to find the value of t (e.g., a partial table consisting of g^100  mod p, g^200  mod p, g^300  mod p, … is precomputed and the value M is repeatedly divided by g until a value is found that is in the partial table).  The value t is published in the election record, and verifiers should check both that M=g^t  mod p and that B= (M⋅∏_(i=1)^n▒M_i )  mod p.
### Decryption with missing trustees
If one or more of the election trustees are not available for decryption, any k available trustees can use the information they have to reconstruct the partial decryptions for missing trustees as follows.
If trustee T_i is missing during decryption, each of at least k available trustees T_l should use its share P_i (l) of the secret value s_i previously shared by T_i to compute a share of the missing partial decryption M_i in the same way that it used its own secret s_l.  Specifically, trustee T_l publishes partial decryption share
M_(i,l)=A^(P_i (l))  mod p.
Trustee T_l also publishes a Chaum-Pedersen proof of the correctness of M_(i,l) as follows.
NIZK Proof by Trustee T_l of knowledge of s_(i,l)∈Z_p^r for which both M_(i,l)=A^(s_(i,l) )  mod p and g^(s_i )  mod p=∏_(j=0)^(k-1)▒K_(i,j)^(l^j )   mod p 
Trustee T_l selects a random value u_(i,l) in the range 0≤u_(i,l)<q and commits to the pair (a_(i,l),b_(i,l) )=(g^(u_(i,l) )  mod p,A^(u_(i,l) )  mod p).  The values (A,B), (a_(i,l),b_(i,l) ), and M_(i,l) are hashed together with the extended base hash value Q ̅ to form a challenge value c_(i,l)=H(Q ̅,(A,B),(a_(i,l),b_(i,l) ),M_(i,l) ), and trustee T_l responds with v_(i,l)=(u_(i,l)+c_(i,l) P_i (l))  mod q.
It is important to note here that although the value P_i (l) is known to both the missing trustee T_i and the trustee T_l, it is not published or generally known.  However, the value g^(P_i (l))  mod p can be computed from public values as
g^(P_i (l) )  mod p=∏_(j=0)^(k-1)▒K_(i,j)^(l^j )   mod p.

> **An election verifier must confirm for each (non-dummy) option in each contest in the ballot coding file the following for each missing trustee T_i and for each surrogate trustee T_l.**
> * The given value v_(i,l) is in the set Z_q.
> * The given values a_(i,l) and b_(i,l) are both in the set Z_q^r.
> * The challenge value c_(i,l) satisfies c_(i,l)=H(Q ̅,(A,B),(a_(i,l),b_(i,l) ),M_(i,l) ).
> * The equations g^(v_i,l)=a_(i,l)⋅(g^(P_i (l) ) )^(c_(i,l) )  mod p and A^(v_(i,l) )=b_(i,l) 〖M_(i,l)〗^(c_(i,l) )  mod p are satisfied.

The final step to reconstruct a missing partial decryption M_i is to compute Lagrange coefficients for a set of k available trustees {T_l:l∈U} with |U|=k as
w_l=((∏_(j∈(U-{l}))▒j))/((∏_(j∈(U-{l}))▒(j-l) ) ) mod q.
An election verifier should confirm that for each trustee T_l serving to help compute a missing share of a tally, that its Lagrange coefficient w_l is correctly computed by confirming the equation (∏_(j∈(U-{l}))▒j)  mod q=w_l⋅(∏_(j∈(U-{l}))▒(j-l) )  mod q.
An election verifier should then confirm the correct missing tally share for each (non-dummy) option in each contest in the ballot coding file for each missing trustee T_i as M_i=∏_(l∈U)▒(M_(i,l) )^(w_l )  mod p.
Note that the missing secret s_i could be computed directly as s_i=∑_(l∈U)▒〖w_l P_i (l)  mod q〗.  However, it is preferable to not release the missing secret and instead only release the partial decryption that the missing secret would have produced.  This prevents the missing secret s_i from being used for additional decryptions without the cooperation of at least k trustees.
As an example, consider an election with five trustees and a threshold of three.  If two trustees are missing at the time of decryption, the remaining three can perform any required decryptions by constructing missing partial descriptions as described in the text above.  If, instead, they take the shortcut of simply reconstructing and then using the two missing secrets; then any of the three could, at a later time, use its own secret together with the two reconstructed secrets to perform additional decryptions without cooperation of any other trustees.
The final step is to verify the tallies themselves.
An election verifier should confirm the following equations for each (non-dummy) option in each contest in the ballot coding file.
	B=M⋅(∏_(i=1)^n▒M_i )  mod p.
	M=g^t  mod p.
An election verifier should also confirm that the text labels listed in the election record match the corresponding text labels in the ballot coding file.
Decryption of spoiled ballots
Every ballot spoiled in an election is individually verifiably decrypted in exactly the same way that the aggregate ballot of tallies is decrypted.  Election verifiers should confirm all such decryptions so that casual observers can simply view the decryptions and confirm that they match their expectations.
An election verifier should confirm the correct decryption of each spoiled ballot using the same process that was used to confirm the election tallies.
An election verifier should also confirm that for each decrypted spoiled ballot, the selections listed in text match the corresponding text in the ballot coding file.
## The Election Record
The record of an election should be a full accounting of all of the election artifacts.  Specifically, it should contain the following.
* Date and location of an election
* The ballot coding file
* The election parameters
 * Primes p and q and integer r such that p=qr+1 and r is not a multiple of r
 * A generator g of the order q multiplicative subgroup Z_p^*
 * The multiplicative inverse g ̅ of g modulo p
 * The number n of election trustees
 * The threshold k of trustees required to complete verification
* The base hash value Q computed from the above
* The commitments from each election trustee to each of their polynomial coefficients
* The proofs from each trustee of possession of each of the associated coefficients
* The election public key
* The extended base hash value Q ̅ computed from the above
* Every encrypted ballot prepared in the election (whether cast or spoiled)
 * All of the encrypted options on each ballot (including “dummy” options)
 * The proofs that each such value is an encryption of either zero or one
 * The selection limit for each contest
 * The proof that the number of selections made matches the selection limit
 * The device information for the device that encrypted the ballot
 * The date and time of the ballot encryption
 * The tracker code produced for the ballot
* The decryption of each spoiled ballot
 * The selections made on the ballot
 * The cleartext representation of the selections
 * Partial decryptions by each trustee of each option
 * Proofs of each partial decryption
 * Shares of each missing partial decryption (if any)
 * Proofs of shares of each missing partial decryption
 * Lagrange coefficients used for replacement of any missing partial decryptions
* Tallies of each option in an election
 * The encrypted tally of each option
 * Full decryptions of each encrypted tally
 * Cleartext representations of each tally
 * Partial decryptions by each trustee of each tally
 * Proofs of partial decryption of each tally
 * Shares of each missing partial decryption (if any)
 * Proofs of shares of each missing partial decryption
 * Lagrange coefficients used for replacement of any missing partial decryptions
* Ordered lists of the ballots encrypted by each device
An election record should be digitally signed by election administrators together with the date of the signature.  The entire election record and its digital signature should be published and made available for full download by any interested individuals.  Tools should also be provided for easy look up of tracker codes by voters.
## Applications to end-to-end verifiability and risk-limiting audits
The methods described in this specification can be used to enable either end-to-end (E2E) verifiability or enhanced risk-limiting audits (RLAs).  In both cases, the ballots are individually encrypted and proofs are provided to allow observers to verify that the set of encrypted ballots is consistent with the announced tallies in an election.
In the case of E2E-verifiability, voters are given tracking codes to enable them to confirm that their individual ballots are correctly recorded amongst the set of encrypted ballots.  In the case of RLAs, encrypted ballots are randomly selected and compared against physical ballots to obtain confidence that the physical records match the electronic records.
To support enhanced risk-limiting audits (RLAs), it may be desirable to encrypt the master nonce of each ballot with a simple administrative key rather than the heavyweight election encryption key.  This streamlines the process for decrypting an encrypted ballot that has been selected for audit.  It should be noted that the privacy risks of revealing decrypted ballots are substantially reduced in the RLA case since voters are not given tracking codes that could be used to associate them with individual ballots.  The primary risk is a coercion threat (e.g. via pattern voting) that only manifests if the full set of ballots were to be decrypted.
One appealing RLA instantiation is for ballots to be encrypted with a threshold election encryption key (as should always be the case for E2E-verifiability) but that the master nonce for each ballot is encrypted with a lightweight key (e.g. a simple administrative key) and for this nonce encryption to be printed on the physical ballot.  This allows an RLA to proceed by randomly selecting an encrypted ballot, fetching the associated physical ballot, extracting the nonce from its encryption on the physical ballot, using the nonce to decrypt the electronic record, and then comparing the physical ballot contents with those of the electronic record.  A malicious actor with an administrative decryption key would need to go to each individual physical ballot to obtain the nonces necessary to decrypt all of the encrypted ballots, and the access to do so would enable this malicious actor to obtain all of the open ballots without necessitating the administrative decryption key.
If E2E-verifiability and enhanced RLAs are both provided in the same election, there must be separate ballot encryptions (ideally, but not necessary, using separate election encryption keys) of each ballot.  The E2E-verifiable data set must be distinguished from the enhanced RLA data set.  Using the same data set for both applications would compromise voter privacy for voters whose ballots are selected for auditing.
## Acknowledgements
The author is happy to thank Joey Dodds, Aleks Essex, Luke Myers, Vanessa Teague, Aaron Tomb, Daniel Wagner, Jake Waksbaum, and especially Greg Zaverucha for many helpful comments and suggestions on earlier versions of this specification.

<a name="footnote1">1</a>[A Public Key Cryptosystem and a Signature Scheme based on Discrete Logarithms](https://link.springer.com/content/pdf/10.1007/3-540-39568-7_2.pdf)
