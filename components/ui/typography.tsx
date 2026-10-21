import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn typography patterns: semantic elements, accessible defaults, className/props forwarding.
type HeadingProps = React.ComponentPropsWithoutRef<"h1">;
type H2Props = React.ComponentPropsWithoutRef<"h2">;
type H3Props = React.ComponentPropsWithoutRef<"h3">;
type ParagraphProps = React.ComponentPropsWithoutRef<"p">;
type CodeProps = React.ComponentPropsWithoutRef<"code">;

export function H1({ className, ...props }: HeadingProps) {
  return <h1 className={cn("text-4xl font-semibold tracking-[-0.02em] leading-tight text-balance sm:text-5xl", className)} {...props} />;
}
export function H2({ className, ...props }: H2Props) {
  return <h2 className={cn("text-3xl font-semibold tracking-tight leading-tight text-balance", className)} {...props} />;
}
export function H3({ className, ...props }: H3Props) {
  return <h3 className={cn("text-xl font-semibold tracking-tight leading-snug text-balance", className)} {...props} />;
}
export function Lead({ className, ...props }: ParagraphProps) {
  return <p className={cn("text-lg text-muted-foreground leading-relaxed text-pretty", className)} {...props} />;
}
export function P({ className, ...props }: ParagraphProps) {
  return <p className={cn("text-base leading-7 text-pretty", className)} {...props} />;
}
export function Muted({ className, ...props }: ParagraphProps) {
  return <p className={cn("text-sm leading-6 text-muted-foreground text-pretty", className)} {...props} />;
}
export function InlineCode({ className, ...props }: CodeProps) {
  return <code className={cn("relative rounded bg-muted px-[0.35rem] py-[0.2rem] font-mono text-sm font-medium", className)} {...props} />;
}
