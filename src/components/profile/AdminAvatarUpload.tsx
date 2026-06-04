import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/services/upload.service";
import { cn } from "@/lib/utils";

const MAX_MB = 5;

export function AdminAvatarUpload(props: {
  name: string;
  imageUrl?: string | null;
  onUploaded: (url: string) => void;
  disabled?: boolean;
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = props.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const result = await uploadAvatar(file);
      props.onUploaded(result.url);
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <Avatar className={cn("h-24 w-24 border-2 border-stone-200 dark:border-stone-700", uploading && "opacity-60")}>
          {props.imageUrl ? <AvatarImage src={props.imageUrl} alt="" /> : null}
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : null}
      </div>
      <div className="space-y-2 text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          Upload a square photo (JPEG, PNG, or WebP, max {MAX_MB}MB).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={props.disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={props.disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Change photo"}
        </Button>
      </div>
    </div>
  );
}
