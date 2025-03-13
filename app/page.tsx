"use client";

import React from "react";
import { AgentFormClone } from "@/components/typeform/AgentFormClone";

export default function Home() {
  const handleSubmit = (responses: any) => {
    console.log("Form submitted:", responses);
    alert("AI agent created successfully!");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <AgentFormClone 
        onSubmit={handleSubmit}
      />
    </div>
  );
}
