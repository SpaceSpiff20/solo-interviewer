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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-6xl">
        {/* Left side - Hero text */}
        <div className="flex-1 pr-12">
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] mb-6 transform -rotate-1">
            <h1 className="text-6xl font-black">
              I love<span className="text-pink-500">*</span> interviews!
            </h1>
          </div>
          
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] mb-6 transform rotate-0.5">
            <h2 className="text-2xl font-bold">so lets practice some live!</h2>
          </div>

          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] w-fit">
            <p className="text-lg font-medium">
              <span className="text-pink-500">*</span> said with no sarcasm at all...
            </p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-shrink-0">
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] w-96">
            <h2 className="text-2xl font-bold mb-2">Login to your account</h2>
            <p className="text-sm text-gray-600 mb-6">Enter your email below to login to your account</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-black mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-black mt-1"
                />
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 border-2 border-black shadow-[4px_4px_0_0_#000] mt-6"
              >
                Login
              </Button>

              <Button
                variant="outline"
                className="w-full border-2 border-black bg-white"
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