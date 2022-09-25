This is a template implementation for a bi-temporal storage using MongoDB. 

The general idea it so use _event sourcing_ on a document level. There is one document for each business object. This document contains all the versions of the business object. Each version is tagged with the ingestion_time and the event_time in order to create bi-temporality. 

Unimplemented
===
Queries will be implemented with 2 database queries, first find all matching versions and then see if matching versions are actually the version in bi-temp land. 

**Should be possible to do this in the aggregation pipeline.**