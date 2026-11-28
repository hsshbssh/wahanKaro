ab socket ke andr mein pehle node ka server banaunga aur woh aise
1>npm init{package.json file banegi}
2>npm i express socket.io nodemon cors dotenv mongoose

ab chalke wahi kr jaise mern mein krte the 
package ke andr nodemon ki help se dev script likh type mein module kr taaki import export wala syntax use krske aur ek index.js file bana joh ki run hogi

socket.io basically hamara web socket protocol use krta hai
but generally joh hum protocol use krte hai woh hai http protocol aur iss protocol mein hamara one directional communication hota hai mtlb jab humara client request bhejta hai server ko tabhi yaha pr hamara server respond krta hai

but socket io mein hamara bidirectional communication hota hai iska mtlb maanlo client ne server se koi request nahi ki but server ke paas already koi data hai joh woh client ko bhej sakta hai toh woh bina client ke request kiye usse bhejdega

toh iski help se hum ye krenge ki jaise hi user hamare website pr aayega waise hi hum uski location ko update krdenge database mein socket.io ki help se aur issi se hume ye bhi pata chl jaayega ki user online hai ya nahi

ab yaha se jaa wahanKaro.md pe

ab jaake index mein packages import kar
ab index ke andr mein meine io ko initialise krdiya hai aur ab hume jaake frontend ke andr iss socket io ka connection banana hoga toh wahan karo mein jaake lib ke andr socket.ts ki file bana

jaake dekh wahanKaro.md mein

ab socket io mein jitni bhi baat hoti hai woh saari events ke through hoti hai
ab event ko ya toh ham send krenge ya toh recieve krenge {isme recieve krne ke liye we use "on" and bhejne ke liye we use "emit"}

jaake dekh index.js mein
ab meine ek connection event banaliya hai

jaa wapis wahanKaro.md mein

ab humne mongo db toh connect kra hi liya hai index mein aur ab hume apni socket id ko database mein store karana hai

toh sabse pehle socket server mein models folder mein user.model.js bana aur poora copy paste karde user model ko

ab meine isOnline aur socket id ko update krdiya hai database mein aur ye aise kiya meine

sabse pehele geoUpdater ke andr userId leke aaya page.tsx se uske baad geoUpdater se emit kiya identity event joh ki leke jaarha tha userId aur firr index .js mein jaake listen kiya aur uss userid ki help se database mein uss user ko find kiya aur uski socketId aur isOnline update krdiya

ab hum chahte hai ki jab hum disconnect ho tab bhi hum ek event listen kare ussi index.js mein jisse humare db mein se inOnline false hojaaye aur socket id null hojaaye
jaake dekh index.js

ab jaa geoUpdater mein aur ek aur event emit kar jisse location update hogi aur fir aake index.js mein listen kario

ab humne ye bhi krlia hai aur iska use ye hoga ki hum inn location ke coords ki wajah se apne nearby vehicle find krskte hai
ab jaa wahanKaro.md pe

//REAL-TIME MAP TRACKING
ab humne joh event emit kiya tha partner ke active ride page se usse iss created room mein listen krenge aur jitni bhi details partner uss emitted event se bhej raha tha usse hum iss room mein listen krke user ko bhej denge

ab jaa wapis wahanKaro.md pe
