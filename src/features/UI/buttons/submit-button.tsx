import classNames from "classnames";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  buttonText?: string;
  children?: React.ReactNode | string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SubmitButton = ({
  isSubmitting,
  buttonText,
  children,
  disabled,
  className,
  onClick,
}: Props) => {
  return (
    <PrimaryButton
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
      disabled={isSubmitting || disabled}
      className={classNames([
        "tracking-widest flex items-center justify-center",
        isSubmitting
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 cursor-pointer",
        disabled
          ? "opacity-50 cursor-not-allowed bg-stone-500 hover:bg-stone-500"
          : "",
        className,
      ])}
      type="submit"
    >
      {isSubmitting ? (
        <Spinner />
      ) : (
        <>{children ? children : buttonText || "save"}</>
      )}
    </PrimaryButton>
  );
};
