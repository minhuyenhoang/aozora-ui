export function createDownloadableLink(
  data: Blob | BlobPart[],
  blobOptions?: BlobPropertyBag,
  errorCallback?: (error: unknown) => void,
) {
  try {
    // A file or blob is linked to as it is. Loose parts are joined into one.
    return URL.createObjectURL(
      data instanceof Blob ? data : new Blob(data, blobOptions),
    );
  } catch (error) {
    errorCallback?.(error);
  }
}

export function autoDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.style.width = "0.1px";
  link.style.height = "0.1px";
  link.style.visibility = "hidden";
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    revokeDownloadableLink(url);
  }, 1000);
}

export function revokeDownloadableLink(url: string) {
  URL.revokeObjectURL(url);
}
