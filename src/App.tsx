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
	const [isValid, setIsValid] = useState(false);

	let wasmFile = "https://a801-89-22-47-19.ngrok.io/files/circuit.wasm";
	let zkeyFile = "https://a801-89-22-47-19.ngrok.io/files/circuit_final.zkey";
	let verificationKey = "https://a801-89-22-47-19.ngrok.io/files/verification_key.json";

	useEffect(() => {
		window.addEventListener("rn-web-bridge", (event) => {
			// @ts-ignore
			alert("message from native application");
			alert(JSON.stringify(event['detail']));

			let proofInput = { a, b };
			console.log(proofInput);

			setProof(JSON.stringify("started"));

			alert(makeProof === undefined)
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

			let proofInput = { a, b };
		if (window['ReactNativeWebView']){
			alert('message is posted');

			window['ReactNativeWebView'].postMessage(JSON.stringify({proofInput}))
		}else{
			setProof(JSON.stringify("started"));

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
					<Col xs={6}>{proof.length > 0 && <p>{isValid ? "Valid proof" : "Invalid proof"}</p>} </Col>
					</Row>
					</Container>
				
			</header>
		</div>
	);
}

export default App;
