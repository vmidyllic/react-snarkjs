import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import * as wc from "./witness_calculator";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
const snarkjs = require("snarkjs");
const fastFile = require("fastfile");

const makeProof = async (_proofInput: any, _wasm: string, _zkey: string) => {
  console.log("make proof started");

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    _proofInput,
    _wasm,
    _zkey
  );
  return { proof, pub_signals: publicSignals };
};

const makeProofOnly = async (_zkey: string, _wasm: any) => {
  console.log("make proof v2 started");
  const { proof, publicSignals } = await snarkjs.groth16.prove(_zkey, _wasm);
  return { proof, pub_signals: publicSignals };
};

const verifyProof = async (
  _verificationkey: string,
  signals: any,
  proof: any
) => {
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


  const [proofAtomicSig, setProofAtomicSig] = useState("");
  const [signalsAtomicSig, setSignalsAtomicSig] = useState("");
  const [isValidAtomicSig, setIsValidAtomicSig] = useState(undefined);

  let wasmFilePathAuth = "/files/auth/circuit.wasm";
  let zkeyFilePathAuth = "files/auth/circuit_final.zkey";
  let verificationKeyFilePathAuth = "/files/auth/verification_key.json";

  let wasmFilePathAtomicQueryMTP =
    "/files/credentialAtomicQueryMTP/circuit.wasm";
  let zkeyFilePathAtomicQueryMTP =
    "/files/credentialAtomicQueryMTP/circuit_final.zkey";
  let verificationKeyPathAtomicQueryMTP =
    "/files/credentialAtomicQueryMTP/verification_key.json";

  let wasmFilePathAtomicQuerySig =
    "/files/credentialAtomicQuerySig/circuit.wasm";
  let zkeyFilePathAtomicQuerySig =
    "/files/credentialAtomicQuerySig/circuit_final.zkey";
  let verificationKeyPathAtomicQuerySig =
    "/files/credentialAtomicQuerySig/verification_key.json";

  type ProofGenerationInputs = {
    circuitId: string;
    inputs: any;
  };
  type ProofGenerationResult = {
    circuitId: string;
    proof: any;
    pub_signals: any;
  };

  async function processRequest(
    listOfInputs: ProofGenerationInputs[]
  ): Promise<ProofGenerationResult[]> {
    debugger;
    let proofGenerationResults: ProofGenerationResult[] = [];

    for (const proofReq of listOfInputs) {
      switch (proofReq.circuitId) {
        case "credentialAtomicQueryMTP": {
          let proofRes = await generateProof(
            wasmFilePathAtomicQueryMTP,
            zkeyFilePathAtomicQueryMTP,
            verificationKeyPathAtomicQueryMTP,
            proofReq.inputs
          );
          proofGenerationResults.push({
            circuitId: proofReq.circuitId,
            proof: proofRes.proof,
            pub_signals: proofRes.pub_signals,
          });
          break;
        }
        case "credentialAtomicQuerySig": {
          let proofRes = await generateProof(
            wasmFilePathAtomicQuerySig,
            zkeyFilePathAtomicQuerySig,
            verificationKeyPathAtomicQuerySig,
            proofReq.inputs
          );
          proofGenerationResults.push({
            circuitId: proofReq.circuitId,
            proof: proofRes.proof,
            pub_signals: proofRes.pub_signals,
          });
          break;
        }
        case "auth": {
          let proofRes = await generateProof(
            wasmFilePathAuth,
            zkeyFilePathAuth,
            verificationKeyFilePathAuth,
            proofReq.inputs
          );
          proofGenerationResults.push({
            circuitId: proofReq.circuitId,
            proof: proofRes.proof,
            pub_signals: proofRes.pub_signals,
          });
          break;
        }
        default: {
          //statements;
          throw new Error(
            "circuit with id " + proofReq.circuitId + "is not supported by web prover"
          );
        }
      }
    }
    return proofGenerationResults;
  }
  async function generateProof(
    wasmFilePath: string,
    zkeyFilePath: string,
    verificationKeyPath: string,
    inputs: any
  ) {
    let fdWasm = await fastFile.readExisting(wasmFilePath);
    let wasm = await fdWasm.read(fdWasm.totalSize);
    fdWasm.close();
    let witnessCalculator = await wc.default(wasm);
    let wtnsBin = await witnessCalculator.calculateWTNSBin(inputs, 0);
    let { proof: _proof, pub_signals: _signals } = await makeProofOnly(
      zkeyFilePath,
      wtnsBin
    );

    return { proof: _proof, pub_signals: _signals };
  }
  // auth v2 version
  window.addEventListener("flutterInAppWebViewPlatformReady", function (event) {
    window["flutter_inappwebview"]
      .callHandler("handlerProofRequest")
      .then(async function (listOfInputs: ProofGenerationInputs[]) {
        // print to the console the data coming
        // from the Flutter side.
        console.log(
          "webview recieved message from flutter (list expecting):",
          JSON.stringify(listOfInputs)
        );
        // parse inputs as array of proof generation inputs

        try {
          let proofGenResult = await processRequest(listOfInputs);

          window["flutter_inappwebview"].callHandler(
            "handlerProofResponse",
            ...proofGenResult
          );
        } catch (e) {
          console.log("error:", (e as Error).message);
        }
      });
  });

  const runProofsV2 = () => {
    let proofInput = {
      "userAuthClaim": ["304427537360709784173770334266246861770", "0", "17640206035128972995519606214765283372613874593503528180869261482403155458945", "20634138280259599560273310290025659992320584624461316485434108770067472477956", "15930428023331155902", "0", "0", "0"],
      "userAuthClaimMtp": ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
      "userAuthClaimNonRevMtp": ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
      "userAuthClaimNonRevMtpAuxHi": "0",
      "userAuthClaimNonRevMtpAuxHv": "0",
      "userAuthClaimNonRevMtpNoAux": "1",
      "challenge": "1",
      "challengeSignatureR8x": "8553678144208642175027223770335048072652078621216414881653012537434846327449",
      "challengeSignatureR8y": "5507837342589329113352496188906367161790372084365285966741761856353367255709",
      "challengeSignatureS": "2093461910575977345603199789919760192811763972089699387324401771367839603655",
      "userClaimsTreeRoot": "9763429684850732628215303952870004997159843236039795272605841029866455670219",
      "userID": "379949150130214723420589610911161895495647789006649785264738141299135414272",
      "userRevTreeRoot": "0",
      "userRootsTreeRoot": "0",
      "userState": "18656147546666944484453899241916469544090258810192803949522794490493271005313"
    }
    

	let proofInputAtomicQueryMTP = {
    "userAuthClaim": [
      "304427537360709784173770334266246861770",
      "0",
      "17640206035128972995519606214765283372613874593503528180869261482403155458945",
      "20634138280259599560273310290025659992320584624461316485434108770067472477956",
      "15930428023331155902",
      "0",
      "0",
      "0"
    ],
    "userAuthClaimMtp": [
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
    "userAuthClaimNonRevMtp": [
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
    "userAuthClaimNonRevMtpAuxHi": "0",
    "userAuthClaimNonRevMtpAuxHv": "0",
    "userAuthClaimNonRevMtpNoAux": "1",
    "userClaimsTreeRoot": "9763429684850732628215303952870004997159843236039795272605841029866455670219",
    "userState": "18656147546666944484453899241916469544090258810192803949522794490493271005313",
    "userRevTreeRoot": "0",
    "userRootsTreeRoot": "0",
    "userID": "379949150130214723420589610911161895495647789006649785264738141299135414272",
    "challenge": "1",
    "challengeSignatureR8x": "8553678144208642175027223770335048072652078621216414881653012537434846327449",
    "challengeSignatureR8y": "5507837342589329113352496188906367161790372084365285966741761856353367255709",
    "challengeSignatureS": "2093461910575977345603199789919760192811763972089699387324401771367839603655",
    "issuerClaim": [
      "3583233690122716044519380227940806650830",
      "379949150130214723420589610911161895495647789006649785264738141299135414272",
      "10",
      "0",
      "30803922965249841627828060161",
      "0",
      "0",
      "0"
    ],
    "issuerClaimClaimsTreeRoot": "3077200351284676204723270374054827783313480677490603169533924119235084704890",
    "issuerClaimIdenState": "18605292738057394742004097311192572049290380262377486632479765119429313092475",
    "issuerClaimMtp": [
      "0",
      "0",
      "18337129644116656308842422695567930755039142442806278977230099338026575870840",
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
    "issuerClaimRevTreeRoot": "0",
    "issuerClaimRootsTreeRoot": "0",
    "issuerClaimNonRevClaimsTreeRoot": "3077200351284676204723270374054827783313480677490603169533924119235084704890",
    "issuerClaimNonRevRevTreeRoot": "0",
    "issuerClaimNonRevRootsTreeRoot": "0",
    "issuerClaimNonRevState": "18605292738057394742004097311192572049290380262377486632479765119429313092475",
    "issuerClaimNonRevMtp": [
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
    "issuerClaimNonRevMtpAuxHi": "0",
    "issuerClaimNonRevMtpAuxHv": "0",
    "issuerClaimNonRevMtpNoAux": "1",
    "claimSchema": "180410020913331409885634153623124536270",
    "issuerID": "26599707002460144379092755370384635496563807452878989192352627271768342528",
    "operator": 0,
    "slotIndex": 2,
    "timestamp": "1642074362",
    "value": [
      "10",
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
    ]
  }
  
  
  let proofInputAtomicQuerySig =  {
    "userAuthClaim": [
      "304427537360709784173770334266246861770",
      "0",
      "17640206035128972995519606214765283372613874593503528180869261482403155458945",
      "20634138280259599560273310290025659992320584624461316485434108770067472477956",
      "15930428023331155902",
      "0",
      "0",
      "0"
    ],
    "userAuthClaimMtp": [
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
    "userAuthClaimNonRevMtp": [
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
    "userAuthClaimNonRevMtpAuxHi": "0",
    "userAuthClaimNonRevMtpAuxHv": "0",
    "userAuthClaimNonRevMtpNoAux": "1",
    "userClaimsTreeRoot": "9763429684850732628215303952870004997159843236039795272605841029866455670219",
    "userState": "18656147546666944484453899241916469544090258810192803949522794490493271005313",
    "userRevTreeRoot": "0",
    "userRootsTreeRoot": "0",
    "userID": "379949150130214723420589610911161895495647789006649785264738141299135414272",
    "challenge": "1",
    "challengeSignatureR8x": "8553678144208642175027223770335048072652078621216414881653012537434846327449",
    "challengeSignatureR8y": "5507837342589329113352496188906367161790372084365285966741761856353367255709",
    "challengeSignatureS": "2093461910575977345603199789919760192811763972089699387324401771367839603655",
    "issuerClaim": [
      "3583233690122716044519380227940806650830",
      "379949150130214723420589610911161895495647789006649785264738141299135414272",
      "10",
      "0",
      "30803922965249841627828060161",
      "0",
      "0",
      "0"
    ],
    "issuerClaimNonRevClaimsTreeRoot": "3077200351284676204723270374054827783313480677490603169533924119235084704890",
    "issuerClaimNonRevRevTreeRoot": "0",
    "issuerClaimNonRevRootsTreeRoot": "0",
    "issuerClaimNonRevState": "18605292738057394742004097311192572049290380262377486632479765119429313092475",
    "issuerClaimNonRevMtp": [
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
    "issuerClaimNonRevMtpAuxHi": "0",
    "issuerClaimNonRevMtpAuxHv": "0",
    "issuerClaimNonRevMtpNoAux": "1",
    "claimSchema": "180410020913331409885634153623124536270",
    "issuerID": "26599707002460144379092755370384635496563807452878989192352627271768342528",
    "operator": 0,
    "slotIndex": 2,
    "timestamp": "1642074362",
    "value": [
      "10",
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
    "issuerClaimSignatureR8x": "18625305647089498634672127449050652473073470525382360069529718632627474482386",
    "issuerClaimSignatureR8y": "14539700345423181413201048131770723125531044953576671601029329833956725811279",
    "issuerClaimSignatureS": "772934080142423067561028786350670095248312416624185973552603152377549415467",
    "issuerAuthClaim": [
      "304427537360709784173770334266246861770",
      "0",
      "9582165609074695838007712438814613121302719752874385708394134542816240804696",
      "18271435592817415588213874506882839610978320325722319742324814767882756910515",
      "11203087622270641253",
      "0",
      "0",
      "0"
    ],
    "issuerAuthClaimMtp": [
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
    "issuerAuthClaimNonRevMtp": [
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
    "issuerAuthClaimNonRevMtpAuxHi": "0",
    "issuerAuthClaimNonRevMtpAuxHv": "0",
    "issuerAuthClaimNonRevMtpNoAux": "1",
    "issuerAuthClaimsTreeRoot": "18337129644116656308842422695567930755039142442806278977230099338026575870840",
    "issuerAuthRevTreeRoot": "0",
    "issuerAuthRootsTreeRoot": "0",
    "issuerClaimsTreeRoot": "18337129644116656308842422695567930755039142442806278977230099338026575870840",
    "issuerState": "6317996369756476782464660619835940615734517981889733696047139451453239145426",
    "issuerRevTreeRoot": "0",
    "issuerRootsTreeRoot": "0"
  }
  
    if (window["ReactNativeWebView"]) {
      alert("message is posted");

      window["ReactNativeWebView"].postMessage(JSON.stringify({ proofInput }));
    } else {
      setProofAuth(JSON.stringify("started"));
      setProofAtomic(JSON.stringify("started"));
      setProofAtomicSig(JSON.stringify("started"));


      let listOfInputs: ProofGenerationInputs[] = [];
      listOfInputs.push({ circuitId: "auth", inputs: proofInput });
      listOfInputs.push({
        circuitId: "credentialAtomicQueryMTP",
        inputs: proofInputAtomicQueryMTP,
      });
	  listOfInputs.push({
        circuitId: "credentialAtomicQuerySig",
        inputs: proofInputAtomicQuerySig,
      });

      processRequest(listOfInputs).then((res) => {
        console.log(res);
        debugger;
        alert("make proof array finished");

        res.forEach((proofResult) => {
          if (proofResult.circuitId === "auth") {
            setProofAuth(JSON.stringify(proofResult.proof, null, 2));
            setSignalsAuth(JSON.stringify(proofResult.pub_signals, null, 2));
            verifyProof(
              verificationKeyFilePathAuth,
              proofResult.pub_signals,
              proofResult.proof
            ).then((_isValid) => {
              setIsValidAuth(_isValid);
            });
          }
          if (proofResult.circuitId === "credentialAtomicQueryMTP") {
            setProofAtomic(JSON.stringify(proofResult.proof, null, 2));
            setSignalsAtomic(JSON.stringify(proofResult.pub_signals, null, 2));
            verifyProof(
              verificationKeyPathAtomicQueryMTP,
              proofResult.pub_signals,
              proofResult.proof
            ).then((_isValid) => {
              setIsValidAtomic(_isValid);
            });
          }
		  if (proofResult.circuitId === "credentialAtomicQuerySig") {
            setProofAtomicSig(JSON.stringify(proofResult.proof, null, 2));
            setSignalsAtomicSig(JSON.stringify(proofResult.pub_signals, null, 2));
            verifyProof(
              verificationKeyPathAtomicQuerySig,
              proofResult.pub_signals,
              proofResult.proof
            ).then((_isValid) => {
              setIsValidAtomicSig(_isValid);
            });
          }
        });
      }).catch(e => {
		  console.log(e);
	  });
    }
  };

  return (
    <div>
      <header className="App-header">
        <Alert variant="primary">
          This is a proof generator for circuit under the path <br />
          {wasmFilePathAuth}
          <br />
          {wasmFilePathAtomicQueryMTP}
		  <br />
          {wasmFilePathAtomicQuerySig}
        </Alert>

        <Button variant="outline-primary" onClick={runProofsV2}>
          Generate Proof (mtp and sig support 0.0.41)
        </Button>
        <Container style={{ fontSize: 12 }}>
          <Row>
            <Col xs={5}>
              <Row>
                <Col xs={3}>Proof Auth </Col>
                <Col xs={6}>{proofAuth}</Col>
              </Row>
              <Row>
                <Col xs={3}>Signals Auth </Col>
                <Col xs={6}>{signalsAuth}</Col>
              </Row>
              <Row>
                <Col xs={3}>Result Auth </Col>
                <Col xs={6}>
                  {proofAuth.length > 0 && (
                    <p>
                      {isValidAuth
                        ? "Valid proof"
                        : isValidAuth === undefined
                        ? "calculating"
                        : "Invalid proof"}
                    </p>
                  )}{" "}
                </Col>
              </Row>
            </Col>
          
          </Row>
		  <Row>
		  <Col xs={5}>
              <Row>
                <Col xs={3}>Proof Atomic </Col>
                <Col xs={6}>{proofAtomic}</Col>
              </Row>
              <Row>
                <Col xs={3}>Signals Atomic </Col>
                <Col xs={6}>{signalsAtomic}</Col>
              </Row>
              <Row>
                <Col xs={3}>Result Atomic </Col>
                <Col xs={6}>
                  {proofAtomic.length > 0 && (
                    <p>
                      {isValidAtomic
                        ? "Valid proof"
                        : isValidAtomic === undefined
                        ? "calculating"
                        : "Invalid proof"}
                    </p>
                  )}{" "}
                </Col>
              </Row>
            </Col>
		  </Row>
		  <Row>
		  <Col xs={5}>
              <Row>
                <Col xs={3}>Proof Atomic Sig </Col>
                <Col xs={6}>{proofAtomicSig}</Col>
              </Row>
              <Row>
                <Col xs={3}>Signals Atomic Sig </Col>
                <Col xs={6}>{signalsAtomicSig}</Col>
              </Row>
              <Row>
                <Col xs={3}>Result Atomic Sig </Col>
                <Col xs={6}>
                  {proofAtomicSig.length > 0 && (
                    <p>
                      {isValidAtomicSig
                        ? "Valid proof"
                        : isValidAtomicSig === undefined
                        ? "calculating"
                        : "Invalid proof"}
                    </p>
                  )}{" "}
                </Col>
              </Row>
            </Col>
		  </Row>
        </Container>
      </header>
    </div>
  );
}

export default App;
