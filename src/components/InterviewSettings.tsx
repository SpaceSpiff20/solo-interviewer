import { InterviewSettings as IInterviewSettings } from '@/types/interview';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface InterviewSettingsProps {
  settings: IInterviewSettings;
  onChange: (settings: IInterviewSettings) => void;
  onStart: () => void;
  className?: string;
}

export function InterviewSettings({ settings, onChange, onStart, className }: InterviewSettingsProps) {
  const updateSetting = <K extends keyof IInterviewSettings>(
    key: K,
    value: IInterviewSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className={cn("border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]", className)}>
      <h2 className="text-2xl font-bold mb-2">Interview process customization</h2>
      <p className="text-gray-600 mb-6">What do you want your interview to be like?</p>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">
            Interview Duration (minutes)
          </Label>
          <div className="px-3">
            <Slider
              value={[settings.duration]}
              onValueChange={([value]) => updateSetting('duration', value)}
              min={2}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>2</span>
              <span className="font-medium">{settings.duration}</span>
              <span>30</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Interview Language</Label>
          <Select 
            value={settings.language} 
            onValueChange={(value) => updateSetting('language', value)}
          >
            <SelectTrigger className="border-2 border-black bg-blue-500 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Interviewer Voice</Label>
          <Select 
            value={settings.voice} 
            onValueChange={(value) => updateSetting('voice', value)}
          >
            <SelectTrigger className="border-2 border-black bg-blue-500 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oliver">Oliver</SelectItem>
              <SelectItem value="geoge">Geoge</SelectItem>
              <SelectItem value="henry">Henry</SelectItem>
              <SelectItem value="lisa">Lisa</SelectItem>
              <SelectItem value="emily">Emily</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            All voices use Speechify for high-quality audio synthesis
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Allow interview to end early</Label>
              <p className="text-sm text-gray-600">If the interviewer feels they can end the interview early, they can.</p>
            </div>
            <Switch
              checked={settings.allowEarlyEnd}
              onCheckedChange={(checked) => updateSetting('allowEarlyEnd', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Live feedback</Label>
              <p className="text-sm text-gray-600">Get suggestions on what to talk about if you are blanking on what to say.</p>
            </div>
            <Switch
              checked={settings.liveFeedback}
              onCheckedChange={(checked) => updateSetting('liveFeedback', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Time Remaining</Label>
              <p className="text-sm text-gray-600">Displays time remaining during interview</p>
            </div>
            <Switch
              checked={settings.timeRemaining}
              onCheckedChange={(checked) => updateSetting('timeRemaining', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Post interview reflection</Label>
              <p className="text-sm text-gray-600">Receive notes on your interview and have the option to save it for later study.</p>
              <p className="text-xs text-gray-500 mt-1">Note, this will take up significantly more LLM token usage.</p>
            </div>
            <Switch
              checked={settings.postReflection}
              onCheckedChange={(checked) => updateSetting('postReflection', checked)}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white text-xl py-6 border-2 border-black shadow-[4px_4px_0_0_#000]"
      >
        Start the Interview
      </Button>
    </div>
  );
}