import {
  Job,
  JobIconType,
  UploadJob,
  UploadJobStatus,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import {
  GET_JOB_BY_ID,
  GET_UPLOAD_JOB_BY_ID,
} from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { UploadyContextType } from "@rpldy/uploady";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { JobIcon } from "@/features/jobs/job-icon";
import { PercentCompleteIndicator } from "@/features/jobs/percent-complete-indicator";

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
  airdropId,
}: {
  jobId?: string;
  uploadJobId?: string;
  airdropId: string;
}) => {
  const router = useRouter();
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

      {jobData?.jobs_by_pk?.status?.name === UploadJobStatus.ERROR ||
        (uploadJobData?.uploadJobs_by_pk?.status?.name ===
          UploadJobStatus.ERROR && (
          <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
            <div className="mb-4">Airdrop encountered an error.</div>
            <div className="mb-4">Airdrop ID:</div>
            {airdropId}
          </div>
        ))}

      {uploadJobData?.uploadJobs_by_pk?.status?.name ===
        UploadJobStatus.IN_PROGRESS && (
        <div className="mb-8 w-full flex flex-col justify-center items-center">
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
        <div className="mb-8 w-full flex flex-col justify-center items-center">
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
        <div className="mb-8 w-full flex flex-col justify-center items-center">
          <JobIcon icon={jobData?.jobs_by_pk?.icon as unknown as JobIconType} />
          <div className="w-full flex justify-center mb-16 text-3xl text-gray-400 mt-4">
            <div>{jobData?.jobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={jobData?.jobs_by_pk?.percentComplete}
          />
        </div>
      )}
    </>
  );
};
