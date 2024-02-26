export const StepTitle = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <div className="text-3xl my-8 font-heavy text-center">
      <div>{children}</div>
    </div>
  );
};
