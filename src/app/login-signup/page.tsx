"use client";

import { fadeIn, fadeOut } from "@/animations";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import Spinner from "@/features/UI/spinner";
import { LoadingPanel } from "@/features/loading-panel";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
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
import { useCallback, useEffect, useRef, useState } from "react";

export default function LoginSignupPage() {
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [didStartAnimation, setDidStartAnimation] = useState(false);
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
      setIsLoggingIn(true);
      let res;

      if (mode === "signup") {
        try {
          res = await signUpEmailPassword(email, password);
        } catch (err) {
          console.log(err);
        }
        formik.setValues({ email: "", password: "" });
        return;
      } else {
        try {
          res = await signInEmailPassword(email, password);
        } catch (err) {
          console.log(err);
        }
        formik.setValues({ email: "", password: "" });
      }
    },
  });

  const loginPanelRef = useRef<HTMLDivElement>(null);

  const fadeOutPanel = useCallback(() => {
    if (didStartAnimation) return;
    const id = loginPanelRef?.current?.id;
    console.log("fading out", id);
    if (!id) return;
    fadeOut(`#${id}`);
    setDidStartAnimation(true);
    setTimeout(() => {
      router.push("/airdrop/select-recipients");
    }, 600);
  }, [router, didStartAnimation]);

  useEffect(() => {
    if (isLoggingIn) {
      fadeOutPanel();
      return;
    }
    setCurrentStep(airdropFlowSteps.LoginSignup);
    if (!isAuthenticated && !isLoggingIn) {
      setIsLoading(false);
      setTimeout(() => {
        fadeIn(".panel-fade-in-out");
      }, 100);
      return;
    }

    if (!wallet?.publicKey && !isLoggingIn) {
      router.push("/connect-wallet");
      setIsLoading(false);
      const id = loginPanelRef?.current?.id;
      if (!id) return;
      setTimeout(() => {
        fadeIn(id);
      }, 100);
      return;
    }

    router.push("/airdrop/select-recipients");
  }, [
    isAuthenticated,
    router,
    wallet,
    isLoadingAuth,
    isLoggingIn,
    setCurrentStep,
    fadeOutPanel,
    airdropFlowSteps.LoginSignup,
  ]);

  if (isLoadingAuth || isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper
      className="cursor-pointer max-w-md panel-fade-in-out opacity-0 transition-all"
      ref={loginPanelRef}
      id="login-panel"
    >
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
              {mode === "login" ? "login" : "sign up"}
            </SubmitButton>
          </div>
          <div className="w-full flex justify-center">
            <div
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-gray-400 cursor-pointer underline hover:bg-gray-500 hover:text-gray-100 p-1 transition-all duration-300 ease-in-out"
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
