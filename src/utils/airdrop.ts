import { Airdrop } from "@/app/blueprint/types";

export const getRecipientCountsFromAirdrop = (airdrop: Airdrop) => {
  if (!airdrop?.recipients) return { uniqueRecipients: 0, recipientCount: 0 };
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
