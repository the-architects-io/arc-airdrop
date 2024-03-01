import {
  Job,
  JobIconType,
  UploadJob,
  UploadJobStatus,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import { GET_JOB_BY_ID } from "@the-architects/blueprint-graphql";
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

export const AirdropStatus = ({
  jobId,
  airdropId,
  setJob,
  jsonUploadyInstance,
  zipFileUploadyInstance,
}: {
  jobId: string;
  airdropId: string;
  setJob: (job: UploadJob | null) => void;
  jsonUploadyInstance?: UploadyContextType | null;
  zipFileUploadyInstance?: UploadyContextType | null;
}) => {
  const router = useRouter();
  const { loading, data }: { loading: boolean; data: JobResponse } = useQuery(
    GET_JOB_BY_ID,
    {
      variables: { id: jobId },
      pollInterval: 500,
    }
  );

  const handleClearJob = () => {
    setJob(null);
    jsonUploadyInstance?.clearPending();
    zipFileUploadyInstance?.clearPending();
  };

  useEffect(() => {
    if (data?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE) {
      setTimeout(() => {
        showToast({
          primaryMessage: "Airdrop complete!",
        });
        router.push(`${BASE_URL}/me/airdrop`);
      }, 3000);
    }
  }, [data?.jobs_by_pk?.status?.name, router]);

  if (!loading && !data?.jobs_by_pk) {
    return null;
  }

  return (
    <>
      {data?.jobs_by_pk?.status?.name === UploadJobStatus.ERROR && (
        <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">Airdrop encountered an error.</div>
          <div className="mb-4">Airdrop ID:</div>
          {airdropId}
        </div>
      )}
      {(data?.jobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS ||
        data?.jobs_by_pk?.status?.name === UploadJobStatus.COMPLETE) && (
        <div className="mb-8 w-full flex flex-col justify-center items-center">
          <JobIcon icon={data?.jobs_by_pk?.icon as unknown as JobIconType} />
          <div className="w-full flex justify-center mb-16 text-3xl text-sky-200 mt-4">
            <div>{data?.jobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={data?.jobs_by_pk?.percentComplete}
          />
        </div>
      )}
    </>
  );
};
