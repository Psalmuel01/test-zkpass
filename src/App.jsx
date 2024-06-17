import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TransgateConnect from '@zkpass/transgate-js-sdk'
import Web3 from "web3"

function App() {

  const web3 = new Web3()
  
  const verify = async () => {
    event.preventDefault()
    try {
      // The appid of the project created in dev center
      const appid = "1ce74716-51e2-4313-b14d-e3e0995a8d3b"
  
      // Create the connector instance
      const connector = new TransgateConnect(appid)
  
      // Check if the TransGate extension is installed
      // If it returns false, please prompt to install it from chrome web store
      const isAvailable = await connector.isTransgateAvailable()
  
      if (isAvailable) {
        // The schema id of the project
        const schemaId = "655d20ecbf834b3b939c0e875abe3eed"
        // const schemaId = "516a720e-29a4-4307-ae7b-5aec286e446e"
  
        // Launch the process of verification
        // This method can be invoked in a loop when dealing with multiple schemas
        const res = await connector.launch(schemaId)
  
        console.log('res', res)
  
        // verify the res onchain/offchain based on the requirement


        // verify allocator signature
        
        const { taskId, validatorAddress, allocatorSignature, validatorSignature, uHash, publicFieldsHash, recipient } = res //return by Transgate

        const taskIdHex = Web3.utils.stringToHex(taskId)
        console.log('taskIdHex', taskIdHex)

        const schemaIdHex = Web3.utils.stringToHex(schemaId)
        console.log('schemaIdHex', schemaIdHex)
  
        const encodeParams = web3.eth.abi.encodeParameters(
          ["bytes32", "bytes32", "address"],
          [taskIdHex, schemaIdHex, validatorAddress]
        )
        const paramsHash = Web3.utils.soliditySha3(encodeParams)
        
        // recover allocator address

        const signedAllocatorAddress = web3.eth.accounts.recover(paramsHash, allocatorSignature)

        //check if the signed allocator address is registered

        console.log(signedAllocatorAddress === "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d")
        // return signedAllocatorAddress === "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d"


        // verify validator signature
        
        const types = ["bytes32", "bytes32", "bytes32", "bytes32"]
        const values = [taskIdHex, schemaIdHex, uHash, publicFieldsHash]

        //If you add the wallet address as the second parameter when launch the Transgate
        if (recipient) {
          types.push("address")
          values.push(recipient)
        }

        const encodeParams2 = web3.eth.abi.encodeParameters(types, values)

        const paramsHash2 = Web3.utils.soliditySha3(encodeParams2)

        // recover validator address
        const signedValidatorAddress = web3.eth.accounts.recover(paramsHash2, validatorSignature)

        console.log(signedValidatorAddress === validatorAddress)
        // return signedValidatorAddress === validatorAddress

      } else {
        console.log('Please install TransGate')
      }
    } catch (error) {
      console.log('transgate error', error)
    }
  }

  return (
    <>
      <h1>zkPass LinkedIn Verification</h1>
      <div>
        <a onClick={verify} href="" target="_blank">
          Verify you have a LinkedIn account
        </a>
      </div>
      
      <p className="read-the-docs">
        powered by zkPass
      </p>
    </>
  )
}

export default App
