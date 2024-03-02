import { Line } from "rc-progress";

export const PercentCompleteIndicator = ({
  percentComplete,
}: {
  percentComplete?: number;
}) => {
  return (
    <>
      {!!percentComplete && percentComplete > 0 && percentComplete < 100 && (
        <>
          <div className="mb-8 flex flex-col items-center justify-center w-full h-48">
            <div className="flex justify-center items-end mb-4 text-gray-400">
              <div className="text-8xl">{Math.floor(percentComplete)}</div>
              <span className="ml-3 text-xl">%</span>
            </div>
            <div className="w-full max-w-md mb-8">
              <Line
                percent={Math.floor(percentComplete)}
                trailWidth={1}
                strokeWidth={3}
                strokeColor="#a754ea"
                trailColor="#7cd2fb"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
