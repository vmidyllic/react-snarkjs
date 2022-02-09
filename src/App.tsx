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

	const [proofAuth, setProofAuth] = useState("");
	const [signalsAuth, setSignalsAuth] = useState("");
	const [isValidAuth, setIsValidAuth] = useState(undefined);


	const [proofAtomic, setProofAtomic] = useState("");
	const [signalsAtomic, setSignalsAtomic] = useState("");
	const [isValidAtomic, setIsValidAtomic] = useState(undefined);

	let wasmFilePathAuth = "/files/auth-v2/circuit.wasm";
	let zkeyFilePathAuth = "files/auth-v2/circuit_final.zkey";
	let verificationKeyFilePathAuth = "/files/auth-v2/verification_key.json";


	let wasmFilePathAtomicQuery = "/files/credentialAtomicQuery/circuit.wasm";
	let zkeyFilePathAtomicQuery = "/files/credentialAtomicQuery/circuit_final.zkey";
	let verificationKeyPathAtomicQuery = "/files/credentialAtomicQuery/verification_key.json";
	
	type ProofGenerationInputs = {
		circuitId :string;
		inputs: any;
	}
	type ProofGenerationResult = {
		circuitId :string;
		proof: any;
		pub_signals:any;
	}

async function processRequest (listOfInputs: ProofGenerationInputs[]): Promise<ProofGenerationResult[]> {
	
		debugger;
		let proofGenerationResults :ProofGenerationResult[]= [];

		for (const proofReq of listOfInputs){
			if (proofReq.circuitId === "credentialAtomicQuery"){
				let proofRes = await generateProof(wasmFilePathAtomicQuery,zkeyFilePathAtomicQuery,verificationKeyPathAtomicQuery,proofReq.inputs);
				proofGenerationResults.push({circuitId: proofReq.circuitId, proof:proofRes.proof , pub_signals:proofRes.pub_signals});
			}
			if (proofReq.circuitId === "auth") {
				let proofRes = await generateProof(wasmFilePathAuth,zkeyFilePathAuth,verificationKeyFilePathAuth,proofReq.inputs);
				proofGenerationResults.push({circuitId: proofReq.circuitId, proof:proofRes.proof , pub_signals:proofRes.pub_signals});
			}
		}
		return proofGenerationResults;
	  }
	async function generateProof(wasmFilePath: string,zkeyFilePath :string, verificationKeyPath:string,inputs:any) {
		let fdWasm = await  fastFile.readExisting(wasmFilePath);
		let wasm  = await fdWasm.read(fdWasm.totalSize);
		fdWasm.close();
		let witnessCalculator = await wc.default(wasm);
		let wtnsBin = await witnessCalculator.calculateWTNSBin(inputs,0);
		let { proof: _proof, pub_signals: _signals } = await makeProofOnly(zkeyFilePath,wtnsBin);

		return  {proof:_proof, pub_signals:_signals};
	}
	// auth v2 version
	window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
		window['flutter_inappwebview'].callHandler('handlerProofRequest')
		  .then(async function(listOfInputs: ProofGenerationInputs[]) {
			// print to the console the data coming
			// from the Flutter side.
			console.log("webview recieved message from flutter (list expecting):",JSON.stringify(listOfInputs));
			// parse inputs as array of proof generation inputs

			
			let proofGenResult = await processRequest(listOfInputs);

			window['flutter_inappwebview']
								.callHandler('handlerProofResponse', ...proofGenResult);
			
	});
});

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
	let proofInputAtomicQuery = {"authClaim":["164867201768971999401702181843803888060","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"authClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtpAuxHi":"0","authClaimNonRevMtpAuxHv":"0","authClaimNonRevMtpNoAux":"1","challenge":"1","challengeSignatureR8x":"8553678144208642175027223770335048072652078621216414881653012537434846327449","challengeSignatureR8y":"5507837342589329113352496188906367161790372084365285966741761856353367255709","challengeSignatureS":"2093461910575977345603199789919760192811763972089699387324401771367839603655","claim":["3677203805624134172815825715044445108615","293373448908678327289599234275657468666604586273320428510206058753616052224","10","0","30803922965249841627828060161","0","0","0"],"claimIssuanceClaimsTreeRoot":"7246896034587217404391735131819928831029447598354448731452631177424919458245","claimIssuanceIdenState":"3465800424177143196107127845857728750770736366457056414231195686681735039800","claimIssuanceMtp":["417537058197893761686953664555712220182002293231272771939654136223079364880","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"claimIssuanceRevTreeRoot":"0","claimIssuanceRootsTreeRoot":"0","claimNonRevIssuerClaimsTreeRoot":"7246896034587217404391735131819928831029447598354448731452631177424919458245","claimNonRevIssuerRevTreeRoot":"0","claimNonRevIssuerRootsTreeRoot":"0","claimNonRevIssuerState":"3465800424177143196107127845857728750770736366457056414231195686681735039800","claimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"claimNonRevMtpAuxHi":"0","claimNonRevMtpAuxHv":"0","claimNonRevMtpNoAux":"1","claimSchema":"274380136414749538182079640726762994055","hoClaimsTreeRoot":"209113798174833776229979813091844404331713644587766182643501254985715193770","hoIdenState":"15383795261052586569047113011994713909892315748410703061728793744343300034754","hoRevTreeRoot":"0","hoRootsTreeRoot":"0","id":"293373448908678327289599234275657468666604586273320428510206058753616052224","operator":0,"slotIndex":2,"timestamp":"1642074362","value":"10"};
		  
		  
	if (window['ReactNativeWebView']){
		alert('message is posted');

		window['ReactNativeWebView'].postMessage(JSON.stringify({proofInput}))
	}else{
		setProofAuth(JSON.stringify("started"));
		setProofAtomic(JSON.stringify("started"));

		let listOfInputs: ProofGenerationInputs[] = [];
		listOfInputs.push({circuitId:"auth",inputs:proofInput});
		listOfInputs.push({circuitId:"credentialAtomicQuery",inputs:proofInputAtomicQuery});
		
		processRequest(listOfInputs).then(res=>{
			console.log(res);
			debugger;
			alert("make proof array finished");

			res.forEach(proofResult => {
				
				if (proofResult.circuitId === "auth"){
					setProofAuth(JSON.stringify(proofResult.proof, null, 2));
					setSignalsAuth(JSON.stringify(proofResult.pub_signals, null, 2));
					verifyProof(verificationKeyFilePathAuth, proofResult.pub_signals, proofResult.proof).then((_isValid) => {
					setIsValidAuth(_isValid);});
				}
				if (proofResult.circuitId === "credentialAtomicQuery"){
					setProofAtomic(JSON.stringify(proofResult.proof, null, 2));
					setSignalsAtomic(JSON.stringify(proofResult.pub_signals, null, 2));
					verifyProof(verificationKeyPathAtomicQuery, proofResult.pub_signals, proofResult.proof).then((_isValid) => {
					setIsValidAtomic(_isValid);});
				}
	
			});

		})
	
	}
};

	return (

		<div>
			<header className="App-header">

			<Alert  variant="primary">
				This is a proof generator for circuit under the path <br />{wasmFilePathAuth}
				<br />{wasmFilePathAtomicQuery}
  </Alert>

				<Button variant="outline-primary" onClick={runProofsV2}>Generate Proof (list support 2.0)</Button>
				<Container   style={{ fontSize: 12 }}>

					<Row>
						<Col xs={5} >
							<Row>
								<Col xs={3}>Proof Auth </Col>
								<Col xs={6} >{proofAuth}</Col>
							</Row>
							<Row>
								<Col xs={3}>Signals Auth </Col>
								<Col xs={6}>{signalsAuth}</Col>
							</Row>
							<Row>
								<Col xs={3}>Result Auth </Col>
								<Col xs={6}>{proofAuth.length > 0 && <p>{isValidAuth ? "Valid proof" : ( isValidAuth === undefined ? "calculating":  "Invalid proof")}</p>} </Col>
							</Row>
						</Col>
						<Col xs={2}>
							</Col>
						<Col xs={5}>
						<Row>
								<Col xs={3}>Proof Atomic </Col>
								<Col xs={6} >{proofAtomic}</Col>
							</Row>
							<Row>
								<Col xs={3}>Signals Atomic </Col>
								<Col xs={6}>{signalsAtomic}</Col>
							</Row>
							<Row>
								<Col xs={3}>Result Atomic </Col>
								<Col xs={6}>{proofAtomic.length > 0 && <p>{isValidAtomic ? "Valid proof" : ( isValidAtomic === undefined ? "calculating":  "Invalid proof")}</p>} </Col>
							</Row>
						</Col>

					</Row>

					
				
					</Container>
				
			</header>
		</div>
	);
}

export default App;
