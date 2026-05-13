import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../stores/useAuthStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import type { Role } from "../types/domain";

const schema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(4, "Min 4 caratteri"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const nav = useNavigate();
  const loginAs = useAuthStore((s) => s.loginAs);
  const teamsMap = useTeamsStore((s) => s.teams);
  const teams = Object.values(teamsMap).sort((a, b) => a.name.localeCompare(b.name, "it"));
  const [role, setRole] = useState<Role>("analyst");
  const { register, handleSubmit, formState, setValue } = useForm<FormData>({
    defaultValues: { email: "analyst@demo.it", password: "demo" },
  });

  function fillDemo(r: Role) {
    setRole(r);
    setValue("email", r === "analyst" ? "analyst@demo.it" : "viewer@demo.it");
    setValue("password", "demo");
  }

  function onSubmit(data: FormData) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) return;
    const teamId = role === "team_viewer" ? teams[0]?.id : undefined;
    loginAs(role, { email: data.email, teamId });
    nav(role === "team_viewer" ? "/team-home" : "/");
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] border border-brand-red/30"
        style={{ transform: "rotate(45deg)" }}
      />
      <div className="relative w-full max-w-md bg-bg-panel border border-border p-8">
        <span className="absolute top-0 left-0 h-[3px] w-16 bg-brand-red" />
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 clip-mark flex items-center justify-center font-cond font-extrabold text-white text-xl"
            style={{ background: "linear-gradient(135deg,#C8102E,#E11D3C)" }}
          >
            S
          </div>
          <div>
            <div className="font-cond font-bold text-xl uppercase tracking-wider2">
              SCHERMA<span className="text-brand-red-hot">·</span>MA
            </div>
            <div className="text-xs text-text-dim">Match Analyst — accedi</div>
          </div>
        </div>

        <div className="flex gap-1 mb-5">
          {(["analyst", "team_viewer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => fillDemo(r)}
              className={
                "flex-1 px-3 py-2 text-xs font-cond font-semibold uppercase tracking-widest2 border " +
                (role === r
                  ? "bg-brand-red border-brand-red text-white"
                  : "border-border text-text-dim hover:text-white")
              }
            >
              {r === "analyst" ? "Demo Analyst" : "Demo Team Viewer"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="[&_label_span]:text-text-dim [&_input]:bg-bg-dark [&_input]:border-border [&_input]:text-white">
            <Input label="Email" type="email" {...register("email")} error={formState.errors.email?.message} />
          </div>
          <div className="[&_label_span]:text-text-dim [&_input]:bg-bg-dark [&_input]:border-border [&_input]:text-white">
            <Input label="Password" type="password" {...register("password")} error={formState.errors.password?.message} />
          </div>
          <Button type="submit" className="mt-2 w-full justify-center">
            Entra come {role === "analyst" ? "Analyst" : "Team Viewer"}
          </Button>
          <div className="text-[11px] text-text-dim mt-2 text-center">
            Dati mockati · nessuna autenticazione reale
          </div>
        </form>
      </div>
    </div>
  );
}
