let dbPromise;
function database() {
  if (!dbPromise)
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("whisky-catalog", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("bottles", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  return dbPromise;
}
async function transaction(mode, callback) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bottles", mode);
    const result = callback(tx.objectStore("bottles"));
    tx.oncomplete = () => resolve(result?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Tallennus keskeytyi."));
  });
}
export const getBottles = () =>
  transaction("readonly", (store) => store.getAll());
export const saveBottle = (bottle) =>
  transaction("readwrite", (store) => store.put(bottle));
export const deleteBottle = (id) =>
  transaction("readwrite", (store) => store.delete(id));
export const importBottles = (bottles) =>
  transaction("readwrite", (store) => {
    for (const bottle of bottles) store.put(bottle);
  });
export async function resizePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Valitse JPG-, PNG- tai WebP-kuva.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Kuva on liian suuri. Enimmäiskoko on 20 Mt.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
