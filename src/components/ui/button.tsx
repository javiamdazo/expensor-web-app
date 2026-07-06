import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm text-sm font-bold transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary:
          'bg-secondary text-secondary-foreground border border-secondary-border hover:bg-secondary/80',
        destructive: 'bg-destructive-bg text-destructive-foreground hover:opacity-90',
        ghost: 'bg-transparent hover:bg-accent text-foreground',
        ghostDanger: 'bg-transparent text-danger-text hover:underline',
        link: 'bg-transparent text-danger-text hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-sm px-3.5 text-[12.5px]',
        xs: 'h-7 rounded-sm px-3 text-xs',
        inline: 'h-auto p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
    compoundVariants: [
      { variant: ['link', 'ghostDanger'], size: 'default', className: 'h-auto p-0' },
    ],
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
