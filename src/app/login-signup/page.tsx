"use client";

import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import Spinner from "@/features/UI/spinner";
import {
  useAuthenticationStatus,
  useSignInEmailPassword,
  useSignOut,
  useSignUpEmailPassword,
  useUserData,
} from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginSignupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();
  const { isAuthenticated, isLoading: isLoadingAuth } =
    useAuthenticationStatus();
  const wallet = useWallet();

  const {
    signUpEmailPassword,
    needsEmailVerification: signUpNeedsEmailVerification,
    isLoading: signUpIsLoading,
    isSuccess: signUpIsSuccess,
    isError: signUpIsError,
    error: signUpError,
  } = useSignUpEmailPassword();

  const {
    signInEmailPassword,
    needsEmailVerification: signInNeedsEmailVerification,
    isLoading: signInIsLoading,
    isSuccess: signInIsSuccess,
    isError: signInIsError,
    error: signInError,
  } = useSignInEmailPassword();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ email, password }) => {
      let res;

      try {
        res = await signInEmailPassword(email, password);
      } catch (err) {
        console.log(err);
      }

      formik.setValues({ email: "", password: "" });
    },
  });

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (!wallet?.publicKey) {
      router.push("/connect-wallet");
      setIsLoading(false);
      return;
    }

    router.push("/airdrop/select-recipients");
  }, [isAuthenticated, router, wallet, isLoadingAuth]);

  if (isLoadingAuth || isLoading) {
    return (
      <ContentWrapper className="cursor-pointer">
        <ContentWrapperYAxisCenteredContent>
          <></>
        </ContentWrapperYAxisCenteredContent>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="cursor-pointer max-w-md">
      <ContentWrapperYAxisCenteredContent>
        <div className="text-3xl mb-4">
          {mode === "login" ? "login" : "sign up"}
        </div>
        <form className="space-y-4 w-full">
          <FormInputWithLabel
            label="email address"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <FormInputWithLabel
            label="password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          <div className="w-full flex justify-center py-8">
            <SubmitButton
              isSubmitting={formik.isSubmitting || signInIsLoading}
              onClick={formik.handleSubmit}
            >
              next
            </SubmitButton>
          </div>
          <div className="w-full flex justify-center">
            <div
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-cyan-500 cursor-pointer underline hover:bg-cyan-500 hover:text-gray-100 p-1 transition-all duration-300 ease-in-out"
            >
              {mode === "login"
                ? "no account? sign up!"
                : "got an account? login!"}
            </div>
          </div>
        </form>
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
