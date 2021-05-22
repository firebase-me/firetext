***vAlpha 0.1***
PLEASE TEST AND GIVE FEEDBACK

**FIRETEXT** is a Firestore based Index table for text based queries and is an experimental concept
This is the Client module that triggers with `onUpdate()`

This module depends the Cloud Functions package, please look at https://www.npmjs.com/package/@firebase-me/firetext-functions


Simply import or require the module as prefered.
```javascript
import FireText from 'firetext';
const FireText = require('firetext');
```


**All Methods are built on Firebase Firestore with the `textIndex` Collection.**

Once imported, you will need to initiate the index table, which will process the string queries locally.
```javascript
await FireText.initiate(appName, preferCache);
or
await FireText.initiate(null, false);
or
await FireText.initiate("OtherApp", true);
 
```


To find string's that match your request, simply follow this model.
```javascript
FireText.find("Collection/Path", "Field.Path", "Text to Query");
```

We also export a hard reset option from Cloud Functions which rebuilds your index should something break, this requires a validation on the server side to ensure only authorised users can access this method.
This would be defined in your Cloud Functions Exports, please refer to the Firebase documentation on how to access a `https.onCall` method.
  

**Notes**
- CollectionPath accepts all standard path strings that `firestore.collection()` will take
- PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"
- Currently, multiple fields with wild cards are not supported "posts.{id}.title"
- It is unknown if Collection Groups are supported

**Limitations**
- Currently, a single document is dedicated to each index table, and will bloat based on how much text. 
- The current scope of this project is title and short sentences.



https://discord.firebase.me/

Firebase Developers

Firebase Me Program