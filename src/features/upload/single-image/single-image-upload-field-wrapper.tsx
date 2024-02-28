import {
  BaseBlueprintResponse,
  UploadFileResponse,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export type SingleImageUploadResponse = UploadFileResponse &
  BaseBlueprintResponse;

export const SingleImageUploadFieldWrapper = ({
  children,
  multiple = false,
  setImage,
}: {
  children: JSX.Element | JSX.Element[];
  multiple?: boolean;
  setImage?: (response: UploadFileResponse & BaseBlueprintResponse) => void;
}) => {
  return (
    <Uploady
      destination={{
        url: `${BASE_URL}/api/blueprint`,
      }}
      isSuccessfulCall={({ response }: { response: string }) => {
        const parsedResponse: UploadFileResponse & BaseBlueprintResponse =
          JSON.parse(response);
        if (parsedResponse.success) {
          setImage?.(parsedResponse);
          return true;
        }
        return false;
      }}
      accept="image/*"
      autoUpload={false}
      multiple={multiple}
    >
      {children}
    </Uploady>
  );
};
