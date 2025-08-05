import { APIKeys } from '@/types/interview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface APIKeysFormProps {
  apiKeys: APIKeys;
  onChange: (keys: APIKeys) => void;
  className?: string;
}

export function APIKeysForm({ apiKeys, onChange, className }: APIKeysFormProps) {
  const updateKey = <K extends keyof APIKeys>(key: K, value: string) => {
    onChange({ ...apiKeys, [key]: value });
  };

  const isValid = apiKeys.deepgram && apiKeys.openai && apiKeys.speechify;

  return (
    <div className={cn("border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]", className)}>
      <h2 className="text-2xl font-bold mb-2">API Keys</h2>
      <p className="text-gray-600 mb-6">You'll need OpenAI, Deepgram, and Speechify API keys.</p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="openai" className="text-base font-medium">OpenAI API key:</Label>
          <Input
            id="openai"
            type="password"
            placeholder="Paste API key here"
            value={apiKeys.openai}
            onChange={(e) => updateKey('openai', e.target.value)}
            className="border-2 border-black"
          />
        </div>

        <div>
          <Label htmlFor="deepgram" className="text-base font-medium">Deepgram API key:</Label>
          <Input
            id="deepgram"
            type="password"
            placeholder="Paste API key here"
            value={apiKeys.deepgram}
            onChange={(e) => updateKey('deepgram', e.target.value)}
            className="border-2 border-black"
          />
        </div>

        <div>
          <Label htmlFor="speechify" className="text-base font-medium">Speechify API key:</Label>
          <Input
            id="speechify"
            type="password"
            placeholder="Paste API key here"
            value={apiKeys.speechify}
            onChange={(e) => updateKey('speechify', e.target.value)}
            className="border-2 border-black"
          />
          <p className="text-sm text-gray-500 mt-1">Speechify provides higher quality voices for the interviewer</p>
        </div>
      </div>

      {!isValid && (
        <p className="text-red-600 text-sm mt-4">OpenAI, Deepgram, and Speechify API keys are required to proceed.</p>
      )}
    </div>
  );
}