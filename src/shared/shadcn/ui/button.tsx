import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/shadcn/lib/utils"
import useRipple from "use-ripple-hook";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-primary-foreground shadow hover:bg-blue-500/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-full",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-10 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean,
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
      const [ripple, event] = useRipple({
          color: variant === 'ghost' ? 'rgba(118,170,255,0.24)' : "rgba(255, 255, 255, .3)"
      });

      props.children = props.isLoading ? <>{props.children} <Loader2 className="text-white h-4 ml-2 w-4 animate-spin" /></> : props.children
      props.disabled = props.isLoading || props.disabled

      const newProps = props
      delete newProps.isLoading

      return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ripple || ref}
        onMouseDown={event}
        {...newProps}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
