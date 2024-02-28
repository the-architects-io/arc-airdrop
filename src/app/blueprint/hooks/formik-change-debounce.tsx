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

  // Update formik field value when debounced value changes
  useEffect(() => {
    formik.setFieldValue(fieldName, debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // Immediate handleChange that updates local state and formik's state for UI feedback
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { value } = e.target;
    formik.handleChange(e); // Update Formik's state immediately for UI feedback
    setDebouncedValue(value); // Set value to be debounced
  };

  // Debounce updating the debounced value
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
      numericValue = numericValue * 100; // Convert percentage to basis points
    }

    // Update UI immediately for feedback, without conversion
    formik.setFieldValue(fieldName, value);

    // Set value to be debounced, with conversion if applicable
    setDebouncedValue(numericValue);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      // Update the debounced value in Formik's state, already converted if necessary
      setDebouncedValue(formik.values[fieldName]);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [formik.values[fieldName], delay]);

  return handleChange;
}
