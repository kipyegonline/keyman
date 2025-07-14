export function toDataUrlFromFile(file: File) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error("The provided argument is not a File object."));
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      // reader.result contains the Data URL (e.g., "data:image/png;base64,...")
      resolve(reader.result);
    };

    reader.onerror = () => {
      // Reject the promise if there's an error reading the file
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}
export function DataURIToBlob(dataURI: string) {
  const splitDataURI = dataURI.split(",");
  const byteString =
    splitDataURI[0].indexOf("base64") >= 0
      ? atob(splitDataURI[1])
      : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

  return new Blob([ia], {
    type: mimeString,
  });
}
