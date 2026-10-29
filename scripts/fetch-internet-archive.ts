import { createClient } from "../src/lib/supabase/server";

/**
 * Fetch Internet Archive item metadata and insert into Supabase videos table
 * Usage: tsx scripts/fetch-internet-archive.ts <item-id>
 * Example: tsx scripts/fetch-internet-archive.ts sony-videoclips-1930s
 */

async function fetchInternetArchive(itemId: string) {
  const supabase = await createClient();

  console.log(`Fetching Internet Archive item: ${itemId}`);

  // Fetch metadata from archive.org
  const metadataUrl = `https://archive.org/metadata/${itemId}`;
  const metadataResponse = await fetch(metadataUrl);

  if (!metadataResponse.ok) {
    console.error("Failed to fetch metadata:", metadataResponse.statusText);
    return;
  }

  const metadata = await metadataResponse.json();
  console.log("Metadata received:", metadata.identifier);

  // Find MP4 file URL
  const files = metadata.files || [];
  const mp4File = files.find(
    (file: any) => file.format === "MP4" && file.source === "original"
  );

  if (!mp4File) {
    console.log("No MP4 file found. Available formats:", files.map((f: any) => f.format));
    // Try to find any MP4
    const anyMp4 = files.find((file: any) => file.format === "MP4");
    if (!anyMp4) {
      console.error("No MP4 format found");
      return;
    }
  }

  const streamUrl = `https://archive.org/download/${itemId}/${mp4File?.name || "movie.mp4"}`;

  // Get item title
  const title = metadata.metadata?.title?.[0] || itemId;

  // Insert into Supabase
  const { data, error } = await supabase
    .from("videos")
    .insert([
      {
        title: title,
        description: metadata.metadata?.description?.[0] || "",
        poster_url: metadata.metadata?.subject?.includes("poster") ? null : null,
        stream_url: streamUrl,
        source: "internet-archive",
        is_public_domain: true,
      },
    ])
    .select();

  if (error) {
    console.error("Failed to insert video:", error);
    return;
  }

  console.log("Video inserted:", data);
}

const itemId = process.argv[2];
if (!itemId) {
  console.error("Usage: tsx scripts/fetch-internet-archive.ts <item-id>");
  console.error("Example: tsx scripts/fetch-internet-archive.ts sony-videoclips-1930s");
  process.exit(1);
}

fetchInternetArchive(itemId).then(() => {
  console.log("Done!");
  process.exit(0);
});
