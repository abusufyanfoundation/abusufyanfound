const timeZone = "Africa/Lagos";

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(iso));

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone }).format(
    new Date(iso),
  );

  // YYYY-MM-DD in Lagos time, for <input type="date"> values
export const toInputDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso));