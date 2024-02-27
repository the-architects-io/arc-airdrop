import { default as dayjspkg } from "dayjs";
// use require instead
// import relativeTime from "dayjs/plugin/relativeTime";
// use local require statement
// import { default as relativeTime } from "../node_modules/dayjs/plugin/relativeTime";

// dayjspkg.extend(relativeTime);

export const dayjs = dayjspkg;
export const formatDate = (date: string) =>
  dayjs(dayjs(date).toString()).format("M/DD/YYYY");
export const formatTime = (date: string) =>
  dayjs(dayjs(date).toString()).format("h:mm A");
// export const fromNow = (date: string) => dayjs(date).fromNow();
export const formatDateTime = (date: string | number) =>
  dayjs(dayjs(date).toString()).format("M/DD/YY @ h:mm a");
export const diff = (date: string) => dayjs(date).diff(dayjs());
export const diffInHours = (date: string | number) =>
  dayjs().diff(dayjs(date), "hour");
export const diffInSeconds = (date: string | number) =>
  dayjs().diff(dayjs(date), "second");
export const diffInDays = (date: string | number) =>
  dayjs().diff(dayjs(date), "day");
export const convertSecondsToHours = (seconds: number) => seconds / 60 / 60;
export const convertSecondsToDays = (seconds: number) => seconds / 60 / 60 / 24;
export const convertSecondsToDaysAndHoursAndMinutes = (seconds: number) => {
  const days = Math.floor(seconds / 60 / 60 / 24);
  const hours = Math.floor((seconds / 60 / 60) % 24);
  const minutes = Math.floor((seconds / 60) % 60);

  return { days, hours, minutes };
};
export const convertSecondsToDaysAndHoursAndMinutesString = (
  seconds: number
) => {
  const { days, hours, minutes } =
    convertSecondsToDaysAndHoursAndMinutes(seconds);
  return days > 0 ? `${days} days` : `${hours} hours ${minutes} minutes`;
};

export const formatDateTimeToUnix = (date: number) => dayjs.unix(date);
export const formatUnixToDateTime = (date: number) =>
  dayjs.unix(date).format("M/DD/YY @ h:mm a");
export const getDateTimeFromShdwDriveCreationTime = (creationTime: number) =>
  formatDateTime(String(new Date(creationTime * 1000)));
