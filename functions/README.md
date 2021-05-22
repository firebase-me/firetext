***vAlpha 0.1***
PLEASE TEST AND GIVE FEEDBACK

**FIRETEXT** is a Firestore based Index table for text based queries and is an experimental concept
The this is the server side module which creates an index table using an array of strings and smar text compression
This is the Cloud Function module that triggers with onUpdate() 
Simply import or require the module as prefered.
```javascript
import FireText from 'firetext-functions';
const FireText = require('firetext-functions');
```


**All exports are built on Firebase `https.onCall` methods.**

Then you export it with some configuration parameters
```javascript
export.updateMyText = FireText.UpdateRecord("Path/{To}/Collection", "Path.To.Field");
```
We also export a hard reset option which rebuilds your index, this requires a validation check on your behalf, simply return true or false. False is the default.
```javascript
export.RebuildIndex = FireText.ForceReset("Path/{To}/Collection", "Path.To.Field"
 AuthCallback, RuntimeOptions);
 
 const AuthCallback = (data,context) =>{
 if(context.auth.admin)
 return true;
 else  return false;
 };
 
```
  

**Notes**
- CollectionPath accepts all standard path strings that `firestore.collection()` will take
- PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"
- Currently, multiple fields with wild cards are not supported "posts.{id}.title"
- It is unknown if Collection Groups are supported

- AuthCallback (can be any name) is a callback  function that is required to return `true` or `false` to proceed - `false` is the default
- Runtime Opts allows you to configure the runtime operations, by default these are maxed out to 560 seconds and 8GB to help with large collections

Currently there is no way to prevent overwriting any updates that may be queued while this process is working
Also, the process is limited to one document per field at the moment.
I would like to look into Batching the requests and paginating them as well as a timeout callback



https://discord.firebase.me/

Firebase Developers

Firebase Me Program