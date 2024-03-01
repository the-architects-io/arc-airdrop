import { Airdrop } from "@/app/blueprint/types";

export const getRecipientCountsFromAirdrop = (airdrop: Airdrop) => {
  const { recipients } = airdrop;
  const uniqueRecipients = recipients?.length || 0;
  const recipientCount =
    recipients?.reduce(
      (acc: number, recipient: any) => acc + recipient?.amount,
      0
    ) || 0;

  return {
    uniqueRecipients,
    recipientCount,
  };
};
