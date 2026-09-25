import { inject, type InjectionKey } from "vue";

export const NAVIGATE_KEY: InjectionKey<(route: string) => void> = Symbol("app-navigate");

export function useNavigate() {
  const navigate = inject(NAVIGATE_KEY);
  return (route: string) => navigate?.(route);
}
