interface StepHeadingProps {
  eyebrow: string
  title: string
  help: string
}

export function StepHeading({ eyebrow, title, help }: StepHeadingProps) {
  return (
    <div className="max-w-[560px] text-center mx-auto mb-[26px]">
      <span className="block text-xs font-semibold uppercase tracking-[0.13em] text-primary mb-3">
        {eyebrow}
      </span>
      <h2 className="font-heading font-bold text-[26px] sm:text-[31px] leading-[1.08] tracking-[-0.025em] text-foreground">
        {title}
      </h2>
      <p className="text-[14.5px] text-muted-foreground leading-relaxed mt-3">
        {help}
      </p>
    </div>
  )
}
