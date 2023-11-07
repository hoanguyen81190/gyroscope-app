import { Client, ErrorWithInvocationContext, Message } from 'paho-mqtt';

let client: Client | null = null;
const namespace = 'org.ife.biolab'; // Change this to your namespace
const CLIENTID = generateRandomString(10); // Generate a 10-character random string

export type CallbackFunctionType = (message: string) => void;

const options = {
    port: 8084, // TLS/SSL port
    username: 'ife', // Replace with your MQTT username
    password: 'ife', // Replace with your MQTT password
    rejectUnauthorized: false // Set to true if you want to verify the server's certificate
  };

export function connectToBroker(brokerHost: string, callback: CallbackFunctionType, reconnect: boolean): void {
  //const server = 'wss://v8517e16.ala.us-east-1.emqxsl.com:8883'
  if (!client || reconnect) {
    client = new Client(brokerHost, options.port, "test")
    //client = new Client(server, "test")
  
    client.connect({
      userName: options.username,
      password: options.password,
      useSSL: true,
      onSuccess: () => {callback('Connected to MQTT broker');}, 
      onFailure: onFailure})
  
  /*   function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      
      //client.subscribe("World");
    } */
    function onFailure(message: ErrorWithInvocationContext) {
      console.error('Failed to connect to MQTT broker', message.errorMessage);
    }
  }

}

export function publishData(topic: string, payload: any, callback: CallbackFunctionType): void {
  if (client) {
    const message = new Message(JSON.stringify({
      clientid: CLIENTID, 
      payload: payload
    }));
    message.destinationName = `${namespace}/${topic}`;
    client.send(message);
    callback(`${namespace}/${topic}`);
  } else {
    callback('Not connected to MQTT broker. Call connectToBroker() first.');
  }
}

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}