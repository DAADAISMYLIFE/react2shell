import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    hostname: os.hostname(),
    platform: os.platform(),
    node: process.version,
    next: "15.2.4",
    react: "19.1.0",
    env: process.env.NODE_ENV,
    cwd: process.cwd(),
    pid: process.pid,
  });
}
