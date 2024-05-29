"use client";
import { ARCHITECTS_API_URL } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { QueueInfo } from "@/features/airdrop/flow-steps/airdrop-status";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { useQuery } from "@apollo/client";
import axios from "axios";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";

export default function AdminAirdropDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);

  const { loading, error, data } = useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    fetchPolicy: "no-cache",
  });

  const fetchQueueInfo = useCallback(async (queueName: string) => {
    if (queueName) {
      const { data: counts, status } = await axios.get(
        `${ARCHITECTS_API_URL}/queue/counts/${queueName}`
      );

      const { data: signatures } = await axios.get(
        `${ARCHITECTS_API_URL}/queue/signatures/${queueName}`
      );

      setQueueInfo({ counts, signatures });
    }
  }, []);

  useEffect(() => {
    if (data?.airdrops_by_pk?.queueName && !queueInfo) {
      fetchQueueInfo(data?.airdrops_by_pk?.queueName);
    }
  }, [data?.airdrops_by_pk?.queueName, fetchQueueInfo, queueInfo]);

  return (
    <div className="w-full h-full min-h-screen ">
      <ContentWrapper>
        <ContentWrapperYAxisCenteredContent>
          <div className="py-16 text-center">
            <div className="text-xl text-center mb-8">
              {data?.airdrops_by_pk?.id}
            </div>
            <div className="mb-8">
              {JSON.stringify(data?.airdrops_by_pk, null, 2)}
            </div>
            {queueInfo && (
              <>
                <div className="text-lg text-center mb-4">counts</div>
                <div className="mb-4">
                  <div className="flex w-full justify-center gap-4">
                    <div>waiting: {queueInfo?.counts?.wait}</div>
                    <div>active: {queueInfo?.counts?.active}</div>
                    <div>
                      completed:{" "}
                      <span
                        className={classNames({
                          "text-green-500":
                            queueInfo?.counts?.completed ===
                            queueInfo?.signatures?.completed?.count,
                          "text-red-500":
                            queueInfo?.counts?.completed !==
                            queueInfo?.signatures?.completed?.count,
                        })}
                      >
                        {queueInfo?.counts?.completed}
                      </span>
                    </div>
                    <div>failed: {queueInfo?.counts?.failed}</div>
                    <div>delayed: {queueInfo?.counts?.delayed}</div>
                    <div>paused: {queueInfo?.counts?.paused}</div>
                  </div>
                </div>
                <div>
                  signature count:
                  <span
                    className={classNames({
                      "text-green-500":
                        queueInfo?.signatures?.completed?.count ===
                        queueInfo?.counts?.completed,
                      "text-red-500":
                        queueInfo?.signatures?.completed?.count !==
                        queueInfo?.counts?.completed,
                    })}
                  >
                    {queueInfo?.signatures?.completed?.count}
                  </span>
                </div>
                <div>
                  duplicates:{" "}
                  {queueInfo?.signatures?.completed?.duplicatesCount}
                </div>
              </>
            )}
          </div>
        </ContentWrapperYAxisCenteredContent>
      </ContentWrapper>
    </div>
  );
}
