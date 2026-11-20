# PID Provider - Trust Infrastructure interface

The `(pp_inf)` test class covers the interface between the PID Provider and the trust infrastructure: retrieving the Wallet Provider list of trusted entities `TL-WP`, honouring its updates and its `NextUpdate`, and signing only with keys certified under the anchors that `TL-PID` publishes for the Provider.
