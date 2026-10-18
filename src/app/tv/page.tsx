"use client";

import { Stage } from "@/components/shell";
import { BoardView } from "./BoardView";
import { SoundUnlock, useJumpToCall, useTv } from "./tv";

/** TV_Board.dc.html — waiting-room screen: who is in each room and who is next (live, numbers only). */
export default function Page() {
  const tv = useTv();
  useJumpToCall(tv.rows, "/tv/");
  return (
    <Stage width={1920} height={1080} padding="60px 72px" direction="column" gap={40}>
      <BoardView tv={tv} />
      <SoundUnlock settings={tv.call} />
    </Stage>
  );
}
