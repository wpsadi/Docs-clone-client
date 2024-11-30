import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import apiAxios from "@/helpers/axiosInstance";

interface IAuthStore {
  hydrated: boolean;
  accountLoading: boolean;
  accountId: string;
  isLoggedIn: boolean | null;
  reinstateSession(): void;
  logout(): void;
  initiateGitHubAuth(): void;
  setHydrated(): void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set,get) => ({
      hydrated: false,
      accountLoading: false,
      accountId: "",
      isLoggedIn: null,
      initiateGitHubAuth() {
        const baseURL = String(process.env.VITE_API_ENPOINT);
        const url = `${baseURL.substring(1, baseURL.length - 1)}/auth/github`;
        // // console.log(url);
        const authWindow = window.open(url, "_blank", "width=500,height=700");

        if (!authWindow) {
          alert("Please allow popups for this website");
          return;
        }

        // Polling the new window to check if authentication is complete
        const interval = setInterval(async () => {
          if (authWindow.closed) {
            clearInterval(interval);
            // Authentication flow completed, reload or check authentication status
            console.log("Authentication flow finished.");
            // Call API to check if user is authenticated (cookie should now be set)
            await get().reinstateSession();
            await window.location.reload();
          }
        }, 1000);
      },
      async reinstateSession() {
        try {
          set({ accountLoading: true });
          apiAxios
            .get("/auth/me")
            .then((result) => {
              const data = result.data;
              // // console.log("Setting account loggedIn Info",data)
              // // console.log(result)

              set({
                accountId: data.id,
                isLoggedIn: true,
                accountLoading: false,
              });
            })
            .catch(() => {
              // // console.log("Clearing account loggedIn Info")
              set({ accountId: "", isLoggedIn: false, accountLoading: false });
            });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch {
          set({ accountId: "", isLoggedIn: false });
          // console.log(err?.message)
        }
      },
      logout() {
        const baseURL = String(process.env.VITE_API_ENPOINT);
        const url = `${baseURL.substring(1, baseURL.length - 1)}/auth/logout`;
        // // console.log(url);
        window.location.href = url;
      },
      setHydrated() {
        set({ hydrated: true });
      },
    })),
    {
      name: "auth",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);
