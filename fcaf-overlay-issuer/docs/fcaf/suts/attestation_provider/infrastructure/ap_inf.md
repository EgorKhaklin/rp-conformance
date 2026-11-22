# Attestation Provider - Trust Infrastructure interface

The `(ap_inf)` test class covers the interface between the Attestation Provider and the trust infrastructure: retrieving the Wallet Provider list of trusted entities `TL-WP`, honouring its updates and its `NextUpdate`, and signing only with keys certified under the anchors published for its category: `TL-QEAA` for a QEAA Provider, `TL-PUB` for a PuB-EAA Provider, the rulebook anchor for a non-qualified EAA Provider.
