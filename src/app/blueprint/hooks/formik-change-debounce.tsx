import { debounce } from "@/utils/debounce";
import { FormikContextType } from "formik";
import { useEffect, useState } from "react";

export function useDebouncedFormikField(
  formik: FormikContextType<any>,
  fieldName: string,
  delay = 500
) {
  const [debouncedValue, setDebouncedValue] = useState(
    formik.values[fieldName]
  );

  useEffect(() => {
    formik.setFieldValue(fieldName, debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { value } = e.target;
    formik.handleChange(e);
    setDebouncedValue(value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(formik.values[fieldName]);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values[fieldName], delay]);

  return handleChange;
}

export function useDebouncedFormikNumericField(
  formik: FormikContextType<any>,
  fieldName: string,
  convertToBasisPoints = false,
  delay = 500
) {
  const [debouncedValue, setDebouncedValue] = useState(
    formik.values[fieldName]
  );

  useEffect(() => {
    formik.setFieldValue(fieldName, debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { value } = e.target;
    let numericValue = Number(value);

    if (convertToBasisPoints) {
      numericValue = numericValue * 100;
    }

    formik.setFieldValue(fieldName, value);

    setDebouncedValue(numericValue);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(formik.values[fieldName]);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, fieldName, formik.values]);

  return handleChange;
}
