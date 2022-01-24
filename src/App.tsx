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
	return { proof, pub_signals: publicSignals };
};

const makeProofOnly = async ( _zkey: string, _wasm: any) => {
	console.log("make proof v2 started");
	const { proof, publicSignals } = await snarkjs.groth16.prove(_zkey,_wasm);
	return { proof, pub_signals: publicSignals  };
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


	// auth-v1 version

	// window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
	// 	console.log("flutterInAppWebViewPlatformReady is called!")
	// 	console.log("setup handlerProofRequest for flutter_inappwebview object")
	// 	window['flutter_inappwebview'].callHandler('handlerProofRequest')
	// 	  .then(function(result) {
	// 		// print to the console the data coming
	// 		// from the Flutter side.
	// 		console.log("webview recieved message from flutter:",JSON.stringify(result));
	// 		setProof(JSON.stringify("started"));
	// 		makeProof(result, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
	// 		    console.log("make proof finished:");
	// 			console.log({proof:_proof, signals:_signals});
	// 			window['flutter_inappwebview']
	// 		  .callHandler('handlerProofResponse', {proof:_proof, signals:_signals});
	// 			});
	// 		}).catch(err =>{
	// 			console.log("error")
	// 			console.log(err)
	// 		});
	// });


	
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
							makeProofOnly(zkeyFile,buff).then(({ proof: _proof, pub_signals: _signals }) =>{
								window['flutter_inappwebview']
								.callHandler('handlerProofResponse', { proof: _proof, pub_signals: _signals });
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
			makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, pub_signals: _signals }) => {
	
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
        "authClaim": [
            "164867201768971999401702181843803888060",
            "0",
            "17640206035128972995519606214765283372613874593503528180869261482403155458945",
            "20634138280259599560273310290025659992320584624461316485434108770067472477956",
            "15930428023331155902",
            "0",
            "0",
            "0"
        ],
        "authClaimMtp": [
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0"
        ],
        "authClaimNonRevMtp": [
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0"
        ],
        "authClaimNonRevMtpAuxHi": "0",
        "authClaimNonRevMtpAuxHv": "0",
        "authClaimNonRevMtpNoAux": "1",
        "challenge": "1",
        "challengeSignatureR8x": "8553678144208642175027223770335048072652078621216414881653012537434846327449",
        "challengeSignatureR8y": "5507837342589329113352496188906367161790372084365285966741761856353367255709",
        "challengeSignatureS": "2093461910575977345603199789919760192811763972089699387324401771367839603655",
        "claimsTreeRoot": "209113798174833776229979813091844404331713644587766182643501254985715193770",
        "id": "293373448908678327289599234275657468666604586273320428510206058753616052224",
        "revTreeRoot": "0",
        "rootsTreeRoot": "0",
        "state": "15383795261052586569047113011994713909892315748410703061728793744343300034754"
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
						makeProofOnly(zkeyFile,buff).then(({ proof: _proof, pub_signals: _signals }) =>{
							console.log(_signals);
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

				<Button variant="outline-primary" onClick={runProofsV2}>Generate Proof (new auth circuit v2)</Button>
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
