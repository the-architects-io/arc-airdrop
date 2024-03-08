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
import { useEffect } from "react";
import { JobIcon } from "@/features/jobs/job-icon";
import { PercentCompleteIndicator } from "@/features/jobs/percent-complete-indicator";
import { clearLocalStorage } from "@/utils/local-storage";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { useCluster } from "@/hooks/cluster";

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
  const { cluster } = useCluster();
  const {
    loading: loadingJob,
    data: jobData,
  }: { loading: boolean; data: JobResponse } = useQuery(GET_JOB_BY_ID, {
    variables: { id: jobId },
    skip: !jobId,
    pollInterval: 1000,
  });

  const {
    loading: loadingUploadJob,
    data: uploadJobData,
  }: { loading: boolean; data: UploadJobResponse } = useQuery(
    GET_UPLOAD_JOB_BY_ID,
    {
      variables: { id: uploadJobId },
      skip: !uploadJobId,
      pollInterval: 1000,
    }
  );

  useEffect(() => {
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
    uploadJobData?.uploadJobs_by_pk?.status?.name,
    refetch,
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
          <PercentCompleteIndicator
            percentComplete={jobData?.jobs_by_pk?.percentComplete}
          />
        </div>
      )}

      {jobData?.jobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS && (
        <div className="w-full flex flex-col justify-center items-center text-center">
          <JobIcon icon={jobData?.jobs_by_pk?.icon as unknown as JobIconType} />
          <div className="w-full flex justify-center mb-16 text-3xl text-gray-400 mt-4">
            <div>{jobData?.jobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={jobData?.jobs_by_pk?.percentComplete}
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
    </>
  );
};
