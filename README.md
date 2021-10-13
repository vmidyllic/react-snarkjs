# React + snarkjs
This is a minimal project to get react (typescript) and snarkjs up and running. The circuit is the example from the readme of https://github.com/iden3/snarkjs.

To install the necessary packages etc, run `yarn install`. 

The circuit-specific files are provided to the react frontend through express. 

To run the example, start the express server in `file-server` and the react application:
```
# Run fileserver:
cd src/file-server
node index.js

# Start react
yarn start
```

The circuit and related files are located in the folder `src/zkproof`. 



# react-native-snark-test-app

# React-snarkjs  project run: 

install node modules

TEMP: only if IOS phone will be used  in ffjavascript module / edit threadman.js file before    tm.concurrency = concurrency; (~line 122) add this piece of code
```
 // for safari browser
 if (concurrency === 0){
	//set default concurrency
	concurrency = 2;
 }
```
Run react-snarkjs file server on port 8000 (folder file-server inside snarkjs)
`node src/file-server/index.js`

Use ngrok on http 8000. Replace file urls in App.tsx (only domain) (`ngrok http 8000`)
```
e.g.
	let wasmFile = "https://a801-89-22-47-19.ngrok.io/files/circuit.wasm";
	let zkeyFile = "https://a801-89-22-47-19.ngrok.io/files/circuit_final.zkey";
	let verificationKey = "https://a801-89-22-47-19.ngrok.io/files/verification_key.json"; 
```
Run react-snark js application on port 3000


# React-native-snark-test-app  project run: 

Use ngrok on http 3000 . Get url of local website (`ngrok http 3000 --region eu`)


Insert this url as web view url 
```
source={{ uri: 'https://461c-89-22-47-19.eu.ngrok.io' }}
```
