import FingerprintJS from "@fingerprintjs/fingerprintjs";

const CID_STORAGE_KEY = "cid";

let cidPromise: Promise<string> | null = null;

async function generateCid() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  return result.visitorId;
}

export function getCid() {
  const storedCid = localStorage.getItem(CID_STORAGE_KEY);

  if (storedCid) {
    return Promise.resolve(storedCid);
  }

  if (!cidPromise) {
    cidPromise = generateCid()
      .then((visitorId) => {
        localStorage.setItem(CID_STORAGE_KEY, visitorId);
        return visitorId;
      })
      .catch((error) => {
        cidPromise = null;
        throw error;
      });
  }

  return cidPromise;
}

export { CID_STORAGE_KEY };
