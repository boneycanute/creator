"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Upload, X, FileText, File } from "lucide-react";

interface FileUploadInputProps {
  questionId: string;
  placeholder?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  questionId,
  placeholder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setResponse, getCurrentResponse } = useAgentFormStore();
  const currentResponse = getCurrentResponse();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize files from current response if available
  React.useEffect(() => {
    if (currentResponse?.answer) {
      try {
        // Convert the answer to UploadedFile[] if it's not already
        const answerFiles = Array.isArray(currentResponse.answer) 
          ? currentResponse.answer as unknown as UploadedFile[]
          : [];
        setFiles(answerFiles);
      } catch (error) {
        console.error("Error parsing file data:", error);
        setFiles([]);
      }
    }
  }, [currentResponse]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
      
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      setResponse(questionId, updatedFiles as unknown as string[]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
      
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      setResponse(questionId, updatedFiles as unknown as string[]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    setResponse(questionId, updatedFiles as unknown as string[]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('docx')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="w-full">
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
              : "border-black/30 dark:border-white/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.docx,.doc,.txt"
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-black/60 dark:text-white/60" />
          
          <h3 className="text-lg font-medium mb-2">
            Drag and drop files here
          </h3>
          
          <p className="text-sm text-black/60 dark:text-white/60 mb-4">
            {placeholder || "Upload PDF, DOCX, or TXT files"}
          </p>
          
          <motion.button
            type="button"
            onClick={triggerFileInput}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Select Files
          </motion.button>
        </div>
        
        {files.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-medium mb-3">Uploaded Files ({files.length})</h4>
            
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-black/60 dark:text-white/60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.div
          className="mt-6 text-xs text-black/60 dark:text-white/60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
        >
          <span>Press</span>{" "}
          <kbd className="mx-1 px-1.5 py-0.5 border border-black/60 dark:border-white/60 text-xs">
            Enter
          </kbd>{" "}
          <span>to continue</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FileUploadInput;
