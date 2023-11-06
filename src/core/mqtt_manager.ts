import mqtt from 'mqtt';

let client: mqtt.MqttClient;

export type CallbackFunctionType = (message: string) => void;

const options = {
    port: 8883, // TLS/SSL port
    username: 'ife', // Replace with your MQTT username
    password: 'ife', // Replace with your MQTT password
    rejectUnauthorized: false // Set to true if you want to verify the server's certificate
  };

export function connectToBroker(brokerHost: string, callback: CallbackFunctionType): void {
  client = mqtt.connect(brokerHost, options);

  client.on('connect', () => {
    callback('Connected to MQTT broker');
  });

  client.on('error', (err) => {
    console.log(err)
    callback('Error connecting to MQTT broker:');
  });
}

export function publishData(topic: string, message: string, callback: CallbackFunctionType): void {
  if (client) {
    client.publish(topic, message);
  } else {
    callback('Not connected to MQTT broker. Call connectToBroker() first.');
  }
}
