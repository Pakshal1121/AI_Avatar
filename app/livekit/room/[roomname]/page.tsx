import * as React from "react";
// import { PageClientImpl } from "./PageClientImpl";
import { isVideoCodec } from "../../lib/types";

import dynamic from "next/dynamic";
const PageClientImpl = dynamic(
  () => import("./PageClientImpl").then((m) => m.PageClientImpl),
  { ssr: false }
);

export default function Page({
  params,
  searchParams,
}: {
  params: { roomname: string };
  searchParams: {
    region?: string;
    hq?: string;
    codec?: string;
  };
}) {
  const { roomname } = params;
  const { region, hq, codec } = searchParams;

  return (
     <div className="h-screen w-full" data-lk-theme="default">
      <PageClientImpl
        roomName={roomname}
        region={region}
        hq={hq === "true" ? true : false}
        codec={typeof codec === "string" && isVideoCodec(codec) ? codec : "vp9"}
      />
    </div>
  );
}
