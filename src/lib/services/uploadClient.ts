export async function uploadFile(file: File | Blob): Promise<{path:string}> {
  const fd = new FormData();
  fd.append("file", file as any);

  const res = await fetch(`/api/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    throw new Error(await res.json());
  }
  return await res.json();
}
