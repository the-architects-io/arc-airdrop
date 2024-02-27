import { useCallback, useEffect, useState } from "react";
import {
  BlueprintClientOptions,
  createBlueprintClient,
} from "@/app/blueprint/client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { ARCHITECTS_WS_API_URL } from "@/constants/constants";
import { messageTypes } from "@/app/blueprint/types/websocket-messages";
import { useCluster } from "@/hooks/cluster";

const { PONG, PING, REPORT_ERROR } = messageTypes;

type WebsocketMessage = {
  type: string;
  payload: any;
};

const useBlueprint = (options?: BlueprintClientOptions) => {
  const { cluster } = useCluster();
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `${ARCHITECTS_WS_API_URL}`
  );
  const [latencyInMs, setLatencyInMs] = useState<number | null>(null);

  const handleMessageData = useCallback(
    async ({ type, payload }: WebsocketMessage) => {
      switch (type) {
        case PONG:
          setLatencyInMs(Date.now() - payload.timestamp);
          console.log("PONG!", Date.now() - payload.timestamp);
          break;
        default:
          break;
      }
    },
    [setLatencyInMs]
  );

  useEffect(() => {
    if (lastMessage !== null) {
      handleMessageData(JSON.parse(lastMessage.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  if (!options) {
    options = {
      cluster,
    };
  }

  const client = createBlueprintClient(options);

  return {
    ws: {
      REPORT_ERROR: (error: any) => {
        if (readyState === ReadyState.OPEN) {
          sendMessage(
            JSON.stringify({
              type: REPORT_ERROR,
              payload: {
                error,
              },
            })
          );
        }
      },
      PING: () => {
        if (readyState === ReadyState.OPEN) {
          sendMessage(
            JSON.stringify({
              type: PING,
              payload: {
                timestamp: Date.now(),
              },
            })
          );
        }
      },
      latencyInMs,
      sendMessage,
      lastMessage,
      readyState,
    },
    blueprint: client,
  };
};

export default useBlueprint;
