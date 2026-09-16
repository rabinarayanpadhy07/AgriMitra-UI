import React from 'react';

export const PasswordStrengthMeter = ({ password = '' }) => {
  if (!password) return null;

  const requirements = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&#^()_+=\-[\]{}|~`]/.test(password),
  ];

  const score = requirements.filter(Boolean).length;

  const getStrengthLabel = () => {
    if (score <= 2) return { text: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-600' };
    if (score <= 4) return { text: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Strength:</span>
        <span className={`font-semibold ${strength.textCol}`}>{strength.text}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 transition-all duration-300 ${
              score >= level ? strength.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
