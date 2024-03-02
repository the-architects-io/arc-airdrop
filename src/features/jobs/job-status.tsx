import { JobIconType, UploadJob, UploadJobStatus } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { JobIcon } from "@/features/jobs/job-icon";
import { PercentCompleteIndicator } from "@/features/jobs/percent-complete-indicator";
import showToast from "@/features/toasts/show-toast";
import { GET_UPLOAD_JOB_BY_ID } from "@the-architects/blueprint-graphql";

import { useQuery } from "@apollo/client";
import { UploadyContextType } from "@rpldy/uploady";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

type UploadJobResponse =
  | {
      uploadJobs_by_pk: UploadJob;
    }
  | null
  | undefined;

export const JobStatus = ({
  jobId,
  setJob,
  collectionId,
  jsonUploadyInstance,
  zipFileUploadyInstance,
}: {
  jobId: string;
  setJob: (job: UploadJob | null) => void;
  collectionId: string;
  jsonUploadyInstance?: UploadyContextType | null;
  zipFileUploadyInstance?: UploadyContextType | null;
}) => {
  const router = useRouter();
  const { loading, data }: { loading: boolean; data: UploadJobResponse } =
    useQuery(GET_UPLOAD_JOB_BY_ID, {
      variables: { id: jobId },
      pollInterval: 500,
    });

  const handleClearJob = () => {
    setJob(null);
    jsonUploadyInstance?.clearPending();
    zipFileUploadyInstance?.clearPending();
  };

  if (!loading && !data?.uploadJobs_by_pk) {
    return null;
  }

  return (
    <>
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.ERROR && (
        <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">Asset upload encountered an error.</div>
          <div className="mb-4">Collection ID:</div>
          {collectionId}
        </div>
      )}
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS && (
        <div className="mb-8 w-full flex flex-col justify-center items-center">
          <JobIcon
            icon={data?.uploadJobs_by_pk?.icon as unknown as JobIconType}
          />
          <div className="w-full flex justify-center mb-12 text-3xl text-gray-400 mt-4">
            <div>{data?.uploadJobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={data?.uploadJobs_by_pk?.percentComplete}
          />
        </div>
      )}
    </>
  );
};
