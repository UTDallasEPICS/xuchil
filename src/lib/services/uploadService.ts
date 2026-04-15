// uploadService: upload files via multipart/form-data

export async function uploadFile(file: File | Blob) {
  const fd = new FormData();
  fd.append("file", file as any);

  const res = await fetch(`/api/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(txt || "Upload failed");
  }
  return await res.json();
}
