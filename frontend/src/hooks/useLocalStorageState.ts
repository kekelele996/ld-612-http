import { computed, ref } from "vue";

export function useLocalStorageState<T>(rows: T[] = []) {
  const page = ref(1);
  const pageSize = 8;
  const pageRows = computed(() => rows.slice((page.value - 1) * pageSize, page.value * pageSize));
  return { page, pageSize, pageRows, total: rows.length };
}

// 本地持久化读入口：优先 localStorage，缺失或损坏时回退到种子数据。
export function readLocalRows<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // 本地数据损坏时回退种子数据，保证页面可用。
  }
  return seed.map((item) => ({ ...item }));
}

// 本地持久化写入口：所有实体的写操作都经过这里落盘。
export function writeLocalRows<T>(key: string, rows: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // 存储不可用（隐私模式/超限）时静默降级为内存态。
  }
}
