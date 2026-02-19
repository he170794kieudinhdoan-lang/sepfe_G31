
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center  border-yellow-400 hover:bg-yellow-400 hover:scale-105 hover:text-yellow-100 active:scale-95 hover:cursor-pointer active:bg-yellow-600 justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
    {
      variants: {
        variant: {
          default:
            "bg-yellow-400 text-black hover:bg-yellow-500",
          destructive:
            "bg-red-500 text-white hover:bg-red-600",
          outline:
            "border border-yellow-400 text-yellow-500 hover:bg-yellow-50",
          secondary:
            "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
          ghost:
            "hover:bg-yellow-50 text-yellow-600",
          link:
            "text-yellow-500 underline-offset-4 hover:underline",
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

const Button2 = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})
Button2.displayName = "Button"

export { Button2, buttonVariants }
