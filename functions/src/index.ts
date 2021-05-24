/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable object-curly-spacing */
/* eslint-disable curly */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import FireText from "@firebase-me/firetext-functions";
// import { compress, decompress } from "@remusao/smaz";

// import lzwcompress from "lzwcompress";
// import * as lzutf8 from "lzutf8";
import * as dot from "dot-wild";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFieldValue(path: string, data: { [x: string]: any }) {
  let value = dot.get(data, path.replace(new RegExp("{.*?}", "g"), "*"));
  if (Array.isArray(value))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value = value.filter((item: any) => typeof item === "string").join(":");
  //   if( typeof value === "string")
  //   TypeError: value.filter is not a function
  //     at getFieldValue (/workspace/lib/index.js:16:19)
  // => ['tsuyoshiwada', 'sampleuser', 'foobarbaz']
  return value ? value.trim().toLowerCase() : null;
  // "path.to.field" -> ["path", "to", "field"] -> Value
  // TODO: check for string value or reject
  // TODO: Impliment wild cards
}
// https://gist.github.com/daniellwdb/a7000d31ec89436f4d4e4cf68ea88f0b

const zip = (input: string) => {
  return input;
};
// const unzip = (input: string) => {
//   return input;
// };

const updateRecord = (collectionPath: string, pathToField: string) => {
  if (admin.apps.length === 0) {
    admin.initializeApp({});
  }
  return functions.firestore
    .document(collectionPath + "/{docID}")
    .onUpdate((change, context) => {
      const oldData = change.before.data();
      const newData = change.after.data();

      const oldValue = getFieldValue(pathToField, oldData);
      const newValue = getFieldValue(pathToField, newData);

      const collectionCompile = collectionPath
        .replace(new RegExp("[/]", "g"), "_")
        .replace(new RegExp("{.*?}", "g"), "*");
      const documentCompile = pathToField
        .replace(new RegExp("[.]", "g"), "_")
        .replace(new RegExp("{.*?}", "g"), "*");
      console.log("Collection Path", collectionCompile);

      if (newData && oldData) {
        // UPDATE
        if (newData != oldData) {
          admin
            .firestore()
            .collection("textIndex")
            .doc([collectionCompile, documentCompile].join(":"))
            .set(
              {
                index: admin.firestore.FieldValue.arrayRemove(
                  [zip(oldValue), context.params.docID].join(":")
                ),
              },
              { merge: true }
            );
        }

        admin
          .firestore()
          .collection("textIndex")
          .doc([collectionCompile, documentCompile].join(":"))
          .set(
            {
              index: admin.firestore.FieldValue.arrayUnion(
                [zip(newValue), context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      } else if (!newData && oldData) {
        // CREATED
        admin
          .firestore()
          .collection("textIndex")
          .doc([collectionCompile, documentCompile].join(":"))
          .set(
            {
              index: admin.firestore.FieldValue.arrayUnion(
                [zip(newValue), context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      } else if (newData && !oldData) {
        // DELETED
        admin
          .firestore()
          .collection("textIndex")
          .doc([collectionCompile, documentCompile].join("/"))
          .set(
            {
              index: admin.firestore.FieldValue.arrayRemove(
                [zip(oldValue), context.params.docID].join(":")
              ),
            },
            { merge: true }
          );
      }
      return;
    });
};
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const hardRebuild = (
  collectionPath: string,
  pathToField: string,
  authCallback: (arg0: any, arg1: functions.https.CallableContext) => Promise<boolean>,
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
        else return reject(new Error("Invalid Auth"));

        admin.firestore()
          .collection(collectionPath)
          .get()
          .then((Snapshot) => {
            const result: string[] = [];
            Snapshot.forEach((doc) => {
              result.push(
                [getFieldValue(pathToField, doc.data()), doc.id].join(":")
              );
            });

            admin.firestore()
              .collection("textIndex")
              .doc([collectionPath, pathToField].join(":"))
              .set({ index: result });
          });
      });
    });
};


export const updateTextSearch = updateRecord("users/{user_id}/posts", "title");
export const updateWildSearch = updateRecord(
  "users/{user_id}/posts",
  "Meta.{name}"
);

// FIXME: Break functions into independant files while also referencing getFieldVariables
export default {
  updateRecord,
  hardRebuild,
  // SoftReset
};
