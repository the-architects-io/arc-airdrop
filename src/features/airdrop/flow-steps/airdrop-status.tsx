import {
  Airdrop,
  Collection,
  Job,
  JobIconType,
  UploadJob,
  UploadJobStatus,
} from "@/app/blueprint/types";
import {
  GET_JOB_BY_ID,
  GET_UPLOAD_JOB_BY_ID,
} from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { JobIcon } from "@/features/jobs/job-icon";
import { PercentCompleteIndicator } from "@/features/jobs/percent-complete-indicator";
import { clearLocalStorage } from "@/utils/local-storage";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { useCluster } from "@/hooks/cluster";
import { useLogs } from "@/hooks/logs";
import axios from "axios";
import { ARCHITECTS_API_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";

type QueueInfo = {
  counts: {
    wait: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  metrics: {
    completed: {
      meta: {
        count: number;
        prevTS: number;
        prevCount: number;
      };
      data: any[];
    };
    failed: {
      meta: {
        count: number;
        prevTS: number;
        prevCount: number;
      };
      data: any[];
    };
  };
};

type JobResponse =
  | {
      jobs_by_pk: Job;
    }
  | null
  | undefined;

type UploadJobResponse =
  | {
      uploadJobs_by_pk: UploadJob;
    }
  | null
  | undefined;

export const AirdropStatus = ({
  jobId,
  uploadJobId,
  airdrop,
  collection,
  refetch,
}: {
  jobId?: string;
  uploadJobId?: string;
  airdrop: Airdrop;
  collection: Collection;
  refetch: () => void;
}) => {
  const { setIsSaving } = useSaving();
  const { logs } = useLogs();
  const { cluster } = useCluster();

  const [queueName, setQueueName] = useState<string>("");
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [didStartWatchingQueue, setDidStartWatchingQueue] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const {
    loading: loadingJob,
    data: jobData,
  }: { loading: boolean; data: JobResponse } = useQuery(GET_JOB_BY_ID, {
    variables: { id: jobId },
    skip: !jobId,
    pollInterval: !isComplete ? 1000 : undefined,
  });

  const {
    loading: loadingUploadJob,
    data: uploadJobData,
  }: { loading: boolean; data: UploadJobResponse } = useQuery(
    GET_UPLOAD_JOB_BY_ID,
    {
      variables: { id: uploadJobId },
      skip: !uploadJobId,
      pollInterval: !isComplete ? 1000 : undefined,
    }
  );

  const handlePauseQueue = async () => {
    await axios.get(`${ARCHITECTS_API_URL}/queue/pause/${queueName}`);
  };

  const handleResumeQueue = async () => {
    await axios.get(`${ARCHITECTS_API_URL}/queue/resume/${queueName}`);
  };

  const handleDrainQueue = async () => {
    confirm("Are you sure you want to drain this queue?") &&
      (await axios.get(`${ARCHITECTS_API_URL}/queue/drain/${queueName}`));
  };

  const handleObliterateQueue = async () => {
    confirm("Are you sure you want to obliterate this queue?") &&
      (await axios.get(`${ARCHITECTS_API_URL}/queue/obliterate/${queueName}`));
  };

  const fetchQueueInfo = useCallback(async (queueName: string) => {
    if (queueName) {
      const { data: counts, status } = await axios.get(
        `${ARCHITECTS_API_URL}/queue/counts/${queueName}`
      );
      console.log("COUNTS", counts);

      const { data: metrics } = await axios.get(
        `${ARCHITECTS_API_URL}/queue/metrics/${queueName}`
      );
      console.log("METRICS", metrics);

      setQueueInfo({ counts, metrics });
    }
  }, []);

  const watchQueue = useCallback(
    (queueName: string) => {
      if (!didStartWatchingQueue) {
        console.log("WATCHING QUEUE", queueName);
        const interval = setInterval(() => {
          fetchQueueInfo(queueName);
        }, 1000);
        setDidStartWatchingQueue(true);
        return () => clearInterval(interval);
      }
    },
    [didStartWatchingQueue, fetchQueueInfo]
  );

  useEffect(() => {
    if (isComplete && queueInfo?.counts?.completed === collection?.tokenCount) {
      return;
    }

    if (airdrop?.queueName?.length) {
      setQueueName(airdrop.queueName);
      if (isComplete) {
        fetchQueueInfo(airdrop.queueName);
      } else {
        watchQueue(airdrop.queueName);
      }

      return;
    }

    if (logs.length > 0) {
      const airdropQueueNameLog = logs.find((log) =>
        log.includes("Airdrop queue name: ")
      );

      if (airdropQueueNameLog) {
        console.log("AIRDROP QUEUE NAME LOG", airdropQueueNameLog);
        const queueName = airdropQueueNameLog.replace(
          "Airdrop queue name: ",
          ""
        );
        // fetchQueueInfo(queueName);
        setQueueName(queueName);
        watchQueue(queueName);
      } else {
        console.log(logs[logs.length - 1]);
      }
    }
  }, [
    airdrop?.queueName,
    collection?.tokenCount,
    didStartWatchingQueue,
    fetchQueueInfo,
    isComplete,
    logs,
    queueInfo,
    queueName,
    watchQueue,
  ]);

  useEffect(() => {
    if (
      jobData?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE &&
      !isComplete
    ) {
      setIsComplete(true);
    }
    if (
      jobData?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE ||
      jobData?.jobs_by_pk?.status?.name === UploadJobStatus.ERROR
    ) {
      setIsSaving(false);
    }
    if (jobData?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE) {
      refetch();
      clearLocalStorage();
    }
  }, [
    jobData,
    setIsSaving,
    uploadJobData?.uploadJobs_by_pk.status.name,
    refetch,
    isComplete,
  ]);

  if (!jobData && !uploadJobData && !loadingJob && !loadingUploadJob) {
    return null;
  }

  return (
    <>
      {/* <div>
        JOB DATA:
        {JSON.stringify(jobData)}
      </div>

      <div>
        UPLOAD JOB DATA:
        {JSON.stringify(uploadJobData)}
      </div> */}

      {(jobData?.jobs_by_pk?.status?.name === UploadJobStatus.ERROR ||
        uploadJobData?.uploadJobs_by_pk?.status?.name ===
          UploadJobStatus.ERROR) && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">airdrop encountered an error</div>
          <div className="mb-4">airdrop id:</div>
          {airdrop?.id}
          <div className="w-full flex justify-center mb-16 text-sm text-gray-400 mt-16">
            <div>
              {jobData?.jobs_by_pk?.statusText ||
                uploadJobData?.uploadJobs_by_pk?.statusText}
            </div>
          </div>
        </div>
      )}

      {uploadJobData?.uploadJobs_by_pk?.status?.name ===
        UploadJobStatus.IN_PROGRESS && (
        <div className="w-full flex flex-col justify-center items-center text-center">
          <JobIcon
            icon={uploadJobData.uploadJobs_by_pk.icon as unknown as JobIconType}
          />
          <div className="w-full flex justify-center mb-16 text-3xl text-gray-400 mt-4">
            <div>{uploadJobData.uploadJobs_by_pk.statusText}</div>
          </div>
          {/* <PercentCompleteIndicator
            percentComplete={jobData?.jobs_by_pk?.percentComplete}
          /> */}
        </div>
      )}

      {jobData?.jobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS && (
        <div className="w-full flex flex-col justify-center items-center text-center">
          <JobIcon icon={jobData?.jobs_by_pk?.icon as unknown as JobIconType} />
          <div className="w-full flex justify-center mb-16 text-3xl text-gray-400 mt-4">
            <div>{jobData?.jobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={
              (!!queueInfo &&
                Number(
                  (
                    (queueInfo?.counts?.completed / collection?.tokenCount) *
                    100
                  ).toFixed(0)
                )) ||
              0
            }
          />
        </div>
      )}

      {jobData?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE && (
        <div className="w-full flex flex-col justify-center items-center text-center">
          <JobIcon icon={jobData?.jobs_by_pk?.icon as unknown as JobIconType} />
          <div className="w-full flex justify-center mb-16 text-3xl text-gray-400 mt-4">
            <div>{jobData?.jobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={jobData?.jobs_by_pk?.percentComplete}
          />
          <a
            className="text-cyan-400 underline text-lg mb-2"
            href={`https://xray.helius.xyz/token/${
              airdrop.collection?.merkleTree?.address
            }?network=${cluster === "devnet" && "devnet"}`}
            target="_blank"
          >
            view tree
          </a>
          <a
            className="text-cyan-400 underline text-lg"
            href={`https://xray.helius.xyz/token/${
              collection?.collectionNftAddress
            }?network=${cluster === "devnet" && "devnet"}`}
            target="_blank"
          >
            view collection nft
          </a>
        </div>
      )}

      {(queueInfo?.counts?.wait ||
        queueInfo?.counts?.active ||
        queueInfo?.counts?.completed ||
        queueInfo?.counts?.failed ||
        queueInfo?.counts?.delayed ||
        queueInfo?.counts?.paused) && (
        <>
          <div className="w-full flex flex-wrap py-16">
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">waiting</div>
              <div className="text-2xl">{queueInfo?.counts?.wait}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">active</div>
              <div className="text-2xl">{queueInfo?.counts?.active}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">completed</div>
              <div className="text-2xl">{queueInfo?.counts?.completed}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">failed</div>
              <div className="text-2xl">{queueInfo?.counts?.failed}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">delayed</div>
              <div className="text-2xl">{queueInfo?.counts?.delayed}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">paused</div>
              <div className="text-2xl">{queueInfo?.counts?.paused}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">total</div>
              <div className="text-2xl">{collection?.tokenCount}</div>
            </div>
            <div className="w-1/4 flex flex-col items-center py-4">
              <div className="text-base font-bold">percent complete</div>
              <div className="text-2xl">
                {!!queueInfo &&
                  (
                    (queueInfo?.counts?.completed / collection?.tokenCount) *
                    100
                  ).toFixed(0)}
                %
              </div>
            </div>
          </div>
          <div className="w-full flex mb-4 justify-center gap-4">
            <SecondaryButton onClick={handlePauseQueue}>pause</SecondaryButton>
            <SecondaryButton onClick={handleResumeQueue}>
              resume
            </SecondaryButton>
            <SecondaryButton onClick={handleDrainQueue}>drain</SecondaryButton>
            <SecondaryButton onClick={handleObliterateQueue}>
              obliterate
            </SecondaryButton>
          </div>
        </>
      )}
    </>
  );
};
