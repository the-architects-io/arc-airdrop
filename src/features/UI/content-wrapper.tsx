import React, { forwardRef } from "react";
import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const ContentWrapper = forwardRef<HTMLDivElement, Props>(
  ({ children, className, id }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className={classNames(
          "max-w-6xl w-full mx-auto min-h-screen min-w-screen",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ContentWrapper.displayName = "ContentWrapper";

export { ContentWrapper };
