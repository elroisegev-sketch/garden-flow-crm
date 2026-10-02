import QRCode from "qrcode";
import { buildPdf } from "./pdf";
import type { DemoFileSpec } from "./types";

export async function renderDemoFile(spec: DemoFileSpec): Promise<Blob> {
  if (spec.mime === "application/pdf") {
    return new Blob([buildPdf(spec.title, spec.lines) as BlobPart], { type: "application/pdf" });
  }
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = spec.template === "boarding" ? 1280 : 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  if (spec.template === "boarding") drawBoarding(context, spec, font);
  else drawCard(context, spec, font);
  if (spec.template === "esim") {
    try {
      await drawQr(context);
    } catch {
      context.fillStyle = "#1c1917";
      context.font = `600 28px ${font}`;
      context.fillText("QR demo unavailable", 56, 860);
    }
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("preview");
  return blob;
}

function drawCard(context: CanvasRenderingContext2D, spec: DemoFileSpec, font: string) {
  context.fillStyle = "#f6f3ee";
  context.fillRect(0, 0, 900, 1200);
  context.fillStyle = spec.accent;
  context.fillRect(0, 0, 900, 280);
  context.fillStyle = "#f4ead8";
  context.font = `600 28px ${font}`;
  context.fillText(spec.kicker, 56, 90);
  context.fillStyle = "#ffffff";
  context.font = `700 64px ${font}`;
  context.fillText(spec.title, 56, 180);
  context.fillStyle = "#1c1917";
  spec.lines.forEach((line, index) => {
    context.font = `${index === 0 ? 700 : 500} ${index === 0 ? 42 : 32}px ${font}`;
    context.fillText(line, 56, 390 + index * 64);
  });
  watermark(context, font, 1200);
}

function drawBoarding(context: CanvasRenderingContext2D, spec: DemoFileSpec, font: string) {
  context.fillStyle = "#e7e2da";
  context.fillRect(0, 0, 900, 1280);
  roundRect(context, 40, 40, 820, 1200, 36, "#ffffff");
  context.fillStyle = spec.accent;
  context.fillRect(40, 40, 820, 220);
  context.fillStyle = "#f4ead8";
  context.font = `600 26px ${font}`;
  context.fillText(spec.kicker, 80, 110);
  context.fillStyle = "#ffffff";
  context.font = `700 52px ${font}`;
  context.fillText(spec.title, 80, 185);
  const [name, route, date, flight, time, seat, terminal] = spec.lines;
  context.fillStyle = "#14283a";
  context.font = `700 64px ${font}`;
  context.fillText(route ?? "", 80, 360);
  context.font = `600 36px ${font}`;
  context.fillText(name ?? "", 80, 430);
  const rows = [
    ["Date", date],
    ["Flight", flight],
    ["Departure", time],
    ["Seat", seat],
    ["Terminal", terminal],
  ];
  rows.forEach((row, index) => {
    const y = 520 + index * 100;
    context.fillStyle = "#746d64";
    context.font = `500 24px ${font}`;
    context.fillText(row[0] ?? "", 80, y);
    context.fillStyle = "#1c1917";
    context.font = `700 36px ${font}`;
    context.fillText(row[1] ?? "", 80, y + 44);
  });
  context.strokeStyle = "#e5dfd6";
  context.setLineDash([8, 8]);
  context.beginPath();
  context.moveTo(80, 1040);
  context.lineTo(820, 1040);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "#14283a";
  for (let index = 0; index < 46; index += 1) {
    const bar = 8 + (index % 4) * 6;
    context.fillRect(80 + index * 16, 1080, 8, bar + 40);
  }
  context.fillStyle = "#9f2d3a";
  context.font = `700 28px ${font}`;
  context.fillText("DEMO", 80, 1188);
}

async function drawQr(context: CanvasRenderingContext2D) {
  const url = await QRCode.toDataURL("TRAVEL VAULT DEMO - NOT A REAL ESIM", { margin: 1, width: 360 });
  const image = new Image();
  image.src = url;
  await image.decode();
  context.fillStyle = "#ffffff";
  context.fillRect(250, 760, 400, 400);
  context.drawImage(image, 270, 780, 360, 360);
}

function watermark(context: CanvasRenderingContext2D, font: string, height: number) {
  context.save();
  context.globalAlpha = 0.08;
  context.translate(450, height / 2);
  context.rotate(-0.45);
  context.fillStyle = "#9f2d3a";
  context.font = `700 140px ${font}`;
  context.textAlign = "center";
  context.fillText("DEMO", 0, 0);
  context.restore();
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
}
