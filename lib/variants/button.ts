import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground shadow-sm",
          "hover:bg-primary/90 hover:shadow-md",
          "focus-visible:ring-primary/50",
          "active:bg-primary/95"
        ],
        secondary: [
          "bg-secondary text-secondary-foreground border border-border shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md",
          "focus-visible:ring-secondary/50",
          "active:bg-secondary/90"
        ],
        ghost: [
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-accent/50",
          "active:bg-accent/80"
        ],
        danger: [
          "bg-destructive text-destructive-foreground shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md",
          "focus-visible:ring-destructive/50",
          "active:bg-destructive/95"
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-10 px-4 py-2 text-sm rounded-md gap-2",
        lg: "h-12 px-6 text-base rounded-lg gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>