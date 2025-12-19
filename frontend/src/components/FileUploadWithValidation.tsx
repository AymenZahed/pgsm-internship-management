import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadWithValidationProps {
  id: string;
  label: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  file: File | null;
  onFileChange: (file: File | null) => void;
  description?: string;
}

const DEFAULT_ALLOWED_TYPES = ["application/pdf"];
const DEFAULT_MAX_SIZE_MB = 5;

export function FileUploadWithValidation({
  id,
  label,
  required = false,
  accept = ".pdf",
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  file,
  onFileChange,
  description,
}: FileUploadWithValidationProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (selectedFile: File): boolean => {
    setError(null);

    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      const errorMsg = `Only PDF files are allowed. Received: ${selectedFile.type || "unknown type"}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Check file size
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      const errorMsg = `File size must be under ${maxSizeMB}MB. Current: ${sizeMB.toFixed(2)}MB`;
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      onFileChange(null);
      setError(null);
      return;
    }

    if (validateFile(selectedFile)) {
      onFileChange(selectedFile);
      toast.success(`${selectedFile.name} uploaded successfully`);
    } else {
      onFileChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive/50 bg-destructive/5",
          !isDragging && !error && "hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />
        
        {file ? (
          <div className="flex items-center justify-between p-2 bg-success/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-success truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={removeFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label htmlFor={id} className="cursor-pointer block">
            <div className="space-y-2">
              <Upload className={cn(
                "w-8 h-8 mx-auto",
                error ? "text-destructive" : "text-muted-foreground"
              )} />
              <p className="text-sm text-muted-foreground">
                {description || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF only (max {maxSizeMB}MB)
              </p>
            </div>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
