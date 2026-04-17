"use client";

import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  encodePassphrase,
  generateRoomId,
  randomString,
} from "../lib/client-utils";

import { Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Page() {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const [meetingLink, setMeetingLink] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [open, setOpen] = useState(false);

  const startMeeting = () => {
    if (e2ee) {
      router.push(
        `/livekit/room/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`
      );
    } else {
      router.push(`/livekit/room/${generateRoomId()}`);
    }
  };

  const onScheduleMeeting = () => {
    setMeetingSchedule(
      `${location.origin}/livekit/room/${generateRoomId()}`
    );
    setOpen(true);
  };

  const onCopyScheduledMeeting: MouseEventHandler = (e) => {
    e.preventDefault();
    window.navigator.clipboard.writeText(meetingSchedule);
  };

  return (
    <main className={styles.main} data-lk-theme="default">
      <section className="max-w-xl text-center flex flex-col items-center justify-center h-screen">
        <Image
          src="/images/garth.png"
          width={600}
          height={600}
          alt="AI Coach Avatar"
          priority
        />

        <div className="p-1">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Video Calls With AI Coach
          </h1>
          <p className="text-xl mt-4">Ready when you are</p>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col mt-8 gap-4 justify-center w-full md:flex-row md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="lk-button">
                New Meeting
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="py-3 px-4 text-base"
                    onClick={startMeeting}
                  >
                    Start meeting now
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-3 px-4 text-base"
                    onClick={onScheduleMeeting}
                  >
                    Create meeting for later
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-full flex md:w-auto justify-between items-center">
              <input
                className="lk-form-control w-auto flex-grow"
                type="text"
                placeholder="Enter a link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <span
                className="ml-2 cursor-pointer hover:text-white/80"
                onClick={() => meetingLink && router.push(meetingLink)}
              >
                Join
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <div className="flex gap-4">
              <input
                id="use-e2ee"
                type="checkbox"
                checked={e2ee}
                onChange={(ev) => setE2ee(ev.target.checked)}
              />
              <Label htmlFor="use-e2ee">
                Enable end-to-end encryption
              </Label>
            </div>

            {e2ee && (
              <div className="flex gap-4">
                <Label htmlFor="passphrase">Passphrase</Label>
                <input
                  id="passphrase"
                  type="password"
                  value={sharedPassphrase}
                  onChange={(ev) => setSharedPassphrase(ev.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
            <DialogDescription>
              Anyone with this link can join the meeting.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" value={meetingSchedule} readOnly />
            </div>
            <Button size="sm" className="px-3" onClick={onCopyScheduledMeeting}>
              <Copy />
            </Button>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
