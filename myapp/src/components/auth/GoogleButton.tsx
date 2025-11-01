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
      className="w-full h-12 border-2 border-border hover:border-border/80 hover:bg-muted/50 font-medium rounded-sm"
      onClick={onClick}
      disabled={disabled}
    >
      <FaGoogle className="text-red-500 mr-2" />
      {text}
    </Button>
  );
}
