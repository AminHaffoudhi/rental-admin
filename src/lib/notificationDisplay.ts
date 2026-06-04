/** Strip emoji / pictographs from notification titles (legacy push payloads). */
export function cleanNotificationTitle(title: string): string {
  return title
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
