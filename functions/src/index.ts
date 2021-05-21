import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";
import { compress } from "@remusao/smaz";

function getFieldValue(path: string, data: { [x: string]: any }) {
  return compress(
    (
      path.split(".").reduce((o, i) => o[i], data) as unknown as string
    ).toLowerCase()
  );
}
const ForceReset = (
  collectionPath: string,
  pathToField: string,
  dataCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  contextCallback: (arg0: functions.https.CallableContext) => Promise<boolean>,
  runtimeOpts?: functions.RuntimeOptions
) => {
  // add trigger to resume if timeout?
  functions
    .runWith({
      timeoutSeconds: runtimeOpts?.timeoutSeconds || 590,
      memory: runtimeOpts?.memory || "8GB",
    })
    .https.onCall((data, context) => {
      return new Promise(async (resolve, reject) => {
        const body = (await dataCallback(data).catch((err) => err)) || false;
        const auth =
          (await contextCallback(context).catch((err) => err)) || false;
        if (auth && body) resolve("Processing Request");
        else return reject("Invalid Auth");

        firestore()
          .collection(collectionPath)
          .get()
          .then((Snapshot) => {
            const result: string[] = [];
            Snapshot.forEach((doc) => {
              result.push(
                [getFieldValue(pathToField, doc.data()), doc.id].join(":")
              );
            });

            firestore()
              .collection("textIndex")
              .doc([collectionPath, pathToField].join(":"))
              .set({ index: result });
          });
      });
    });
};

const UpdateRecord = (collectionPath: string, pathToField: string) => {
  return functions.firestore
    .document(collectionPath + "/{docID}")
    .onUpdate((change, context) => {
      const oldData = change.before.data();
      const newData = change.after.data();

      const oldValue = getFieldValue(pathToField, oldData);
      const newValue = getFieldValue(pathToField, newData);

      if (newData && oldData) {
        // UPDATE
        firestore()
          .collection("textIndex")
          .doc([collectionPath, pathToField].join(":"))
          .set(
            {
              index: firestore.FieldValue.arrayRemove(
                [oldValue, context.params.docID].join(":")
              ),
            },
            { merge: true }
          );

        firestore()
          .collection("textIndex")
          .doc([collectionPath, pathToField].join(":"))
          .set(
            {
              index: firestore.FieldValue.arrayUnion(
                [newValue, context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      } else if (!newData && oldData) {
        // CREATED
        firestore()
          .collection("textIndex")
          .doc([collectionPath, pathToField].join(":"))
          .set(
            {
              index: firestore.FieldValue.arrayUnion(
                [newValue, context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      } else if (newData && !oldData) {
        // DELETED
        firestore()
          .collection("textIndex")
          .doc([collectionPath, pathToField].join(":"))
          .set(
            {
              index: firestore.FieldValue.arrayRemove(
                [oldValue, context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      }
    });
};

export default { UpdateRecord, ForceReset };
