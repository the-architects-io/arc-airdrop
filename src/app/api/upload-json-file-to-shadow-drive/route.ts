import { RPC_ENDPOINT, SHDW_DRIVE_BASE_URL } from "@/constants/constants";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@metaplex-foundation/js";
import { ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export type UploadJsonFileToShadowDriveResponse = {
  url: string;
  message: string;
  count?: number;
  errors?: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_ASSET_SHDW_DRIVE_ADDRESS
  ) {
    return NextResponse.json(
      {
        error: "Configuration error",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const formDataEntries = Array.from(formData.entries());

  const formDataFile = formData.get("file") as unknown as File | null;
  let fileName = formData.get("fileName") as string;
  let driveAddress = formData.get("driveAddress") as string;
  const overwriteString = formData.get("overwrite") as string;
  const overwrite = !!overwriteString;

  if (fileName.includes('"')) {
    fileName = fileName.replace(/"/g, "");
  }

  if (driveAddress.includes('"')) {
    driveAddress = driveAddress.replace(/"/g, "");
  }

  console.log("sanitycheck", {
    formDataEntries,
    fileName,
    driveAddress,
  });

  if (!formDataFile || !fileName || !driveAddress) {
    return NextResponse.json(
      {
        error: "Missing required parameters",
      },
      { status: 500 }
    );
  }

  const json = await formDataFile.text();
  let count: number | undefined;

  try {
    const parsedJson = JSON.parse(json);

    if (Array.isArray(parsedJson)) {
      count = parsedJson.length;
    }
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      {
        error: "Invalid JSON",
      },
      { status: 500 }
    );
  }

  if (!json) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);

    // Always use mainnet
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();

    const buffer = Buffer.from(json);

    let editedFileUrl;
    if (overwrite) {
      const { keys } = await drive.listObjects(new PublicKey(driveAddress));

      const fileExists = keys?.some((key) => key === fileName);

      console.log("fileExists", fileExists);

      if (fileExists) {
        const { finalized_location } = await drive.editFile(
          new PublicKey(driveAddress),
          `${SHDW_DRIVE_BASE_URL}/${driveAddress}/${fileName}`,
          {
            name: fileName,
            file: buffer,
          }
        );
        editedFileUrl = finalized_location;
      }
    }

    const { message, finalized_locations, upload_errors } =
      await drive.uploadFile(new PublicKey(driveAddress), {
        name: fileName,
        file: buffer,
      });

    console.log({ message, finalized_locations, upload_errors });

    if (upload_errors.length > 0) {
      return NextResponse.json(
        {
          message,
          errors: upload_errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        url: editedFileUrl || finalized_locations[0],
        message,
        count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      {
        error: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
