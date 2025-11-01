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
      className="w-full h-11 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
      onClick={onClick}
      disabled={disabled}
    >
      <FaGoogle className="text-red-500 text-sm mr-2" />
      {text}
    </Button>
  );
}
