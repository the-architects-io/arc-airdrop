import { MiniCnftCard } from "@/features/UI/cards/mini-cnft-card";
import { StepHeading } from "@/features/UI/typography/step-heading";
import { StepTitle } from "@/features/UI/typography/step-title";

export const ReviewStep = () => {
  const cnfts = [
    {
      name: "collection 1",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 2",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 3",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 4",
      image: "https://picsum.photos/200",
    },
    {
      name: "collection 5",
      image: "https://picsum.photos/200",
    },
  ];

  return (
    <>
      <StepTitle>review</StepTitle>
      <div className="flex flex-wrap w-full mb-28">
        <div className="w-full md:w-1/3 flex flex-col px-4 space-y-8 py-8">
          <StepHeading>
            <span className="text-red-500">15,000 </span>
            cnfts created
          </StepHeading>
          <StepHeading>8,125 unique recipients</StepHeading>
          <StepHeading>5 cnft variations</StepHeading>
          <StepHeading>total cost: 0.2265 SOL</StepHeading>
        </div>
        <div className="flex flex-wrap gap-y-4 w-full md:w-2/3">
          {cnfts.map((cnft, index) => (
            <div
              key={index}
              className="w-full md:w-1/3 flex flex-col items-center justify-center mb-4"
            >
              <MiniCnftCard className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
