import { useLogs } from "@/hooks/logs";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

const LogViewer = ({ close }: { close: () => void }) => {
  const { logs } = useLogs();

  const logViewerElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logViewerElRef) {
      logViewerElRef.current?.scrollTo(0, logViewerElRef.current?.scrollHeight);
    }
  }, [logs]);

  return (
    <>
      <div className="fixed z-10 top-4 right-4">
        <button onClick={close}>
          <XMarkIcon className="cursor-pointer w-8 h-8" />
        </button>
      </div>
      <div className="h-full w-full p-16 px-24">
        {logs.map((log, index) => (
          <div key={index} className="whitespace-break-spaces">
            {log}
          </div>
        ))}
        <div className="py-8"></div>
      </div>
    </>
  );
};

export default LogViewer;
