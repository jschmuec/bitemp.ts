This is a sample implementation showing how a document-based database can be extended to bi-temporality.


The general idea it so use _event sourcing_ on a document level. There is one document for each business object. This document contains all the versions of the business object. Each version is tagged with the ingestion_time and the event_time in order to create bi-temporality. When retrieving a document, the correct version can be easily filtered out.

This approach allows to insert a new version anywhere into the timeline without complicated updates to multiple records as this might be necessary in a relational database, where a single retroactive update can invalidate multiple past versions.

Queries are implemented by querying all the versions across all documents, retrieving the correct version of the document and validating that the retrieved version is the version that was life at the given time-point. 

`DEMO.md` is the output from `demo.js` which shows how a version of a document can be overwriten. it can be recreate with 
```
npm run demo
```

There is a similar example that can be found at the [MongoDB Developer Website](https://www.mongodb.com/developer/products/mongodb/how-maintain-multiple-versions-record-mongodb/)

Details
===

The database is represented by a map that stores JSON data elements. This allows to run the code in memory on a developer machine and simplifies it sginficantly. Queries are just simple filters. This can easily be replaced by MongoDB as a data store and query engine.

Limitations
===

Data size:
---
 In order to be able to use the native query language of MongoDB, the versions cannot be compressed into deltas that need to be applied to reconstruct the version. If there is no need/wish to use the native MongoDB query language across values, then deltas can be used to store versions backwards or forwards. In the backwards versioning, each version shows what was changed when the next version is written. A simple non-bi-temp:

 Given an object with version 1:
 ```Javascript
 { given_name : Emily, name : Jones }
 ```
and version 2:
 ```Javascript
 { given_name : Bob, name : Jones }
 ```

The reverse deltas would look like this:

 ```JavaScript
 { 2: { given_name : Bob, name: Jones }, 1: { given_name: Emily } }
 ```

 This means that the latest version is always fully populated and an older version can be re-created by re-instating the values of version 1. 

 This algorithm makes writing new events more complicated but does not affect the write performance as it is still an atomic replace.
