import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LandingPageProps {
  onLogin: (email: string) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-6xl">
        {/* Left side - Hero text */}
        <div className="flex-1 pr-12">
          <div className="border-4 border-black bg-white p-8 shadow-[12px_12px_0_0_#000] mb-8">
            <h1 className="text-6xl font-black mb-4">
              I love<span className="text-blue-500">*</span>
              <br />
              interviews!
            </h1>
          </div>
          
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] mb-8">
            <h2 className="text-2xl font-bold">So lets practice some live!</h2>
          </div>

          <div className="flex items-center">
            <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
            <div className="text-blue-500 text-4xl mr-4">*</div>
              <p className="text-lg font-medium">said with no sarcasm at all...</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-shrink-0">
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] w-96">
            <div className="flex items-center mb-6">
              <div className="text-blue-500 text-6xl mr-4">*</div>
              <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
                <h2 className="text-xl font-bold">Login to your account</h2>
                <p className="text-sm text-gray-600 mt-1">Enter your email below to login to your account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Name of the project"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-black"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="password" className="text-base font-medium">Password</Label>
                  <button className="text-sm text-blue-600 hover:underline">
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Name of the project"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-black"
                />
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                Login
              </Button>

              <Button
                variant="outline"
                className="w-full border-2 border-black"
              >
                Login with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}