"use client";

import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

interface GoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
}

export function GoogleButton({ 
  onClick, 
  disabled = false, 
  text = "Continue with Google" 
}: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-14 border-2 border-border hover:border-primary/50 hover:bg-muted/50 font-semibold rounded-sm shadow-soft hover:shadow-medium transition-all"
      onClick={onClick}
      disabled={disabled}
    >
      <FaGoogle className="text-red-500 mr-3 text-lg" />
      {text}
    </Button>
  );
}
