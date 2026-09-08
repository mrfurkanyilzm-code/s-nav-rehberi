import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { StudentProfileData } from "@/lib/onboardingStore";
import { Capacitor } from "@capacitor/core";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const GOOGLE_CLIENT_ID = "685687712244-s3m0aqa91masb83f72mid4audujqsm99.apps.googleusercontent.com";

export function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Telefon SMS Doğrulama Aşaması
  const [phoneStep, setPhoneStep] = useState<"input" | "verify">("input");
  const [verificationCode, setVerificationCode] = useState("");

  // Onboarding Akışı State'i
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Form State'leri
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ogrenci" | "koc">("ogrenci");

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@codetrix-studio/capacitor-google-auth")
        .then(({ GoogleAuth }) => {
          GoogleAuth.initialize({
            clientId: GOOGLE_CLIENT_ID,
            scopes: ["profile", "email"],
            grantOfflineAccess: true,
          });
        })
        .catch((err) => console.warn("GoogleAuth init:", err));
    }
  }, []);

  const saveSession = (userData: object) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("user_session", JSON.stringify(userData));
  };

  const handlePostAuthRedirect = () => {
    if (role === "koc") {
      navigate({ to: "/koc-paneli" as any });
    } else if (!isLogin) {
      setShowOnboarding(true);
    } else {
      navigate({ to: "/" });
    }
  };

  // Web ortamı için Google Identity Services (GSI) Token Client fallback
  const handleWebGoogleLogin = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined" || !(window as any).google?.accounts?.oauth2) {
        reject(new Error("Google SDK henüz yüklenmedi. Lütfen sayfayı yenileyin."));
        return;
      }

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }

          try {
            // Access token ile profil bilgilerini çek
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await res.json();

            saveSession({
              name: userInfo.name || "Öğrenci",
              email: userInfo.email,
              role: role,
              photoUrl: userInfo.picture,
            });

            handlePostAuthRedirect();
            resolve();
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
      });

      client.requestAccessToken();
    });
  };

  const handleOAuthLogin = async (provider: "Google" | "Apple") => {
    if (provider === "Apple") {
      alert("Apple ile giriş iOS cihazlarda aktiftir.");
      return;
    }

    try {
      setIsLoading(true);

      // Cihaz native (Android / iOS) ise Capacitor eklentisini çalıştır
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
        const googleUser = await GoogleAuth.signIn();

        const displayName =
          googleUser.name ||
          [googleUser.givenName, googleUser.familyName].filter(Boolean).join(" ") ||
          "Öğrenci";

        saveSession({
          name: displayName,
          email: googleUser.email,
          role: role,
          photoUrl: googleUser.imageUrl,
          idToken: googleUser.authentication?.idToken,
        });

        handlePostAuthRedirect();
      } else {
        // Web / Cursor Browser Tab ortamı için popup fallback
        await handleWebGoogleLogin();
      }
    } catch (err: any) {
      console.error("Google Giriş Hatası:", err);
      const errorMsg = err?.message || JSON.stringify(err);
      if (
        errorMsg !== "canceled" &&
        !errorMsg.includes("popup_closed_by_user") &&
        !errorMsg.includes("access_denied")
      ) {
        alert(`Google Giriş Hatası: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneStep === "input") {
      alert(`Doğrulama kodu ${phone} numarasına gönderildi. (Test kodu: 123456)`);
      setPhoneStep("verify");
      return;
    }

    if (verificationCode !== "123456" && verificationCode.length !== 6) {
      alert("Lütfen geçerli 6 haneli doğrulama kodunu girin (Test için: 123456)");
      return;
    }

    saveSession({
      name: isLogin ? "Öğrenci" : name,
      phone: phone,
      role: role,
    });

    handlePostAuthRedirect();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMethod === "phone") {
      handlePhoneSubmit(e);
      return;
    }

    saveSession({
      name: isLogin ? "Kullanıcı" : name,
      email: email,
      role: isLogin ? "ogrenci" : role,
    });

    handlePostAuthRedirect();
  };

  const handleOnboardingComplete = (_profile: StudentProfileData) => {
    setShowOnboarding(false);
    navigate({ to: "/" });
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
          
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-md">
              🎯
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLogin ? "Tekrar Hoş Geldin" : "Hesap Oluştur"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLogin
                ? "Hedeflerine kaldığın yerden devam et"
                : "Koçluk ve sınav takip yolculuğuna başla"}
            </p>
          </div>

          <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setPhoneStep("input");
              }}
              className={`flex-1 rounded-lg py-2 transition cursor-pointer ${
                isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setPhoneStep("input");
              }}
              className={`flex-1 rounded-lg py-2 transition cursor-pointer ${
                !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <div className="flex justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setPhoneStep("input");
              }}
              className={`font-semibold transition cursor-pointer ${
                authMethod === "email" ? "text-primary underline underline-offset-4" : "text-muted-foreground"
              }`}
            >
              E-Posta ile
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setPhoneStep("input");
              }}
              className={`font-semibold transition cursor-pointer ${
                authMethod === "phone" ? "text-primary underline underline-offset-4" : "text-muted-foreground"
              }`}
            >
              Telefon Numarası ile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && authMethod !== "phone" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}

            {authMethod === "email" ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">E-Posta Adresi</label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Şifre</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </>
            ) : (
              phoneStep === "input" ? (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Telefon Numarası</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    SMS Doğrulama Kodu (6 Haneli)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 w-full text-center tracking-widest text-lg font-bold rounded-xl border border-border bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoneStep("input")}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Numarayı Değiştir
                  </button>
                </div>
              )
            )}

            {/* Beni Hatırla Seçeneği */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                Beni Hatırla
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
            >
              {authMethod === "phone" && phoneStep === "input"
                ? "Doğrulama Kodu Gönder"
                : isLogin
                ? "Giriş Yap"
                : "Hesabı Oluştur ve Başla"}
            </button>
          </form>

          <div className="relative flex items-center justify-center pt-2">
            <div className="w-full border-t border-border"></div>
            <span className="absolute bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              veya sosyal hesapla
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuthLogin("Google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold shadow-sm transition hover:bg-muted/60 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isLoading ? "Bağlanıyor..." : "Google"}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin("Apple")}
              className="flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-xs font-semibold text-background shadow-sm transition hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.56.64-1.05 1.7-0.92 2.72 1 .08 2.02-.47 2.64-1.22z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </>
  );
}