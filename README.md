
//In your cloud functions, you must export the onUpdate trigger so Functions is able to capture it
export.updateMyTextSearch = FireText.UpdateRecord(collectionPath: string, pathToField: string)
// CollectionPath is the string path from the root of your collection to the collection of documents you want to monitor
// PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"

// Currently Collection Groups are not supported, multiple fields with wild cards are not supported "posts.{id}.title"


//In your cloud functions, you must export the onUpdate trigger so Functions is able to capture it
export.HardResetIndex = FireText.ForceReset(
  collectionPath: string,
  pathToField: string,
  dataCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  contextCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  runtimeOpts?: functions.RuntimeOptions)
// CollectionPath is the string path from the root of your collection to the collection of documents you want to monitor
// PathToField is a string path that is the field name to the value you want to monitor using dot notation "posts.title"
// DataCallback is a callback where you can debug the payload from the user, say if you have password projection, etc
// ContextCallback is a callback with all the standard context parameters from onCall, allowing you to verify the user is valid
// Runtime Opts allows you to configure the runtime operations, these are by default, maxed out to 560 seconds and 8GB 
// to help with large collections

// All callbacks require the return value to be true, throw an error or return false will reject the function.
// both Callback methods will be bundled in the same method so you can test them together. I just forgot about it until now.
// Currently there is no way to prevent overwriting any updates that may be queued while this process is working
// Also, the process is limited to one document per field at the moment.
// I would like to look into Batching the requests and paginating them as well as a timeout callback.