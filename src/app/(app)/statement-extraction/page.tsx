
'use client';

import { useState } from 'react';
import { StatementUploader } from '@/components/app/extraction/statement-uploader';
import { ExtractionReview } from '@/components/app/extraction/extraction-review';
import { extractStatementData, type ExtractStatementDataOutput } from '@/ai/flows/statement-data-extraction';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function StatementExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractStatementDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setExtractionResult(null);
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const pdfDataUri = reader.result as string;
        const result = await extractStatementData({ pdfDataUri });
        setExtractionResult(result);
      } catch (error) {
        console.error('Extraction failed:', error);
        toast({
          variant: 'destructive',
          title: 'Extraction Failed',
          description: 'Could not extract data from the PDF. Please try another file.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      console.error('File could not be read.');
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an error reading your file. Please try again.',
      });
      setIsLoading(false);
    };
  };
  
  const handleApprove = (approvedResult: ExtractStatementDataOutput) => {
    // Logic to apply data to model
    console.log('Approved:', approvedResult);
    toast({
      title: 'Data Approved',
      description: 'The extracted data has been applied to the model.',
    });
    setFile(null);
    setExtractionResult(null);
  };
  
  const handleCancel = () => {
    setFile(null);
    setExtractionResult(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Statement Extraction</h1>
      </div>
      
      {!extractionResult && !isLoading && (
        <StatementUploader onFileSelect={handleFileSelect} onExtract={handleExtract} file={file} />
      )}

      {isLoading && <ExtractionLoadingSkeleton />}

      {extractionResult && (
        <ExtractionReview 
          result={extractionResult} 
          onApprove={handleApprove}
          onCancel={handleCancel}
          fileName={file?.name || 'Statement'}
        />
      )}
    </div>
  );
}

const ExtractionLoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-24 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-16 w-full" />
            </div>
        </CardContent>
    </Card>
)
    
