import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clapperboard, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toUserMessage } from "@/lib/api/client";
import { postService, uploadService } from "@/lib/api/services/posts";
import { reelService } from "@/lib/api/services/reels";
import { storyService } from "@/lib/api/services/stories";
import { cn } from "@/lib/utils";

type Tab = "photo" | "reel" | "status";

export const Route = createFileRoute("/_authenticated/create")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search["tab"];
    return tab === "reel" || tab === "status" || tab === "photo" ? { tab } : {};
  },
  head: () => ({
    meta: [
      { title: "Create — Fathom" },
      { name: "description", content: "Share a photo, a reel or a 24-hour status on Fathom." },
      { property: "og:title", content: "Create — Fathom" },
      {
        property: "og:description",
        content: "Share a photo, a reel or a 24-hour status on Fathom.",
      },
    ],
  }),
  component: CreatePage,
});

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const TABS: { id: Tab; label: string; icon: typeof ImagePlus }[] = [
  { id: "photo", label: "Photo", icon: ImagePlus },
  { id: "reel", label: "Reel", icon: Clapperboard },
  { id: "status", label: "Status", icon: Sparkles },
];

function CreatePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab ?? "photo");

  const imageInput = useRef<HTMLInputElement | null>(null);
  const videoInput = useRef<HTMLInputElement | null>(null);
  const statusInput = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [video, setVideo] = useState<{ file: File; preview: string } | null>(null);
  const [status, setStatus] = useState<{ file: File; preview: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list)
      .filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} isn't an image.`);
          return false;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          toast.error(`${file.name} is larger than 8MB.`);
          return false;
        }
        return true;
      })
      .slice(0, MAX_IMAGES - files.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeAt(index: number) {
    setFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const canSubmit =
    tab === "photo" ? files.length > 0 : tab === "reel" ? Boolean(video) : Boolean(status);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    try {
      if (tab === "photo") {
        const imageUrls: string[] = [];
        for (const item of files) imageUrls.push(await uploadService.upload(item.file));
        await postService.create({ caption: caption.trim(), imageUrls });
        files.forEach((item) => URL.revokeObjectURL(item.preview));
        toast.success("Post shared");
        await navigate({ to: "/" });
      } else if (tab === "reel" && video) {
        const videoUrl = await uploadService.upload(video.file);
        await reelService.create({ caption: caption.trim(), videoUrl });
        URL.revokeObjectURL(video.preview);
        toast.success("Reel shared");
        await navigate({ to: "/reels" });
      } else if (tab === "status" && status) {
        const mediaUrl = await uploadService.upload(status.file);
        await storyService.create({ mediaUrl, caption: caption.trim() });
        URL.revokeObjectURL(status.preview);
        toast.success("Status shared");
        await navigate({ to: "/" });
      }
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't share that."));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader title="Create" />
      <form className="mx-auto w-full max-w-xl space-y-5 p-4" onSubmit={submit}>
        <div
          role="tablist"
          aria-label="What to create"
          className="flex gap-1 rounded-full bg-secondary p-1"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-background text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </div>

        <input
          ref={imageInput}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={videoInput}
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (file.size > MAX_VIDEO_BYTES) {
              toast.error("Video is larger than 100MB.");
              return;
            }
            setVideo({ file, preview: URL.createObjectURL(file) });
          }}
        />
        <input
          ref={statusInput}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (file.size > MAX_IMAGE_BYTES) {
              toast.error("Image is larger than 8MB.");
              return;
            }
            setStatus({ file, preview: URL.createObjectURL(file) });
          }}
        />

        {tab === "photo" ? (
          <>
            {files.length ? (
              <ul className="grid grid-cols-2 gap-2">
                {files.map((item, index) => (
                  <li key={item.preview} className="relative">
                    <img
                      src={item.preview}
                      alt=""
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAt(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {files.length < MAX_IMAGES ? (
              <Button
                type="button"
                variant="outline"
                className="h-32 w-full flex-col gap-2 rounded-2xl border-dashed"
                onClick={() => imageInput.current?.click()}
              >
                <ImagePlus className="size-6" aria-hidden />
                Add photos (up to {MAX_IMAGES})
              </Button>
            ) : null}
          </>
        ) : tab === "reel" ? (
          video ? (
            <div className="relative">
              <video
                src={video.preview}
                controls
                className="aspect-[9/16] max-h-[60vh] w-full rounded-2xl bg-black object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(video.preview);
                  setVideo(null);
                }}
                aria-label="Remove video"
                className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-32 w-full flex-col gap-2 rounded-2xl border-dashed"
              onClick={() => videoInput.current?.click()}
            >
              <Clapperboard className="size-6" aria-hidden />
              Add a video (up to 100MB)
            </Button>
          )
        ) : status ? (
          <div className="relative">
            <img
              src={status.preview}
              alt=""
              className="aspect-[9/16] max-h-[60vh] w-full rounded-2xl bg-secondary object-contain"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(status.preview);
                setStatus(null);
              }}
              aria-label="Remove status image"
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-32 w-full flex-col gap-2 rounded-2xl border-dashed"
            onClick={() => statusInput.current?.click()}
          >
            <Sparkles className="size-6" aria-hidden />
            Add a status photo (visible 24h)
          </Button>
        )}

        <div className="space-y-2">
          <label htmlFor="caption" className="text-sm font-medium">
            Caption
          </label>
          <Textarea
            id="caption"
            rows={4}
            maxLength={2200}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Say something…"
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending || !canSubmit}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Share"}
        </Button>
      </form>
    </>
  );
}
