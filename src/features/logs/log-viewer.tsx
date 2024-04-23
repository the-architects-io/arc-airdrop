import { ARCHITECTS_WS_API_URL } from "@/constants/constants";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

const LogViewer = ({ close }: { close: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!ARCHITECTS_WS_API_URL) return;

    const ws = new WebSocket(ARCHITECTS_WS_API_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Check if the message is a log message
      if (message.type === "LOG_MESSAGE") {
        const log = message.payload.message;
        // Update the component state to include the new log
        setLogs((prevLogs) => [...prevLogs, log]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []); // Effect dependency array includes serverUrl to re-run the effect if the URL changes

  return (
    <>
      <div className="fixed z-10 top-4 right-4">
        <button onClick={close}>
          <XMarkIcon className="cursor-pointer w-8 h-8" />
        </button>
      </div>
      <div className="h-full w-full p-16 px-24">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
        <div className="py-8"></div>
      </div>
    </>
  );
};

export default LogViewer;
