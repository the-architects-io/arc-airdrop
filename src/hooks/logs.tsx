"use client";

import { ARCHITECTS_WS_API_URL } from "@/constants/constants";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type LogsContext = {
  logs: string[];
  addLog: (log: string) => void;
  setLogs: (logs: string[]) => void;
};

const LogsContext = React.createContext({} as LogsContext);
const { Provider } = LogsContext;

export const LogsProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (log: string) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  useEffect(() => {
    if (!ARCHITECTS_WS_API_URL) return;

    const ws = new WebSocket(ARCHITECTS_WS_API_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "LOG_MESSAGE") {
        const log = message.payload.message;
        setLogs((prevLogs) => [...prevLogs, log]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Provider
      value={{
        logs,
        addLog,
        setLogs,
      }}
    >
      {children}
    </Provider>
  );
};

export const useLogs = () => {
  const { logs, addLog, setLogs } = useContext(LogsContext);

  return { logs, addLog, setLogs };
};
