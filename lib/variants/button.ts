import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none tracking-tight",
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
          "hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5",
          "focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
          "active:from-blue-800 active:to-indigo-800 active:translate-y-0 active:shadow-lg",
          "dark:shadow-blue-400/20 dark:hover:shadow-blue-400/25"
        ],
        secondary: [
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm",
          "hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5",
          "focus-visible:ring-gray-500/50 focus-visible:ring-offset-2",
          "active:bg-gray-100 dark:active:bg-gray-600 active:translate-y-0 active:shadow-sm"
        ],
        ghost: [
          "text-gray-700 dark:text-gray-300",
          "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
          "focus-visible:ring-gray-500/50 focus-visible:ring-offset-2",
          "active:bg-gray-200 dark:active:bg-gray-700"
        ],
        danger: [
          "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25",
          "hover:from-red-700 hover:to-pink-700 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5",
          "focus-visible:ring-red-500/50 focus-visible:ring-offset-2",
          "active:from-red-800 active:to-pink-800 active:translate-y-0 active:shadow-lg",
          "dark:shadow-red-400/20 dark:hover:shadow-red-400/25"
        ],
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg gap-1.5",
        md: "h-11 px-5 py-2.5 text-sm rounded-xl gap-2",
        lg: "h-13 px-7 text-base rounded-xl gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>