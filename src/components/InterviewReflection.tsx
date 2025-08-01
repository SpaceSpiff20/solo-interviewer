import { FeedbackMoment } from '@/types/interview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InterviewReflectionProps {
  summary: string;
  feedbackMoments: FeedbackMoment[];
  onRetryMoment: (momentId: string) => void;
  onStartNewInterview: () => void;
  className?: string;
}

export function InterviewReflection({ 
  summary, 
  feedbackMoments, 
  onRetryMoment, 
  onStartNewInterview,
  className 
}: InterviewReflectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
        <h1 className="text-3xl font-bold mb-6">Post interview reflection</h1>
        
        <div className="border-4 border-black bg-white p-4 mb-6">
          <h2 className="text-xl font-bold mb-3">Interview Summary</h2>
          <p className="text-gray-800 leading-relaxed">{summary}</p>
        </div>

        <div className="border-4 border-black bg-white p-6">
          <h2 className="text-2xl font-bold mb-6">Specific Moments</h2>
          
          <div className="space-y-4">
            {feedbackMoments.map((moment) => (
              <div 
                key={moment.id}
                className={cn(
                  "border-4 border-black p-4 shadow-[4px_4px_0_0_#000]",
                  moment.type === 'strength' ? 'bg-green-100' : 'bg-blue-100'
                )}
              >
                <h3 className="font-bold mb-2">
                  At [{moment.timestamp}] you were asked [{moment.question}].
                </h3>
                <p className="text-sm mb-4">
                  You responded with [{moment.userResponse}]. {moment.feedback}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onRetryMoment(moment.id)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-black"
                  >
                    Ignore
                  </Button>
                  <Button
                    onClick={() => onRetryMoment(moment.id)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000]"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={onStartNewInterview}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl py-6 px-12 border-2 border-black shadow-[4px_4px_0_0_#000]"
          >
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}