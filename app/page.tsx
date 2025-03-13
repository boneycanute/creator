"use client";

import React from "react";
import { TypeformClone } from "@/components/typeform/TypeformClone";

export default function Home() {
  const handleSubmit = (responses: any) => {
    console.log("Form submitted:", responses);
    // Here you would typically send the data to your backend
    alert("Form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <TypeformClone 
        onSubmit={handleSubmit}
      />
    </div>
  );
}
