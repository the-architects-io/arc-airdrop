"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { AirdropsTable } from "@/features/airdrop/airdrops-table";
import { GET_AIRDROPS } from "@/graphql/queries/get-airdrops";
import { useQuery } from "@apollo/client";

export default function AdminAirdropPage() {
  const { loading, error, data } = useQuery(GET_AIRDROPS);

  return (
    <div className="w-full h-full min-h-screen ">
      <ContentWrapper>
        <ContentWrapperYAxisCenteredContent>
          <div>airdrops</div>
          <AirdropsTable airdrops={data?.airdrops} />
        </ContentWrapperYAxisCenteredContent>
      </ContentWrapper>
    </div>
  );
}
