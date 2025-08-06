import { Button } from '@/components/ui/button';
import { MultiPageTextInput } from '@/components/MultiPageTextInput';
import { InterviewData } from '@/types/interview';

const textInputPages = [
  {
    id: 'jobDescription',
    title: 'Job details, please:',
    placeholder: 'Paste job description info here.',
    maxLength: 2000,
  },
  {
    id: 'resume',
    title: 'Paste Resume / CV',
    placeholder: 'Paste your resume/CV content here.',
    maxLength: 1500,
  },
  {
    id: 'coverLetter',
    title: 'Paste Cover Letter',
    placeholder: 'Paste your cover letter content here.',
    maxLength: 1000,
    optional: true,
  },
];

interface InterviewInfoProps {
  interviewData: InterviewData;
  onInterviewDataChange: (data: InterviewData) => void;
  onNext: () => void;
}

export function InterviewInfo({ interviewData, onInterviewDataChange, onNext }: InterviewInfoProps) {
  const handleTextChange = (pageId: string, value: string) => {
    onInterviewDataChange({ ...interviewData, [pageId]: value });
  };

  const handleComplete = () => {
    onNext();
  };

  const hasRequiredData = interviewData.jobDescription && interviewData.resume;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Information */}
          <div className="space-y-6">
            {/* Top Box - Welcome Text */}
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] transform rotate-1">
              <h1 className="text-4xl font-bold mb-2">
                Let's get to know{' '}
                <span className="text-pink-400">you</span>
              </h1>
              <h2 className="text-4xl font-bold">
                and what you are applying for.
              </h2>
            </div>

            {/* Bottom Box - Requirements */}
            <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] transform -rotate-1">
              <p className="text-lg leading-relaxed">
                In order to create a custom tailored interview experience, we are going to need the job description, your resume, and optionally a cover letter (if you needed to write one).
              </p>
            </div>
          </div>

          {/* Right Section - Form */}
          <MultiPageTextInput
              pages={textInputPages}
              values={interviewData as unknown as Record<string, string>}
              onChange={handleTextChange}
              onComplete={handleComplete}
            />
        </div>
      </div>
    </div>
  );
} 