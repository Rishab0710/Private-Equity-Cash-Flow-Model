'use client';

import { useState } from 'react';
import { StatementUploader } from '@/components/app/extraction/statement-uploader';
import { ExtractionReview } from '@/components/app/extraction/extraction-review';
import { type ExtractStatementDataOutput } from '@/ai/flows/statement-data-extraction';
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

    // Simulate a delay for the extraction process to show a loading state
    await new Promise(resolve => setTimeout(resolve, 1500));

    const demoExtractionResult: ExtractStatementDataOutput = {
      capitalCalls: [
        { value: 1250000, period: 'Q4 2023', confidence: 0.98, sourcePage: 2 },
        { value: 1500000, period: 'Q3 2023', confidence: 0.99, sourcePage: 2 },
      ],
      distributions: [
         { value: 75000, period: 'Q4 2023', confidence: 0.95, sourcePage: 3 },
      ],
      navValues: [
        { value: 45000000, period: 'Q4 2023', confidence: 1.0, sourcePage: 1 },
      ],
      feesAndExpenses: [
        { value: 225000, period: 'Q4 2023', confidence: 0.88, sourcePage: 4 },
      ],
      remainingUnfundedCommitment: {
        value: 55000000, period: 'Q4 2023', confidence: 0.99, sourcePage: 1
      },
      dpi: {
        value: 0.85, period: 'Q4 2023', confidence: 0.92, sourcePage: 1
      },
      tvpi: {
        value: 1.2, period: 'Q4 2023', confidence: 0.93, sourcePage: 1
      },
      irr: {
        value: 18.5, period: 'Q4 2023', confidence: 0.85, sourcePage: 1
      },
    };

    setExtractionResult(demoExtractionResult);
    setIsLoading(false);
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
    
