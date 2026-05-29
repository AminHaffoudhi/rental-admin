import { api, unwrap } from "@/services/api";

export interface UploadResult {
  fileKey: string;
  bucket: string;
  url: string;
}

export async function uploadCategoryIcon(file: File): Promise<UploadResult> {
  const contentType = file.type || "image/png";
  const res = await api.post("/upload/direct", file, {
    headers: {
      "Content-Type": contentType,
      "X-File-Name": encodeURIComponent(file.name),
      "X-Upload-Folder": "categories",
      "X-File-Size": String(file.size),
    },
    transformRequest: [(data) => data],
  });
  const data = unwrap(res) as UploadResult;
  return data;
}
