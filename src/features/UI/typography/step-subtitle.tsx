export const StepSubtitle = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <div className="text-xl mb-8 -mt-4">
      <div>{children}</div>
    </div>
  );
};
