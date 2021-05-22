import * as functions from "firebase-functions";
import { firestore } from "firebase-admin";
import { compress } from "@remusao/smaz";

function getFieldValue(path: string, data: { [x: string]: any }) {
  return compress(
    (
      // "path.to.field" -> ["path", "to", "field"] -> Value
      // TODO: check for string value or reject
      // TODO: Impliment wild cards
      path.split(".").reduce((o, i) => o[i], data) as unknown as string
    ).toLowerCase()
  );
}
// const SoftReset = (
//   collectionPath: string,
//   pathToField: string,
//   authCallback: (arg0: any,arg1: functions.https.CallableContext) => Promise<boolean>,
//   runtimeOpts?: functions.RuntimeOptions
// ) => {
//   // add trigger to resume if timeout?
//   // FIXME: Need to soft merge the index so only new entries are added/recalculated
//   functions
//     .runWith({
//       timeoutSeconds: runtimeOpts?.timeoutSeconds || 590,
//       memory: runtimeOpts?.memory || "8GB",
//     })
//     .https.onCall((data, context) => {
//       return new Promise(async (resolve, reject) => {
//         const verified =(await authCallback( data, context).catch((err) => err)) || false;
//         if (verified) resolve("Processing Request");
//         else return reject("Invalid Auth");

//         firestore()
//           .collection(collectionPath)
//           .get()
//           .then((Snapshot) => {
//             const result: string[] = [];
//             Snapshot.forEach((doc) => {
//               result.push(
//                 [getFieldValue(pathToField, doc.data()), doc.id].join(":")
//               );
//             });

//             firestore()
//               .collection("textIndex")
//               .doc([collectionPath, pathToField].join(":"))
//               .set({ index: result });
//           });
//       });
//     });
// };

const HardRebuild = (
  collectionPath: string,
  pathToField: string,
  authCallback: (arg0: any,arg1: functions.https.CallableContext) => Promise<boolean>,
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
        const verified =(await authCallback( data, context).catch((err) => err)) || false;
        if (verified) resolve("Processing Request");
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


// FIXME: Break functions into independant files while also referencing getFieldVariables
export default {
  UpdateRecord,
  HardRebuild,
  //SoftReset
};
