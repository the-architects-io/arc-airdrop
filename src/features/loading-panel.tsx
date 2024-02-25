import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";

export const LoadingPanel = ({ className }: { className?: string }) => {
  return (
    <ContentWrapper className={className}>
      <ContentWrapperYAxisCenteredContent>
        <></>
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
};
