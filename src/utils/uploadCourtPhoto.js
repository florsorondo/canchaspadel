import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadCourtPhoto(arenaId, file) {
  const path = `court-photos/${arenaId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);

  return getDownloadURL(storageRef);
}
