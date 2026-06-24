import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  min?: number;
  max?: number;
  value?: number;
  onValueChange?: (val: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 10, max = 100, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (onValueChange) {
        onValueChange(val);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg bg-border accent-coral focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
