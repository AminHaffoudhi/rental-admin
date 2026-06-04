import { api, unwrap } from "@/services/api";

export interface UploadResult {
  fileKey: string;
  bucket: string;
  url: string;
}

async function uploadImage(file: File, folder: "categories" | "avatars"): Promise<UploadResult> {
  const contentType = file.type || "image/jpeg";
  const res = await api.post("/upload/direct", file, {
    headers: {
      "Content-Type": contentType,
      "X-File-Name": encodeURIComponent(file.name),
      "X-Upload-Folder": folder,
      "X-File-Size": String(file.size),
    },
    transformRequest: [(data) => data],
  });
  return unwrap(res) as UploadResult;
}

export async function uploadCategoryIcon(file: File): Promise<UploadResult> {
  return uploadImage(file, "categories");
}

export async function uploadAvatar(file: File): Promise<UploadResult> {
  return uploadImage(file, "avatars");
}
