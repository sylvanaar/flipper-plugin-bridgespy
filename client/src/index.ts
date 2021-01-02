import { addPlugin, Flipper } from "react-native-flipper";
import MessageQueue from "react-native/Libraries/BatchedBridge/MessageQueue";
import stringifySafe from "./stringifySafe";

const TO_JS = 0;
let id = 0;

let _connection: Flipper.FlipperConnection | undefined;
const buffer: any[] = [];
const BATCH_SIZE = 50;
addPlugin({
  getId() {
    return "com.sylvanaar.flipper.bridgespy";
  },
  onConnect(connection) {
    _connection = connection;
    console.log("connected");

    MessageQueue.spy((info: any) => {
      if (info.module !== "Flipper" && _connection) {
        info.time = Date.now();
        info.id = (id++).toString();
        info.type = info.type === TO_JS ? "N->JS" : "JS->N";

        buffer.push(info);
        if (buffer.length === 1 || buffer.length === BATCH_SIZE)
          setTimeout(() => {
            try {
              _connection?.send("newRow", stringifySafe(buffer));
            } finally {
              buffer.length = 0;
            }
          }, 50);
      }
    });
    connection.receive("getData", (data, responder) => {
      console.log("incoming data", data);

      responder.success({
        ack: true,
      });
    });
  },
  onDisconnect() {
    _connection = undefined;
    MessageQueue.spy(false);
    console.log("disconnected");
  },
  runInBackground() {
    return false;
  },
});
