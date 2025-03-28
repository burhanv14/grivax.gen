'use client';

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { CheckCircle, Loader2 } from "lucide-react";

interface FormWithReCaptchaProps {
  className?: string;
}

const ReCaptchaElement: React.FC<FormWithReCaptchaProps> = ({ className }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not yet available");
      return;
    }

    setIsVerifying(true);
    setIsVerified(false);

    try {
      const token = await executeRecaptcha("form_submit");
      const response = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
      } else {
        console.error("reCAPTCHA verification failed:", data);
      }
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`rounded-md border bg-muted/30 p-3 flex items-center justify-between ${className || ""}`}> 
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div
          className={`h-5 w-5 border rounded flex items-center justify-center cursor-pointer transition-all ${
            isVerified ? "border-green-500 bg-green-500" : "border-gray-500 bg-white"
          }`}
          onClick={!isVerifying && !isVerified ? handleSubmit : undefined}
        >
          {isVerifying ? (
            <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
          ) : isVerified ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : null}
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground">I'm not a robot</span>
      </div>
      <div className="flex flex-col items-end">
        <svg width="24" height="24" viewBox="0 0 24 24" className="h-6 w-6 text-muted-foreground/50">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8 8s8-3.59 8-8s-3.59 8-8 8z"
          />
        </svg>
        <span className="mt-1 text-[8px] sm:text-[10px] text-muted-foreground/70">reCAPTCHA</span>
      </div>
    </div>
  );
};

export default ReCaptchaElement;
