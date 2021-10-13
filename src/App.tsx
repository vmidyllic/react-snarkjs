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
			alert(JSON.stringify(event.detail));
		});
	});
	const runProofs = () => {
		console.log(b.length);
		if (a.length == 0 || b.length == 0) {
			return;
		}
		let proofInput = { a, b };
		console.log(proofInput);

		makeProof(proofInput, wasmFile, zkeyFile).then(({ proof: _proof, publicSignals: _signals }) => {
	
			if (window['ReactNativeWebView']){
				window['ReactNativeWebView'].postMessage(JSON.stringify({ _proof, _signals }))
			}else{
				setProof(JSON.stringify(_proof, null, 2));
				setSignals(JSON.stringify(_signals, null, 2));
			}
			verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
				setIsValid(_isValid);
			});
		});
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
				{/* <Form>
					<Form.Group className="mb-3" controlId="formBasicEmail">
						<Form.Label>Input a:</Form.Label>
						<Form.Control type="number" placeholder="e.g. 3" />

					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicPassword">
						<Form.Label>Input b:</Form.Label>
						<Form.Control type="number" placeholder="e.g. 11" />
					</Form.Group>
				</Form> */}

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
