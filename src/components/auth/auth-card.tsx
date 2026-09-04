import Image from "next/image";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-chrome-border bg-card/95 shadow-2xl shadow-black/20 backdrop-blur">
      <CardHeader className="space-y-5 pb-5 text-center">
        <div className="mx-auto flex items-center gap-3 text-left">
          <Image
            src="/pirilight-header-icon.png"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">PiriLight Studio</span>
            <span className="mt-1 text-xs text-muted-foreground">Centro de Comando</span>
          </span>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
