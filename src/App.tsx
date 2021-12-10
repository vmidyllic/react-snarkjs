import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import "./App.css";

import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
const snarkjs = require("snarkjs");

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(_proofInput, _wasm, _zkey);
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

	let wasmFile = "/files/circuit.wasm";
	let zkeyFile = "/files/circuit_final.zkey";
	let verificationKey = "/files/verification_key.json";

	useEffect(() => {
		window.addEventListener("rn-web-bridge", (event) => {
			// @ts-ignore
			alert("message from native application");
			alert(JSON.stringify(event['detail']));

			let proofInput = 	{
				"BBJAx": "1213652364257902510151929662417166377482228723440905593738842691803502149981",
				"BBJAy": "14676214067024414667976818344434463403313919157482529511753944064776430669351",
				"BBJClaimClaimsTreeRoot": "4097868691633605779443288721202760029772661722531849619505147199061679889928",
				"BBJClaimMtp": [
				  "0",
				  "0",
				  "0",
				  "0"
				],
				"BBJClaimRevTreeRoot": "0",
				"BBJClaimRootsTreeRoot": "0",
				"challenge": "12345",
				"challengeSignatureR8x": "17117490976969752075917313588219231495899176621058055728822427462930535155358",
				"challengeSignatureR8y": "4481570372340485836597206504051057164694091431728642716350782168839437167003",
				"challengeSignatureS": "1192399849894749028480562760239671791247178472281287874551148245771902000568",
				"id":"371135506535866236563870411357090963344408827476607986362864968105378316288",
				"state": "16751774198505232045539489584666775489135471631443877047826295522719290880931"
			  }
			  
			console.log(proofInput);

			setProof(JSON.stringify("started"));

			makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
	
				alert("make proof finished");
			
					setProof(JSON.stringify(_proof, null, 2));
					setSignals(JSON.stringify(_signals, null, 2));
				verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
					setIsValid(_isValid);
				});
			}).catch(err =>{
				alert(err)
			});
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

	const changeA = (e) => {
		setA(e.target.value);
	};

	const changeB = (e) => {
		setB(e.target.value);
	};

	return (
		<div>
			<header className="App-header">

			<Alert  variant="primary">
				This is a proof generator for circuit under the path <br />{wasmFile}
  </Alert>

				<Button variant="outline-primary" onClick={runProofs}>Generate Proof</Button>
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
