import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackSuggestion {
  id: string;
  title: string;
  description: string;
}

interface LiveFeedbackProps {
  suggestions: FeedbackSuggestion[];
  onAccept: (suggestionId: string) => void;
  onIgnore: (suggestionId: string) => void;
  className?: string;
}

export function LiveFeedback({ suggestions, onAccept, onIgnore, className }: LiveFeedbackProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-bold">Live Feedback:</h3>
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="border-4 border-black bg-blue-100 p-4 shadow-[4px_4px_0_0_#000]">
          <h4 className="font-bold mb-2">{suggestion.title}</h4>
          <p className="text-sm mb-4">{suggestion.description}</p>
          <div className="flex gap-2">
            <Button
              onClick={() => onIgnore(suggestion.id)}
              variant="outline"
              size="sm"
              className="border-2 border-black"
            >
              Ignore
            </Button>
            <Button
              onClick={() => onAccept(suggestion.id)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000]"
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}