import { Client, ErrorWithInvocationContext, Message } from 'paho-mqtt';

let client: Client | null = null;
const namespace = 'org.ife.biolab'; // Change this to your namespace

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

export function publishData(topic: string, payload: string, callback: CallbackFunctionType): void {
  if (client) {
    const message = new Message(payload);
    message.destinationName = `${namespace}/${topic}`;
    client.send(message);
    callback(`${namespace}/${topic}`);
  } else {
    callback('Not connected to MQTT broker. Call connectToBroker() first.');
  }
}
