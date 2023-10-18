import mqtt, { MqttClient } from 'mqtt';

const connectToMQTTBroker = (): MqttClient => {
  // Create a client instance
  const client = mqtt.connect('mqtts://broker.example.com', {
    port: 8883, // Specify the SSL/TLS port (usually 8883 for MQTT over SSL/TLS)
    //protocolId: 'MQIsdp',
    //protocolVersion: 3,
    rejectUnauthorized: false, // Set to true if your certificate isn't self-signed
    clientId: 'gyroscope-data-app',
    username: 'ife',
    password: 'ife',
  });

  // Set up event handlers
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to topics or perform any other actions here
  });

  client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
  });

  return client;
};

export default connectToMQTTBroker;
