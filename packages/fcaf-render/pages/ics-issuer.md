# Provider Implementation Conformance Statement (ICS)

This is the Implementation Conformance Statement (ICS) form for PID Providers and Attestation Providers under test. It follows the same approach as the [Wallet ICS](ics.md) and the [Relying Party ICS](ics-rp.md): before testing starts, the implementer answers every item, and test selection compares the `Profile applicability` conditions of each test case with the profiles the answers put the Provider in.

The `Profile applicability` of a test case names the item whose answer selects it. The profile it needs is in the test case's comments, with each variant: for example `P-SD` for a Provider that issues SD-JWT VC, `P-AC` for one that offers the authorization code flow. Items without profiles declare values the test cases use, such as time limits; items marked as deciding `POLICY` expected results declare the behaviour the Provider follows where specifications leave a choice.

An implementation that runs as Providers of several categories (for example a PID Provider and a QEAA Provider) answers the form once per category: each is a Provider of its own, and the test cases of a category (variant `PID`, `Q`, `PB` or `E`) are selected by the answers for that category.

Items with the ID `N/A` are surrogate ICS items that select test cases through the Technology section.
