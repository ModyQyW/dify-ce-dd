import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text(
    "🎉 HonoJS: Hello World! Get /ce?value=xxx or /dd?value=xxx to get the final value."
  );
});

app.get("/ce", async (c) => {
  const value = c.req.query("value");
  if (!value) {
    return c.json({ error: "value is required." }, 400);
  }
  try {
    const uint8Array = new TextEncoder().encode(value);
    const compressedStream = new Response(
      new Blob([uint8Array]).stream().pipeThrough(new CompressionStream("gzip"))
    ).arrayBuffer();
    const compressedUint8Array = new Uint8Array(await compressedStream);
    return c.json({
      value: btoa(String.fromCharCode(...compressedUint8Array)),
    });
  } catch {
    return c.json({ error: "value is not valid." }, 400);
  }
});

app.get("/dd", async (c) => {
  const value = c.req.query("value");
  if (!value) {
    return c.json({ error: "value is required." }, 400);
  }
  try {
    const binaryString = atob(value);
    const compressedUint8Array = Uint8Array.from(binaryString, (char) =>
      char.charCodeAt(0)
    );
    const decompressedStream = new Response(
      compressedUint8Array
    ).body?.pipeThrough(new DecompressionStream("gzip"));
    const decompressedArrayBuffer = await new Response(
      decompressedStream
    ).arrayBuffer();
    return c.json({
      value: new TextDecoder().decode(decompressedArrayBuffer),
    });
  } catch {
    return c.json({ error: "value is not valid." }, 400);
  }
});

export default app;
