import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import * as	 wc from  "./witness_calculator";
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
const snarkjs = require("snarkjs");
const fastFile =  require("fastfile");



const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
	console.log("make proof started");
	
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
	return { proof, publicSignals };
};

const makeProofOnly = async ( _zkey: string, _wasm: any) => {
	console.log("make proof v2 started");
	const { proof, publicSignals } = await snarkjs.groth16.prove(_zkey,_wasm);
	return { proof, publicSignals };
};

const verifyProof = async (_verificationkey: string, signals: any, proof: any) => {
	const vkey = await fetch(_verificationkey).then(function (res) {
		return res.json();
	});

	const res = await snarkjs.groth16.verify(vkey, signals, proof);
	return res;
};

function App() {
	const [a, setA] = useState("3");
	const [b, setB] = useState("11");

	const [proof, setProof] = useState("");
	const [signals, setSignals] = useState("");
	const [isValid, setIsValid] = useState(undefined);

	let wasmFile = "/files/auth-v2/circuit.wasm";
	let zkeyFile = "/files/auth-v2/circuit_final.zkey";
	let verificationKey = "/files/auth-v2/verification_key.json";

	/*

	// auth-v1 version

	window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
		window['flutter_inappwebview'].callHandler('handlerProofRequest')
		  .then(function(result) {
			// print to the console the data coming
			// from the Flutter side.
			console.log("webview recieved message from flutter:",JSON.stringify(result));
			setProof(JSON.stringify("started"));

			makeProof(result, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
	
			    console.log("make proof finished:");
				console.log({proof:_proof, signals:_signals});
				// 	setProof(JSON.stringify(_proof, null, 2));
				// 	setSignals(JSON.stringify(_signals, null, 2));
				// verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
				// 	setIsValid(_isValid);
				window['flutter_inappwebview']
			  .callHandler('handlerProofResponse', _proof);
				});
			}).catch(err =>{
				console.log("error")
				console.log(err)
			});
	});

	*/


	// auth v2 version
	window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
		window['flutter_inappwebview'].callHandler('handlerProofRequest')
		  .then(function(inputs) {
			// print to the console the data coming
			// from the Flutter side.
			console.log("webview recieved message from flutter:",JSON.stringify(inputs));
			setProof(JSON.stringify("started v2 "));

			fastFile.readExisting(wasmFile).then((fdWasm)=>{
				 fdWasm.read(fdWasm.totalSize).then( wasm =>{
					fdWasm.close();
					wc.default(wasm).then(async witnessCalculator => {
						witnessCalculator.calculateWTNSBin(inputs,0).then(buff =>{
							makeProofOnly(zkeyFile,buff).then(({ proof: _proof, publicSignals: _signals }) =>{
								window['flutter_inappwebview']
								.callHandler('handlerProofResponse', { proof: _proof, publicSignals: _signals });
						});
					})
				})
				 })
			})
	});
});

	const runProofs = () => {

			let proofInput = 
			{
				"BBJAx": "9582165609074695838007712438814613121302719752874385708394134542816240804696",
				"BBJAy": "18271435592817415588213874506882839610978320325722319742324814767882756910515",
				"BBJClaimClaimsTreeRoot": "4648350302718598839424502774166524253703556728225603109003078358379460427828",
				"challenge": "12345",
				"challengeSignatureR8x": "16612725446091862317820229560908560785741846639564668282377389669494210791554",
				"challengeSignatureR8y": "16389928442818324712810234717861061407506363761548062772318825166082227839220",
				"challengeSignatureS": "2734509058284749305743301031511411294322326439393517308790764830820315443120",
				"BBJClaimMtp": [
					"0",
					"0",
					"0",
					"0"
				],
				"BBJClaimRevTreeRoot": "0",
				"BBJClaimRootsTreeRoot": "0",
				"id": "360506537017543098982364518145035624387547643177965411252793105868750389248",
				"state": "12051733342209181702880711377819237050140862582923079913097401558944144010618"
			}

		
			  
		if (window['ReactNativeWebView']){
			alert('message is posted');

			window['ReactNativeWebView'].postMessage(JSON.stringify({proofInput}))
		}else{
			setProof(JSON.stringify("started"));

			console.log(wasmFile);
			makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
	
				alert("make proof finished");

					setProof(JSON.stringify(_proof, null, 2));
					setSignals(JSON.stringify(_signals, null, 2));
				verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
					setIsValid(_isValid);
				});
			});
		}
	};
	const runProofsV2 = () => {
	let proofInput = {
			"BBJAx": "21293424947375383982389393614012508686131238764507830962167322403690693519627",
			"BBJAy": "16598508602523319544157021146196633816724804268958683601720561163654916282271",
			"BBJClaimClaimsTreeRoot": "20554237286409735067431599927785586172790530292725728679114269239512014723026",
			"BBJClaimMtp": [
			  "0",
			  "0",
			  "0",
			  "0"
			],
			"BBJClaimRevTreeRoot": "0",
			"BBJClaimRootsTreeRoot": "0",
			"challenge": "12345",
			"challengeSignatureR8x": "16860174036902244256104674167072183274610068074238677290884913730756513190577",
			"challengeSignatureR8y": "326442332208888422237100058622311240286780945155390934232808034772471332948",
			"challengeSignatureS": "1544566991663309777969185762263569084242157516252959158357266521174928119074",
			"id": "288080072193943372832556802534124228514018653169991403332943485887956910080",
			"state":"15683801318497632203100523443287756879812316361757309549093021254194216616235"
	}
		  
		  
	if (window['ReactNativeWebView']){
		alert('message is posted');

		window['ReactNativeWebView'].postMessage(JSON.stringify({proofInput}))
	}else{
		setProof(JSON.stringify("started"));

		console.log(wasmFile);
	
		fastFile.readExisting(wasmFile).then((fdWasm)=>{
			console.log("fdWasm",fdWasm)
			 fdWasm.read(fdWasm.totalSize).then( wasm =>{
				 console.log("wasm",wasm)
				fdWasm.close();
				wc.default(wasm).then(async witnessCalculator => {
					console.log("witnessCalculator:", witnessCalculator)
					witnessCalculator.calculateWTNSBin(proofInput,0).then(buff =>{
						makeProofOnly(zkeyFile,buff).then(({ proof: _proof, publicSignals: _signals }) =>{
							alert("make proof v2 finished");
							setProof(JSON.stringify(_proof, null, 2));
							setSignals(JSON.stringify(_signals, null, 2));
						verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
							setIsValid(_isValid);});
						})
					});
				})

			 })
		})

		// 2. 


		// 3.
	}
};

	return (

		<div>
			<header className="App-header">

			<Alert  variant="primary">
				This is a proof generator for circuit under the path <br />{wasmFile}
  </Alert>

				<Button variant="outline-primary" onClick={runProofsV2}>Generate Proof</Button>
				<Container   style={{ fontSize: 12 }}>

					
					<Row>
					<Col xs={3}></Col>
					<Col xs={3}>Proof </Col>
					<Col xs={6} >{proof}</Col>
					</Row>
					<Row>
					<Col xs={3}></Col>

					<Col xs={3}>Signals </Col>
					<Col xs={6}>{signals}</Col>
					</Row>
					<Row>
					<Col xs={3}></Col>

					<Col xs={3}>Result </Col>
					<Col xs={6}>{proof.length > 0 && <p>{isValid ? "Valid proof" : ( isValid === undefined ? "calculating":  "Invalid proof")}</p>} </Col>
					</Row>
					</Container>
				
			</header>
		</div>
	);
}

export default App;
