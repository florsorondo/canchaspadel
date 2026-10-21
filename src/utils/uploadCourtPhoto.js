import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.82;

// Achica la foto antes de subirla: las del celular pesan varios MB y las reglas aceptan hasta 5 MB
async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );

    return blob && blob.size < file.size ? blob : file;
  } catch {
    // Formatos que el navegador no puede leer (ej. HEIC en algunos navegadores): se sube tal cual
    return file;
  }
}

export async function uploadCourtPhoto(arenaId, file) {
  const image = await compressImage(file);
  const name = file.name.replace(/\.[^.]+$/, "");
  const extension = image === file ? file.name.split(".").pop() : "jpg";
  const path = `court-photos/${arenaId}/${Date.now()}-${name}.${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, image, { contentType: image.type || file.type });

  return getDownloadURL(storageRef);
}
