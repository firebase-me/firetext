***vAlpha 0.1***

**FIRETEXT** is a Firestore based Index table for text queries and is an experimental concept
This is the server side module which creates an index table using an array of strings and `SMAZ` text compression
Each index is in two parts, the compressed string and the document ID with a `:` seperator

To decode this correctly, you will need to uncompress the string, this feature will be in a client based module in the very near future.

In your cloud functions, you must export the onUpdate trigger so Functions is able to capture it

*if you know how to make this an npm package, let me know*

```javascript
import FireText from 'firetext-functions';
```
```javascript
export.updateMyTextSearch = FireText.UpdateRecord(collectionPath: string, pathToField: string)
```

**Notes**
CollectionPath is the string path from the root of your collection to the collection of documents you want to monitor
- PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"

- Currently Collection Groups are not supported, multiple fields with wild cards are not supported "posts.{id}.title"


In your cloud functions, you must export the onUpdate trigger so Functions is able to capture it
```javascript
export.HardResetIndex = FireText.ForceReset(
  collectionPath: string,
  pathToField: string,
  dataCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  contextCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  runtimeOpts?: functions.RuntimeOptions)
```
  
- CollectionPath is the string path from the root of your collection to the collection of documents you want to monitor
- PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"
- DataCallback is a callback where you can debug the payload from the user, say if you have password projection, etc
- ContextCallback is a callback with all the standard context parameters from onCall, allowing you to verify the user is valid
- Runtime Opts allows you to configure the runtime operations, these are by default, maxed out to 560 seconds and 8GB 
to help with large collections

**Notes:**
All callbacks require the return value to be true, throw an error or return false will reject the function.
Both Callback methods will be bundled in the same method so you can test them together. I just forgot about it until now.
Currently there is no way to prevent overwriting any updates that may be queued while this process is working
Also, the process is limited to one document per field at the moment.
I would like to look into Batching the requests and paginating them as well as a timeout callback.


*Also, Hello Puf, notice us!*
