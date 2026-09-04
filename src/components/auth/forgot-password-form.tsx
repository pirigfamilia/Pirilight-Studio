"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormMessage } from "./form-message";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage message={state.message} status={state.status} />
      <div className="space-y-2">
        <Label htmlFor="email">Email da conta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email?.[0] && (
          <p className="text-xs text-destructive-foreground">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "A enviar…" : "Enviar instruções"}
      </Button>
      <Button variant="link" className="w-full" asChild>
        <Link href="/login">Voltar ao login</Link>
      </Button>
    </form>
  );
}
