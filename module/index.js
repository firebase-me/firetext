import firebase from 'firebase';
import {decode} from '@remusao/smaz';

let AppReference;
let IndexTable = {};
let indexSnapshot = [];

const initiate = (preferCache,appName = null) => {
    AppReference = firebase.app(appName || undefined).catch(err => error = err);
    if (error) return error;
    return refresh(preferCache);
}

const refresh = (preferCache) => {
    new Promise((resolve, reject) => {
        const indexRef = AppReference.firestore().collection("textIndex");
        if (!!preferCache)
            indexSnapshot = await indexRef.get({ source: 'cache' }).catch(e => reject(e));
        if (!preferCache || !sourceSnapshot.exists) {
            indexSnapshot = await indexRef.get({ source: 'server' }).catch(e => reject(e));
        }
        decodeData();
        resolve();
    })


}

async function decodeData() {
    // INPUT
    // doc:
    // id: "collectionPath:field.Path"
    // data:{ index: ["encodedString:doc_id"]}
    indexSnapshot.docs.forEach(doc => {
        // let collection = decompress(doc.id.split(':')[0]);
        // let fieldPath = decompress(doc.id.split(':')[1]);
        let collection = doc.id.split(':')[0];
        let fieldPath = doc.id.split(':')[1];
        let indexArray = doc.data().index;

        indexArray.forEach(entry => {
            // let newEntry = {[decode(entry.split(':')[1])]:decode(value.split(':')[0])}
            let newEntry = { id:entry.split(':')[1], value: decode(value.split(':')[0]) }

            if (!IndexTable[collection])
                IndexTable[collection] = {};
            if (!IndexTable[collection][fieldPath])
                IndexTable[collection][fieldPath] = [];

            IndexTable[collection][fieldPath].push(newEntry)
        })
    })
    // OUTPUT
    // index:
    // collectionPath:{ field.Path:[{id:doc_id, value:textValue}]}

}

const find = (collection, fieldPath, query) => {
    let QueryArray = query.toLowerCase().split(new RegExp(' +', 'g')).filter(Boolean)
    return IndexTable[collection][fieldPath].filter(entry => QueryArray.some(v => entry.value.includes(v)))
};

export default { find, initiate }