
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText } from 'lucide-react';

type Props = {
  onFileSelect: (file: File) => void;
  onExtract: () => void;
  file: File | null;
};

export function StatementUploader({ onFileSelect, onExtract, file }: Props) {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          onFileSelect(event.target.files[0]);
        }
    };

    const dropzoneProps = {
        onDragOver: (e: React.DragEvent) => e.preventDefault(),
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFileSelect(e.dataTransfer.files[0]);
            }
        }
    }
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Statement</CardTitle>
        <CardDescription>
          Upload a quarterly PDF statement to automatically extract financial data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
            className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
            {...dropzoneProps}
        >
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            <label htmlFor="file-upload" className="font-semibold text-primary cursor-pointer">
                Click to upload
            </label> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PDF (up to 10MB)</p>
          <Input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf"
          />
        </div>
        
        {file && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <Button onClick={onExtract}>Extract Data</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
