import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toUserMessage } from "@/lib/api/client";
import { postService } from "@/lib/api/services/posts";
import { reelService } from "@/lib/api/services/reels";
import { LIMITS } from "@/lib/constants/config";

/** Edit / delete controls shown only to the author of a post or reel. */
export function OwnerMenu({
  kind,
  id,
  caption,
  onChanged,
}: {
  kind: "post" | "reel";
  id: string;
  caption: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState(caption);
  const [pending, setPending] = useState(false);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["feed"] });
    void queryClient.invalidateQueries({ queryKey: ["reels"] });
    void queryClient.invalidateQueries({ queryKey: ["user"] });
    void queryClient.invalidateQueries({ queryKey: [kind, id] });
    onChanged?.();
  }

  async function save() {
    setPending(true);
    try {
      if (kind === "post") await postService.update(id, { caption: draft.trim() });
      else await reelService.update(id, { caption: draft.trim() });
      toast.success("Caption updated");
      setEditing(false);
      invalidate();
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't save your changes."));
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    try {
      if (kind === "post") await postService.remove(id);
      else await reelService.remove(id);
      toast.success(kind === "post" ? "Post deleted" : "Reel deleted");
      setConfirming(false);
      invalidate();
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't delete this."));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More options for this ${kind}`}>
            <MoreHorizontal className="size-5" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setDraft(caption);
              setEditing(true);
            }}
          >
            <Pencil className="size-4" aria-hidden />
            Edit caption
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit caption</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            maxLength={LIMITS.captionMax}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Caption"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button disabled={pending} onClick={() => void save()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this {kind}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This can't be undone.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={() => void remove()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
