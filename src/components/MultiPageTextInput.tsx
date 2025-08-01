import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextInputPage {
  id: string;
  title: string;
  placeholder: string;
  maxLength: number;
  optional?: boolean;
}

interface MultiPageTextInputProps {
  pages: TextInputPage[];
  values: Record<string, string>;
  onChange: (pageId: string, value: string) => void;
  onComplete: () => void;
  className?: string;
}

export function MultiPageTextInput({ 
  pages, 
  values, 
  onChange, 
  onComplete, 
  className 
}: MultiPageTextInputProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = pages[currentPage];
  const currentValue = values[currentPageData.id] || '';
  const isValid = currentPageData.optional || currentValue.trim().length > 0;
  const wordCount = currentValue.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = Math.floor(currentPageData.maxLength * 0.75); // Rough word estimate

  return (
    <div className={cn("border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {currentPageData.title}
          {currentPageData.optional && (
            <span className="text-gray-500 text-lg ml-2">(Optional)</span>
          )}
        </h2>
        <div className="text-sm text-gray-600">
          {currentPage + 1} of {pages.length}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={currentPageData.id} className="text-base font-medium">
            Fill out the fields below so we can get a better sense of what we are dealing with.
          </Label>
        </div>

        <Textarea
          id={currentPageData.id}
          placeholder={currentPageData.placeholder}
          value={currentValue}
          onChange={(e) => onChange(currentPageData.id, e.target.value)}
          className="min-h-[200px] border-2 border-black text-base resize-none"
          maxLength={currentPageData.maxLength}
        />

        <div className="flex justify-between text-sm text-gray-600">
          <span>~{wordCount} words (max ~{maxWords})</span>
          <span>{currentValue.length}/{currentPageData.maxLength} characters</span>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          variant="outline"
          className="border-2 border-black"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0_0_#000]"
        >
          {currentPage === pages.length - 1 ? 'Complete' : 'Next'}
          {currentPage < pages.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}