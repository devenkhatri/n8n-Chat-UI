import { cva, type VariantProps } from "class-variance-authority"

export const inputVariants = cva(
  "flex w-full rounded-md border transition-all duration-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
  {
    variants: {
      variant: {
        default: [
          "border-input bg-background",
          "hover:border-ring/50",
          "focus-visible:border-ring"
        ],
        filled: [
          "border-transparent bg-muted",
          "hover:bg-muted/80",
          "focus-visible:bg-background focus-visible:border-ring"
        ],
        outlined: [
          "border-2 border-input bg-transparent",
          "hover:border-ring/50",
          "focus-visible:border-ring"
        ],
      },
      size: {
        sm: "h-8 px-2 text-xs rounded-md gap-1.5",
        md: "h-10 px-3 text-sm rounded-md gap-2",
        lg: "h-12 px-4 text-base rounded-lg gap-2.5",
      },
      state: {
        default: "focus-visible:ring-ring/20",
        error: [
          "border-destructive text-destructive",
          "focus-visible:ring-destructive/20 focus-visible:border-destructive",
          "placeholder:text-destructive/60"
        ],
        success: [
          "border-success text-success",
          "focus-visible:ring-success/20 focus-visible:border-success",
          "placeholder:text-success/60"
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
)

export const inputLabelVariants = cva(
  "text-sm font-medium leading-none transition-colors duration-200",
  {
    variants: {
      state: {
        default: "text-foreground",
        error: "text-destructive",
        success: "text-success",
      },
      required: {
        true: "after:content-['*'] after:ml-1 after:text-destructive",
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      required: false,
    },
  }
)

export const inputHelperVariants = cva(
  "text-xs mt-1.5 transition-colors duration-200 flex items-start gap-1",
  {
    variants: {
      state: {
        default: "text-muted-foreground",
        error: "text-destructive",
        success: "text-success",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export const inputIconVariants = cva(
  "flex-shrink-0 transition-colors duration-200",
  {
    variants: {
      position: {
        left: "absolute left-3 top-1/2 -translate-y-1/2",
        right: "absolute right-3 top-1/2 -translate-y-1/2",
      },
      state: {
        default: "text-muted-foreground",
        error: "text-destructive",
        success: "text-success",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      position: "left",
      state: "default",
      size: "md",
    },
  }
)

export type InputVariants = VariantProps<typeof inputVariants>
export type InputLabelVariants = VariantProps<typeof inputLabelVariants>
export type InputHelperVariants = VariantProps<typeof inputHelperVariants>
export type InputIconVariants = VariantProps<typeof inputIconVariants>