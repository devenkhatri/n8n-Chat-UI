import { cva, type VariantProps } from "class-variance-authority"

export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: [
          "border-border bg-card",
          "hover:shadow-sm"
        ],
        elevated: [
          "border-border bg-card shadow-md",
          "hover:shadow-lg hover:-translate-y-0.5"
        ],
        outlined: [
          "border-2 border-border bg-transparent",
          "hover:border-ring/50 hover:bg-card/50"
        ],
        ghost: [
          "border-transparent bg-transparent",
          "hover:bg-card/50 hover:border-border"
        ],
        interactive: [
          "border-border bg-card cursor-pointer",
          "hover:shadow-md hover:border-ring/50",
          "active:scale-[0.98] active:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ],
      },
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      size: "auto",
    },
  }
)

// Card header variants
export const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3", 
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      padding: "md",
    },
  }
)

// Card content variants
export const cardContentVariants = cva(
  "",
  {
    variants: {
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3",
        md: "p-4", 
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      padding: "md",
    },
  }
)

// Card footer variants
export const cardFooterVariants = cva(
  "flex items-center",
  {
    variants: {
      padding: {
        none: "p-0",
        xs: "p-2",
        sm: "p-3",
        md: "p-4",
        lg: "p-6", 
        xl: "p-8",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
    },
    defaultVariants: {
      padding: "md",
      justify: "start",
    },
  }
)

export type CardVariants = VariantProps<typeof cardVariants>
export type CardHeaderVariants = VariantProps<typeof cardHeaderVariants>
export type CardContentVariants = VariantProps<typeof cardContentVariants>
export type CardFooterVariants = VariantProps<typeof cardFooterVariants>