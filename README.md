***vAlpha 0.1***
PLEASE TEST, BREAK, GIVE FEEDBACK, AND BUG TEST.


**FIRETEXT** is a Firestore based index table for text based queries and is an experimental concept.
Most use cases, users are not interested in searching for multiple items AND text - these functions are normally independant from each other. such as searching for movie titles, short descriptions, etc.

This is achieved by compressing the string using `SMAZ` text compression which is ideal for short strings that are under 100 characters with an average of 50% compression. Caveats with this compression methods are that numbers do not compress well. Since the focus is on strings, this is a small and most likely unseen problem.

To further optimize the compression, all strings are converted to lower case, and in the future, we will look at removing special characters to speed up text searching, such as `'-|/,.*&` etc. while human readable, only impeede searching against a user input field.
Multi-language is also supported, but they do not compress as well as English.



https://discord.firebase.me/

Firebase Developers

Firebase Me Program