const TASK_TID_STORAGE_KEY = "task_tid";
const TASK_ESTIMATE_STORAGE_KEY = "task_estimate";

type SavedEstimate = string;

export function saveTaskTid(tid: string) {
  localStorage.setItem(TASK_TID_STORAGE_KEY, tid);
}

export function getSavedTaskTid() {
  return localStorage.getItem(TASK_TID_STORAGE_KEY);
}

export function clearSavedTaskTid() {
  localStorage.removeItem(TASK_TID_STORAGE_KEY);
}

export function saveTaskEstimate(estimate: SavedEstimate) {
  localStorage.setItem(TASK_ESTIMATE_STORAGE_KEY, estimate);
}

export function getSavedTaskEstimate() {
  return localStorage.getItem(TASK_ESTIMATE_STORAGE_KEY);
}

export function clearSavedTaskEstimate() {
  localStorage.removeItem(TASK_ESTIMATE_STORAGE_KEY);
}

export { TASK_ESTIMATE_STORAGE_KEY };
