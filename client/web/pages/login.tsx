import Link from 'next/link';
import Button from '@mui/material/Button';
import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#050014]">
      <div className="bg-[#282828] p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl text-white font-bold mb-4">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="border rounded-xl w-full py-2 px-3"
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="border rounded-xl w-full py-2 px-3"
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
          />
        </div>

        <Button variant="contained" fullWidth className="font-sans font-bold rounded-xl bg-[#240090] hover:bg-[#3300CC]">
          Login
        </Button>

        <Link href="/home">
          <Button variant="outlined" fullWidth className="rounded-xl mt-5 border-white text-white hover:border-[#240090]">
            Go to Home
          </Button>
        </Link>
      </div>

      <Link href="/register" className="mt-5">
        <Button variant="contained" fullWidth className="font-sans font-bold rounded-xl bg-[#240090] hover:bg-[#3300CC]">
          New user ?
        </Button>
      </Link>
    </div>
  );
};

export default LoginPage;
