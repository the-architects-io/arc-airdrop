import { useLogs } from "@/hooks/logs";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

const LogViewerSmall = ({ close }: { close: () => void }) => {
  const { logs } = useLogs();

  const logViewerElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logViewerElRef) {
      logViewerElRef.current?.scrollTo(0, logViewerElRef.current?.scrollHeight);
    }
  }, [logs]);

  return (
    <>
      <div className="fixed top-6 right-6">
        <button onClick={close}>
          <XMarkIcon className="cursor-pointer w-6 h-6" />
        </button>
      </div>
      <div className="overflow-y-auto" ref={logViewerElRef}>
        {logs.map((log, index) => (
          <div className="py-2 whitespace-break-spaces" key={index}>
            {log}
          </div>
        ))}
      </div>
    </>
  );
};

export default LogViewerSmall;
